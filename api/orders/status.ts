import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from('orders')
    .select('payment_status, payment_reference, order_status')
    .eq('order_number', orderNumber)
    .eq('status_token', token)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }

  if (!data) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({
    payment_status: data.payment_status ?? null,
    payment_reference: data.payment_reference ?? null,
    order_status: data.order_status ?? null,
  });
}

