import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, getSupabaseEnv, getDpoEnv, verifyDpoToken } from '../lib/dpo';

type ConfirmBody = {
  orderNumber: string;
  statusToken: string;
  dpoResult: string;
  transRef?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

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

  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
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

  // Already terminal -- return as-is
  if (data.payment_status === 'paid' || data.payment_status === 'refunded') {
    return res.status(200).json({
      payment_status: data.payment_status,
      payment_reference: data.payment_reference ?? clientTransRef || null,
      order_status: data.order_status,
    });
  }

  // --- Strategy 1: Server-side verifyToken (most trustworthy) ---
  const { companyToken, apiUrl } = getDpoEnv();

  if (data.trans_token && companyToken) {
    try {
      const { result, transRef: verifiedRef } = await verifyDpoToken(
        data.trans_token,
        companyToken,
        apiUrl,
      );

      if (result === '000') {
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

      if (result === '002' || result === '003') {
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
      // 001 / 004 -- fall through
    } catch {
      // DPO unreachable -- fall through to redirect-result logic
    }
  }

  // --- Strategy 2: Trust DPO redirect Result (statusToken acts as auth) ---
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

  // No actionable info -- return current DB state
  return res.status(200).json({
    payment_status: data.payment_status ?? null,
    payment_reference: data.payment_reference ?? null,
    order_status: data.order_status ?? null,
  });
}
