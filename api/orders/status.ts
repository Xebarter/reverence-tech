/**
 * GET /api/orders/status?order=<order_number>&t=<status_token>
 *
 * Called by /payment-result after DPO redirects the buyer back, and by the
 * polling loop while the payment is pending.
 *
 * Flow:
 *   1. Validate query params: order (order_number) and t (status_token).
 *   2. Look up the order by order_number AND status_token (prevents enumeration).
 *   3. If the order is already in a final state, return it immediately (idempotent).
 *   4. If payment is still pending and we have a trans_token, call dpoVerifyToken().
 *      - result 000  → mark paid/confirmed, return { payment_status: 'paid', ... }.
 *      - result 002/003 → mark failed, return { payment_status: 'failed', ... }.
 *      - any other   → return current DB status (polling will retry).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';
import { dpoVerifyToken } from '../lib/dpo';
import { eq, pgPatch, pgSelect } from '../lib/supabasePostgrest';

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

  // Look up by both order_number AND status_token to prevent enumeration.
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

  // Already in a final state — return immediately (idempotent).
  if (payStatus === 'paid' || payStatus === 'failed' || payStatus === 'refunded') {
    return res.status(200).json({
      payment_status: payStatus,
      payment_reference: pref,
      order_status: ordStat,
    });
  }

  // Payment is pending — try to verify with DPO if we have a trans_token.
  if (payStatus === 'pending' && transTok) {
    const companyToken = process.env.DPO_COMPANY_TOKEN;

    if (companyToken) {
      try {
        const { result, transRef } = await dpoVerifyToken(transTok, companyToken, apiUrl);

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
            console.error('[orders/status] patch error (paid)', pr.error);
          }

          return res.status(200).json({
            payment_status: 'paid',
            payment_reference: transRef ?? pref,
            order_status: 'confirmed',
          });
        }

        // Explicitly failed/cancelled.
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
      } catch (e) {
        console.error('[orders/status] dpoVerifyToken error', e);
        /* fall through — return current DB status */
      }
    }
  }

  return res.status(200).json({
    payment_status: payStatus || null,
    payment_reference: pref,
    order_status: ordStat,
  });
}
