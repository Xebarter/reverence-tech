import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { extractXmlValue, getSupabaseEnv } from '../lib/dpo';

/**
 * DPO BackURL handler.
 *
 * DPO calls this URL server-to-server after a payment completes.
 * It may send data as query parameters and/or an XML body.
 * We accept both GET and POST so DPO's request always lands.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const params = new URLSearchParams(
    typeof req.url === 'string' ? req.url.split('?')[1] || '' : '',
  );

  let bodyText = '';
  if (typeof req.body === 'string') {
    bodyText = req.body;
  } else if (req.body && typeof req.body === 'object') {
    bodyText = JSON.stringify(req.body);
  }

  const result =
    params.get('Result') || params.get('result') || extractXmlValue(bodyText, 'Result') || '';
  const transRef =
    params.get('TransRef') || params.get('transRef') || extractXmlValue(bodyText, 'TransRef') || '';
  const orderNumber =
    params.get('order') ||
    params.get('Order') ||
    params.get('CompanyRef') ||
    params.get('companyRef') ||
    extractXmlValue(bodyText, 'CompanyRef') ||
    '';

  if (!orderNumber && !transRef) {
    return res.status(400).json({ error: 'Callback missing order reference and TransRef.' });
  }

  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const paymentStatus = result === '000' ? 'paid' : 'failed';
  const updateData = {
    payment_status: paymentStatus,
    payment_reference: transRef || null,
    order_status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
    updated_at: new Date().toISOString(),
  };

  let query = supabase.from('orders').update(updateData);
  if (orderNumber) {
    query = query.eq('order_number', orderNumber);
  } else {
    query = query.eq('payment_reference', transRef);
  }

  const { data: rows, error: updateError } = await query.select('id');

  if (updateError) {
    console.error('[dpo/callback] update error:', updateError);
    return res.status(500).json({ error: 'Failed to update order' });
  }

  if (!rows || rows.length === 0) {
    return res.status(404).json({ error: 'No matching order found.', result, transRef, orderNumber });
  }

  return res.status(200).json({ ok: true, paymentStatus, result, transRef, orderNumber });
}
