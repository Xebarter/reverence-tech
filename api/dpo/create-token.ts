/**
 * POST /api/dpo/create-token
 *
 * Called by the checkout page when the buyer clicks "Pay with DPO".
 *
 * Flow:
 *   1. Validate request body: order{}, payment{ amount, currency, serviceName, redirectUrl, customer? }.
 *   2. Insert a pending order into public.orders (server-side, using service role key).
 *   3. Call dpoCreateToken() with CompanyRef = order_number, redirectUrl, backUrl, amount, currency.
 *   4. Save trans_token and payment_reference back onto the order row.
 *   5. Return { orderNumber, redirectUrl, transRef, transToken, statusToken } to the client.
 *
 * On any DPO or DB error the order is marked failed and a descriptive error JSON is returned.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';
import {
  buildDpoDescriptions,
  dpoCreateToken,
  dpoFormatAmount,
  dpoServiceDateNow,
  getDpoConfig,
  normalizeDpoPaymentUrlBase,
  splitName,
  withOrderParam,
  withTokenParam,
  DEFAULT_DPO_PAYMENT_PAGE_BASE,
} from '../lib/dpo';
import { eq, pgInsertRow, pgPatch } from '../lib/supabasePostgrest';

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
      company?: string | null;
    };
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[dpo/create-token] start', { method: req.method });

    setPaymentApiCorsHeaders(req, res);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    if (req.method === 'OPTIONS') return res.status(200).send('ok');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ── Env var checks ─────────────────────────────────────────────────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res
        .status(500)
        .json({ error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
    }

    const companyToken = process.env.DPO_COMPANY_TOKEN;
    const serviceType = process.env.DPO_SERVICE_TYPE;
    const backUrlBase = process.env.DPO_BACK_URL;
    const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
    const paymentUrlBase = normalizeDpoPaymentUrlBase(
      process.env.DPO_PAYMENT_URL || DEFAULT_DPO_PAYMENT_PAGE_BASE,
    );

    const dpoConfigError = validateDpoServerConfig({
      apiUrl,
      paymentPageBase: paymentUrlBase,
      vercelEnv: process.env.VERCEL_ENV,
    });
    if (dpoConfigError) {
      return res.status(500).json({ error: dpoConfigError });
    }

    if (!companyToken || !serviceType || !backUrlBase) {
      return res.status(500).json({
        error: 'DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.',
      });
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let body: CreateTokenBody | null = null;
    try {
      const raw = (req as { body?: unknown }).body;
      body = (typeof raw === 'string' ? JSON.parse(raw) : raw) as CreateTokenBody;
    } catch {
      body = null;
    }

    const order = body?.order;
    const payment = body?.payment;
    const amount = Number(payment?.amount);
    const currency = (payment?.currency || 'UGX').toString();
    const redirectUrl = payment?.redirectUrl;

    if (!order || typeof order !== 'object') {
      return res.status(400).json({ error: 'Missing order payload' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing/invalid amount' });
    }
    if (!redirectUrl) {
      return res.status(400).json({ error: 'Missing redirectUrl' });
    }

    const serviceName = payment?.serviceName || 'Service Payment';
    const customer = payment?.customer || {};

    // ── Insert pending order ───────────────────────────────────────────────
    const statusToken = randomUUID();
    const insertPayload = { ...order, status_token: statusToken };

    const { row: inserted, error: insertError } = await pgInsertRow(
      supabaseUrl,
      serviceRoleKey,
      'orders',
      insertPayload,
    );

    if (insertError) {
      return res.status(400).json({ error: insertError });
    }

    const orderNumber = inserted?.order_number != null ? String(inserted.order_number) : '';
    const orderId = inserted?.id != null ? String(inserted.id) : '';
    if (!orderNumber || !orderId) {
      return res.status(500).json({ error: 'Order created but missing id/order_number' });
    }

    const markFailed = async () => {
      await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      });
    };

    // ── Build DPO request params ───────────────────────────────────────────
    const { firstName, lastName } = splitName(customer?.fullName);
    const { rootDescription, bookingDescription } = buildDpoDescriptions(serviceName, order.items);

    const delimiter = backUrlBase.includes('?') ? '&' : '?';
    const backUrl = `${backUrlBase}${delimiter}order=${encodeURIComponent(orderNumber)}`;
    const redirectUrlFinal = withTokenParam(withOrderParam(redirectUrl, orderNumber), statusToken);
    const paymentAmount = dpoFormatAmount(amount, currency);
    const serviceDate = dpoServiceDateNow();

    // ── Call DPO createToken ───────────────────────────────────────────────
    let transToken: string;
    let transRef: string | null;
    try {
      ({ transToken, transRef } = await dpoCreateToken({
        companyToken,
        serviceType,
        apiUrl,
        paymentAmount,
        currency,
        companyRef: orderNumber,
        redirectUrl: redirectUrlFinal,
        backUrl,
        description: rootDescription,
        bookingDescription,
        firstName,
        lastName,
        email: customer?.email || '',
        phone: customer?.phone || '',
        serviceDate,
      }));
    } catch (e: unknown) {
      await markFailed();
      const err = e as Record<string, unknown>;
      return res.status(502).json({
        error: e instanceof Error ? e.message : 'DPO createToken failed',
        ...(err.result !== undefined ? { result: err.result } : {}),
        ...(err.resultExplanation !== undefined ? { resultExplanation: err.resultExplanation } : {}),
        ...(err.httpStatus !== undefined ? { httpStatus: err.httpStatus } : {}),
        ...(err.bodyPreview !== undefined ? { bodyPreview: err.bodyPreview } : {}),
      });
    }

    // ── Save token back to the order ───────────────────────────────────────
    await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
      ...(transRef ? { payment_reference: transRef } : {}),
      trans_token: transToken,
      updated_at: new Date().toISOString(),
    });

    const checkoutUrl = `${paymentUrlBase}${transToken}`;

    return res.status(200).json({
      orderNumber,
      redirectUrl: checkoutUrl,
      transRef,
      transToken,
      statusToken,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    console.error('[dpo/create-token] fatal', e);
    return res.status(500).json({ error: message });
  }
}
