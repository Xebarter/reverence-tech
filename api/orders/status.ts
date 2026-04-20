import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';
import { eq, pgPatch, pgSelect } from '../supabasePostgrest';

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

  const selQ = `${eq('order_number', orderNumber)}&${eq('status_token', token)}`;
  const { rows, error } = await pgSelect(
    supabaseUrl,
    serviceRoleKey,
    'orders',
    selQ,
    'payment_status,payment_reference,order_status,trans_token',
  );

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }

  const data = rows[0];
  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const payStatus = data.payment_status != null ? String(data.payment_status) : '';
  const transTok = data.trans_token != null ? String(data.trans_token) : '';
  const pref =
    data.payment_reference != null && data.payment_reference !== ''
      ? String(data.payment_reference)
      : null;
  const ordStat = data.order_status != null ? String(data.order_status) : null;

  if (payStatus === 'pending' && transTok) {
    const companyToken = process.env.DPO_COMPANY_TOKEN;

    if (companyToken) {
      try {
        const { result, transRef } = await verifyDpoToken(transTok, companyToken, apiUrl);

        if (result === '000') {
          const patch: Record<string, unknown> = {
            payment_status: 'paid',
            order_status: 'confirmed',
            updated_at: new Date().toISOString(),
          };
          if (transRef) patch.payment_reference = transRef;

          const pQ = `${eq('order_number', orderNumber)}&${eq('status_token', token)}`;
          const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', pQ, patch);
          if (pr.error) {
            console.error('[orders/status] patch', pr.error);
          }

          return res.status(200).json({
            payment_status: 'paid',
            payment_reference: transRef ?? pref,
            order_status: 'confirmed',
          });
        }

        if (result === '002' || result === '003') {
          await pgPatch(supabaseUrl, serviceRoleKey, 'orders', selQ, {
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          });

          return res.status(200).json({
            payment_status: 'failed',
            payment_reference: pref,
            order_status: ordStat,
          });
        }
      } catch {
        /* fall through */
      }
    }
  }

  return res.status(200).json({
    payment_status: payStatus || null,
    payment_reference: pref,
    order_status: ordStat,
  });
}
