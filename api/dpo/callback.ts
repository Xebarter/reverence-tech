import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function normalizeBodyString(req: VercelRequest): string {
  const b = req.body;
  if (b == null || b === '') return '';
  if (typeof b === 'string') return b;
  if (Buffer.isBuffer(b)) return b.toString('utf8');
  return '';
}

function queryParam(req: VercelRequest, key: string): string {
  const q = req.query?.[key];
  if (Array.isArray(q)) return String(q[0] ?? '').trim();
  return String(q ?? '').trim();
}

/**
 * DPO may call BackURL with query string, form fields, and/or XML body.
 * Mirrors supabase/functions/dpo-service-payment-callback/index.ts
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bodyText = normalizeBodyString(req);
  const bodyObj =
    req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? (req.body as Record<string, unknown>)
      : null;

  const pick = (...keys: string[]): string => {
    for (const key of keys) {
      const fromQ = queryParam(req, key);
      if (fromQ) return fromQ;
    }
    if (bodyObj) {
      for (const key of keys) {
        const raw = bodyObj[key] ?? bodyObj[key.charAt(0).toLowerCase() + key.slice(1)];
        if (raw != null && String(raw).trim()) return String(raw).trim();
      }
    }
    for (const key of keys) {
      const fromXml = extractXmlValue(bodyText, key);
      if (fromXml) return fromXml;
    }
    return '';
  };

  const result = pick('Result', 'result');
  const transRef = pick('TransRef', 'transRef');
  const orderNumber = pick('order', 'Order', 'CompanyRef', 'companyRef');

  const paymentStatus = result === '000' ? 'paid' : 'failed';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    const updateData = {
      payment_status: paymentStatus,
      payment_reference: transRef || null,
      order_status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
      updated_at: new Date().toISOString(),
    };

    let query = supabase.from('orders').update(updateData);
    if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else if (transRef) {
      query = query.eq('payment_reference', transRef);
    } else {
      return res.status(400).json({
        error: 'Callback missing order reference (order/CompanyRef) and TransRef.',
      });
    }

    const { data: updatedRows, error: updateError } = await query.select('id');
    if (updateError) throw updateError;
    if (!updatedRows || updatedRows.length === 0) {
      return res.status(404).json({
        error: 'No matching order found to update.',
        result,
        transRef,
        orderNumber,
      });
    }

    return res.status(200).json({
      ok: true,
      paymentStatus,
      result,
      transRef,
      orderNumber,
    });
  } catch (e) {
    console.error('DPO callback update error:', e);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}
