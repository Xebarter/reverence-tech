import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * DPO Push Payments — server-to-server success notification.
 * https://docs.dpopay.com/dpo-pay-by-network/reference/pushpayments
 *
 * We acknowledge with 200 and only mark orders paid after verifyToken (same as BackURL flow).
 */

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

function normalizeBodyString(req: VercelRequest): string {
  const b = req.body;
  if (b == null || b === '') return '';
  if (typeof b === 'string') return b;
  if (Buffer.isBuffer(b)) return b.toString('utf8');
  return '';
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const t = text.trim();
  if (!t.startsWith('{')) return null;
  try {
    const v = JSON.parse(t) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickString(obj: Record<string, unknown> | null, keys: string[]): string {
  if (!obj) return '';
  for (const k of keys) {
    const v = obj[k] ?? obj[k.charAt(0).toLowerCase() + k.slice(1)];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function parsePushFields(req: VercelRequest): {
  merchantOrderId: string;
  transactionId: string;
  statusRaw: string;
} {
  const bodyText = normalizeBodyString(req);
  const json = tryParseJsonObject(bodyText);
  const flat: Record<string, unknown> = { ...(json || {}) };

  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    Object.assign(flat, req.body as Record<string, unknown>);
  }

  const q = (k: string): string => {
    const v = req.query?.[k];
    if (Array.isArray(v)) return String(v[0] ?? '').trim();
    return String(v ?? '').trim();
  };

  const merchantOrderId =
    pickString(flat, [
      'merchantOrderId',
      'MerchantOrderId',
      'companyRef',
      'CompanyRef',
      'orderNumber',
      'OrderNumber',
      'order',
      'Order',
    ]) ||
    q('merchantOrderId') ||
    q('CompanyRef') ||
    q('order');

  const transactionId =
    pickString(flat, ['transactionId', 'TransactionId', 'transRef', 'TransRef']) ||
    q('transactionId') ||
    q('TransRef');

  const statusRaw =
    pickString(flat, ['status', 'Status', 'paymentStatus', 'PaymentStatus']) || q('status');

  return { merchantOrderId, transactionId, statusRaw };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = (process.env.DPO_PUSH_SECRET || '').trim();
  if (secret) {
    const hdr =
      (req.headers['x-dpo-push-secret'] as string | undefined) ||
      (req.headers['x-push-secret'] as string | undefined) ||
      '';
    if (hdr !== secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { merchantOrderId, transactionId, statusRaw } = parsePushFields(req);
  const successish =
    /^success|paid|completed|000$/i.test(statusRaw) || statusRaw === '';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  let orderRow: {
    id: string;
    order_number: string;
    payment_status: string | null;
    payment_reference: string | null;
    trans_token: string | null;
  } | null = null;

  if (merchantOrderId) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, payment_status, payment_reference, trans_token')
      .eq('order_number', merchantOrderId)
      .maybeSingle();
    if (data) orderRow = data as typeof orderRow;
  }

  if (!orderRow && transactionId) {
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, payment_status, payment_reference, trans_token')
      .eq('payment_reference', transactionId)
      .maybeSingle();
    if (data) orderRow = data as typeof orderRow;
  }

  if (!orderRow) {
    // Acknowledge to limit DPO retries; log for reconciliation.
    console.warn('[dpo/push] no matching order', { merchantOrderId, transactionId, statusRaw });
    return res.status(200).json({ ok: true, matched: false });
  }

  if (orderRow.payment_status === 'paid' || orderRow.payment_status === 'refunded') {
    return res.status(200).json({ ok: true, matched: true, alreadyFinal: true });
  }

  if (!successish) {
    return res.status(200).json({ ok: true, matched: true, ignoredStatus: statusRaw });
  }

  if (!orderRow.trans_token || !companyToken) {
    console.warn('[dpo/push] cannot verify — missing trans_token or DPO_COMPANY_TOKEN', {
      order: orderRow.order_number,
    });
    return res.status(200).json({ ok: true, matched: true, verified: false });
  }

  try {
    const { result, transRef } = await verifyDpoToken(orderRow.trans_token, companyToken, apiUrl);

    if (result === '000') {
      const ref = transRef || transactionId || orderRow.payment_reference;
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'confirmed',
          ...(ref ? { payment_reference: ref } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderRow.id);

      return res.status(200).json({ ok: true, matched: true, verified: true, payment_status: 'paid' });
    }
  } catch (e) {
    console.error('[dpo/push] verifyToken failed', e);
  }

  return res.status(200).json({ ok: true, matched: true, verified: false });
}
