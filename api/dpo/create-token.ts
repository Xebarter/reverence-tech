import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  setCorsHeaders,
  getDpoEnv,
  getSupabaseEnv,
  splitName,
  appendQueryParam,
  createDpoToken,
} from '../lib/dpo';

type CreateTokenBody = {
  order: Record<string, unknown>;
  payment: {
    amount: number;
    currency?: string;
    serviceName: string;
    redirectUrl: string;
    customer?: {
      fullName?: string;
      email?: string;
      phone?: string;
    };
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Env validation ---
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
  }

  const dpo = getDpoEnv();
  if (!dpo.companyToken || !dpo.serviceType || !dpo.backUrl) {
    return res.status(500).json({ error: 'DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.' });
  }

  // --- Body validation ---
  const body = req.body as CreateTokenBody | null;
  const order = body?.order;
  const payment = body?.payment;
  const amount = Number(payment?.amount);
  const currency = (payment?.currency || 'UGX').toString();
  const redirectUrl = payment?.redirectUrl;
  const serviceName = payment?.serviceName || 'Service Payment';
  const customer = payment?.customer || {};

  if (!order || typeof order !== 'object') {
    return res.status(400).json({ error: 'Missing order payload' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing/invalid amount' });
  }
  if (!redirectUrl) {
    return res.status(400).json({ error: 'Missing redirectUrl' });
  }

  // --- Insert order ---
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const statusToken = crypto.randomUUID();

  const { data: inserted, error: insertError } = await supabase
    .from('orders')
    .insert([{ ...order, status_token: statusToken }])
    .select()
    .single();

  if (insertError) {
    return res.status(400).json({ error: insertError.message });
  }

  const orderNumber = (inserted as Record<string, unknown>)?.order_number as string | undefined;
  const orderId = (inserted as Record<string, unknown>)?.id as string | undefined;
  if (!orderNumber || !orderId) {
    return res.status(500).json({ error: 'Order created but missing id/order_number' });
  }

  // --- Create DPO token ---
  const { firstName, lastName } = splitName(customer?.fullName);
  const backUrlWithOrder = appendQueryParam(dpo.backUrl, 'order', orderNumber);
  const redirectWithOrder = appendQueryParam(
    appendQueryParam(redirectUrl, 'order', orderNumber),
    't',
    statusToken,
  );

  try {
    const result = await createDpoToken({
      companyToken: dpo.companyToken,
      serviceType: dpo.serviceType,
      apiUrl: dpo.apiUrl,
      paymentUrl: dpo.paymentUrl,
      amount,
      currency,
      orderNumber,
      redirectUrl: redirectWithOrder,
      backUrl: backUrlWithOrder,
      serviceName,
      customer: { firstName, lastName, email: customer?.email || '', phone: customer?.phone || '' },
    });

    // Persist DPO references for server-side verification later
    await supabase
      .from('orders')
      .update({
        ...(result.transRef ? { payment_reference: result.transRef } : {}),
        trans_token: result.transToken,
      })
      .eq('id', orderId);

    return res.status(200).json({
      orderNumber,
      redirectUrl: result.redirectUrl,
      statusToken,
    });
  } catch (err: unknown) {
    const e = err as Error & { httpStatus?: number; bodyPreview?: string; hint?: string; dpoResult?: string; resultExplanation?: string };
    return res.status(502).json({
      error: e.message,
      ...(e.httpStatus ? { httpStatus: e.httpStatus } : {}),
      ...(e.hint ? { hint: e.hint } : {}),
      ...(e.dpoResult ? { dpoResult: e.dpoResult, resultExplanation: e.resultExplanation } : {}),
    });
  }
}
