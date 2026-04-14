import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';

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

/**
 * Call DPO's verifyToken API for an existing TransToken.
 * Returns the DPO Result code and optional TransRef from the response.
 *
 * Result codes:
 *   000 – paid/verified
 *   001 – not paid yet
 *   002 – transaction failed
 *   003 – transaction reversed/cancelled
 *   004 – token expired (but completed payments still return 000)
 */
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setPaymentApiCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const orderNumber = String(req.query.order || '').trim();
  const token = String(req.query.t || '').trim();

  if (!orderNumber || !token) {
    return res.status(400).json({ error: 'Missing order or token' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res
      .status(500)
      .json({ error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
  }

  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
  const dpoConfigError = validateDpoServerConfig({
    apiUrl,
    paymentPageBase: process.env.DPO_PAYMENT_URL || '',
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (dpoConfigError) {
    return res.status(500).json({ error: dpoConfigError });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('orders')
    .select('payment_status, payment_reference, order_status, trans_token')
    .eq('order_number', orderNumber)
    .eq('status_token', token)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }

  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // If the order is still pending and we have DPO's TransToken, actively verify
  // with DPO instead of waiting solely for the BackURL callback to fire.
  if (data.payment_status === 'pending' && data.trans_token) {
    const companyToken = process.env.DPO_COMPANY_TOKEN;

    if (companyToken) {
      try {
        const { result, transRef } = await verifyDpoToken(data.trans_token, companyToken, apiUrl);

        if (result === '000') {
          // Payment confirmed by DPO – update DB so BackURL failure is a non-issue.
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              order_status: 'confirmed',
              ...(transRef ? { payment_reference: transRef } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('order_number', orderNumber)
            .eq('status_token', token);

          return res.status(200).json({
            payment_status: 'paid',
            payment_reference: transRef ?? data.payment_reference ?? null,
            order_status: 'confirmed',
          });
        }

        if (result === '002' || result === '003') {
          // Failed or reversed
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('order_number', orderNumber)
            .eq('status_token', token);

          return res.status(200).json({
            payment_status: 'failed',
            payment_reference: data.payment_reference ?? null,
            order_status: data.order_status ?? null,
          });
        }

        // result 001 = not paid yet, 004 = expired — fall through to return DB value
      } catch {
        // verifyToken network error — fall through and return whatever is in the DB
      }
    }
  }

  return res.status(200).json({
    payment_status: data.payment_status ?? null,
    payment_reference: data.payment_reference ?? null,
    order_status: data.order_status ?? null,
  });
}
