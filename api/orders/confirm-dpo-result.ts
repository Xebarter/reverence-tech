import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';
import { eq, pgPatch, pgSelect } from '../lib/supabasePostgrest';

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

  let body: Partial<ConfirmBody> | null = null;
  try {
    const raw = (req as { body?: unknown }).body;
    if (typeof raw === 'string') {
      body = JSON.parse(raw) as Partial<ConfirmBody>;
    } else {
      body = raw as Partial<ConfirmBody>;
    }
  } catch {
    body = null;
  }

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

  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
  const dpoConfigError = validateDpoServerConfig({
    apiUrl,
    paymentPageBase: process.env.DPO_PAYMENT_URL || '',
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (dpoConfigError) {
    return res.status(500).json({ error: dpoConfigError });
  }

  const selQ = `${eq('order_number', orderNumber)}&${eq('status_token', statusToken)}`;
  const { rows, error } = await pgSelect(
    supabaseUrl,
    serviceRoleKey,
    'orders',
    selQ,
    'id,payment_status,payment_reference,order_status,trans_token',
  );

  if (error) return res.status(500).json({ error: 'Failed to fetch order' });
  const data = rows[0];
  if (!data) return res.status(404).json({ error: 'Order not found' });

  const payStatus = data.payment_status != null ? String(data.payment_status) : '';
  const pref =
    data.payment_reference != null && data.payment_reference !== ''
      ? String(data.payment_reference)
      : null;

  if (payStatus === 'paid' || payStatus === 'refunded') {
    return res.status(200).json({
      payment_status: payStatus,
      payment_reference: pref ?? (clientTransRef || null),
      order_status: data.order_status != null ? String(data.order_status) : null,
    });
  }

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const transTok = data.trans_token != null ? String(data.trans_token) : '';

  if (transTok && companyToken) {
    try {
      const { result: dpoVerifyResult, transRef: verifiedRef } = await verifyDpoToken(
        transTok,
        companyToken,
        apiUrl,
      );

      if (dpoVerifyResult === '000') {
        const ref = verifiedRef || clientTransRef || pref;
        const patch: Record<string, unknown> = {
          payment_status: 'paid',
          order_status: 'confirmed',
          updated_at: new Date().toISOString(),
        };
        if (ref) patch.payment_reference = ref;

        const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), patch);
        if (pr.error) {
          console.error('[confirm-dpo-result] patch', pr.error);
          return res.status(500).json({ error: 'Failed to update order' });
        }

        return res.status(200).json({
          payment_status: 'paid',
          payment_reference: ref ?? null,
          order_status: 'confirmed',
        });
      }

      if (dpoVerifyResult === '002' || dpoVerifyResult === '003') {
        await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), {
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        });

        return res.status(200).json({
          payment_status: 'failed',
          payment_reference: pref,
          order_status: data.order_status != null ? String(data.order_status) : null,
        });
      }
    } catch {
      /* fall through */
    }
  }

  if (dpoResult === '000') {
    const ref = clientTransRef || pref;
    const patch: Record<string, unknown> = {
      payment_status: 'paid',
      order_status: 'confirmed',
      updated_at: new Date().toISOString(),
    };
    if (ref) patch.payment_reference = ref;

    const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), patch);
    if (pr.error) {
      console.error('[confirm-dpo-result] patch', pr.error);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    return res.status(200).json({
      payment_status: 'paid',
      payment_reference: ref ?? null,
      order_status: 'confirmed',
    });
  }

  if (dpoResult === '002' || dpoResult === '003') {
    await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), {
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      payment_status: 'failed',
      payment_reference: pref,
      order_status: data.order_status != null ? String(data.order_status) : null,
    });
  }

  return res.status(200).json({
    payment_status: payStatus || null,
    payment_reference: pref,
    order_status: data.order_status != null ? String(data.order_status) : null,
  });
}
