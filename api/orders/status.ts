import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, getSupabaseEnv, getDpoEnv, verifyDpoToken } from '../lib/dpo';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const orderNumber = String(req.query.order || '').trim();
    const token = String(req.query.t || '').trim();

    if (!orderNumber || !token) {
      return res.status(400).json({ error: 'Missing order or token' });
    }

    const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Supabase env vars missing' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from('orders')
      .select('payment_status, payment_reference, order_status, trans_token')
      .eq('order_number', orderNumber)
      .eq('status_token', token)
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to fetch order' });
    if (!data) return res.status(404).json({ error: 'Order not found' });

    // Active verification: if still pending and we have the DPO TransToken,
    // call verifyToken instead of waiting for the BackURL callback.
    if (data.payment_status === 'pending' && data.trans_token) {
      const { companyToken, apiUrl } = getDpoEnv();

      if (companyToken) {
        try {
          const { result, transRef } = await verifyDpoToken(data.trans_token, companyToken, apiUrl);

          if (result === '000') {
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
            await supabase
              .from('orders')
              .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
              .eq('order_number', orderNumber)
              .eq('status_token', token);

            return res.status(200).json({
              payment_status: 'failed',
              payment_reference: data.payment_reference ?? null,
              order_status: data.order_status ?? null,
            });
          }
        } catch {
          // verifyToken network error -- return DB state
        }
      }
    }

    return res.status(200).json({
      payment_status: data.payment_status ?? null,
      payment_reference: data.payment_reference ?? null,
      order_status: data.order_status ?? null,
    });
  } catch (err) {
    console.error('[orders/status] unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
