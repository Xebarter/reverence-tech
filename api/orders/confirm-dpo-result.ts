import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function verifyDpoToken(
  transToken: string,
  companyToken: string,
  apiUrl: string,
): Promise<{ result: string | null; transRef: string | null }> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${escapeXml(transToken)}</TransactionToken>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      Accept: 'application/xml',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    body: xmlBody,
  });

  const text = await resp.text();
  return {
    result: extractXmlValue(text, 'Result'),
    transRef: extractXmlValue(text, 'TransRef'),
  };
}

type ConfirmBody = {
  orderNumber: string;
  statusToken: string;
  dpoResult: string;
  transRef?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setPaymentApiCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body as Partial<ConfirmBody> | null;
  const orderNumber = (body?.orderNumber || '').trim();
  const statusToken = (body?.statusToken || '').trim();
  const dpoResult = (body?.dpoResult || '').trim();
  const clientTransRef = (body?.transRef || '').trim();

  if (!orderNumber || !statusToken) {
    return res.status(400).json({ error: 'Missing orderNumber or statusToken' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('orders')
    .select('id, payment_status, payment_reference, order_status, trans_token')
    .eq('order_number', orderNumber)
    .eq('status_token', statusToken)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Failed to fetch order' });
  if (!data) return res.status(404).json({ error: 'Order not found' });

  // Already in a terminal state — just return it.
  if (data.payment_status === 'paid' || data.payment_status === 'refunded') {
    return res.status(200).json({
      payment_status: data.payment_status,
      payment_reference: data.payment_reference ?? clientTransRef || null,
      order_status: data.order_status,
    });
  }

  // ── Try server-side DPO verifyToken (most trustworthy) ──
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';

  if (data.trans_token && companyToken) {
    try {
      const { result: dpoVerifyResult, transRef: verifiedRef } = await verifyDpoToken(
        data.trans_token,
        companyToken,
        apiUrl,
      );

      if (dpoVerifyResult === '000') {
        const ref = verifiedRef || clientTransRef || data.payment_reference;
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'confirmed',
            ...(ref ? { payment_reference: ref } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        return res.status(200).json({
          payment_status: 'paid',
          payment_reference: ref ?? null,
          order_status: 'confirmed',
        });
      }

      if (dpoVerifyResult === '002' || dpoVerifyResult === '003') {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', data.id);

        return res.status(200).json({
          payment_status: 'failed',
          payment_reference: data.payment_reference ?? null,
          order_status: data.order_status,
        });
      }
      // 001 (not paid) or 004 (expired) — fall through
    } catch {
      // DPO network issue — fall through to redirect-result logic
    }
  }

  // ── Fallback: trust the DPO redirect Result ──
  // The user can only call this with the correct statusToken (secret UUID),
  // and DPO appended Result=000 to the redirect they control.
  if (dpoResult === '000') {
    const ref = clientTransRef || data.payment_reference;
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'confirmed',
        ...(ref ? { payment_reference: ref } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    return res.status(200).json({
      payment_status: 'paid',
      payment_reference: ref ?? null,
      order_status: 'confirmed',
    });
  }

  if (dpoResult === '002' || dpoResult === '003') {
    await supabase
      .from('orders')
      .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', data.id);

    return res.status(200).json({
      payment_status: 'failed',
      payment_reference: data.payment_reference ?? null,
      order_status: data.order_status,
    });
  }

  // No DPO info to act on — return current DB state
  return res.status(200).json({
    payment_status: data.payment_status ?? null,
    payment_reference: data.payment_reference ?? null,
    order_status: data.order_status ?? null,
  });
}
