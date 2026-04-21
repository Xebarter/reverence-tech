/**
 * DPO Pay BackURL handler — server-to-server push notification.
 *
 * DPO calls this endpoint directly after payment (not the browser).
 * This endpoint is intentionally unauthenticated.
 *
 * Flow:
 *   1. Read TransactionToken (or TransID) and CompanyRef from query params or body.
 *   2. Look up the order by order_number = CompanyRef (then fall back to trans_token).
 *   3. Return 200 silently if the order is not found or is already in a final state.
 *   4. Call dpoVerifyToken() to confirm with DPO before trusting the callback.
 *   5. Update order payment_status and order_status accordingly.
 *   6. Always return HTTP 200 (required by DPO — any other status causes retries).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dpoVerifyToken } from '../lib/dpo';
import { eq, pgPatch, pgSelect } from '../lib/supabasePostgrest';

function normalizeBodyString(req: VercelRequest): string {
  const b = req.body;
  if (b == null || b === '') return '';
  if (typeof b === 'string') return b;
  if (Buffer.isBuffer(b)) return b.toString('utf8');
  return '';
}

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function queryParam(req: VercelRequest, key: string): string {
  const q = req.query?.[key];
  if (Array.isArray(q)) return String(q[0] ?? '').trim();
  return String(q ?? '').trim();
}

function pickField(req: VercelRequest, bodyText: string, bodyObj: Record<string, unknown> | null, ...keys: string[]): string {
  for (const key of keys) {
    const fromQ = queryParam(req, key);
    if (fromQ) return fromQ;
  }
  if (bodyObj) {
    for (const key of keys) {
      const raw = bodyObj[key] ?? bodyObj[key.charAt(0).toLowerCase() + key.slice(1)];
      if (raw != null && String(raw).trim()) return String(raw).trim();
    }
  }
  for (const key of keys) {
    const fromXml = extractXmlValue(bodyText, key);
    if (fromXml) return fromXml;
  }
  return '';
}

function ok200(res: VercelResponse, data?: Record<string, unknown>): VercelResponse {
  return res.status(200).json({ ok: true, ...data });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bodyText = normalizeBodyString(req);
  const bodyObj =
    req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? (req.body as Record<string, unknown>)
      : null;

  const pick = (...keys: string[]) => pickField(req, bodyText, bodyObj, ...keys);

  // DPO sends TransactionToken (the payment session token) and CompanyRef (= our order_number).
  const transactionToken = pick('TransactionToken', 'TransID', 'transactionToken', 'transId');
  const companyRef = pick('CompanyRef', 'companyRef', 'order', 'Order');

  if (!transactionToken && !companyRef) {
    // Nothing to work with — log and return 200 to stop DPO retrying.
    console.warn('[dpo/callback] Missing TransactionToken and CompanyRef — ignoring');
    return ok200(res, { matched: false, reason: 'missing_params' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[dpo/callback] Supabase env vars missing');
    // Still return 200 so DPO does not retry indefinitely.
    return ok200(res, { warning: 'Supabase env vars missing' });
  }

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';

  const cols = 'id,order_number,payment_status,trans_token';

  // ── Look up the order ────────────────────────────────────────────────────
  let orderRow: Record<string, unknown> | null = null;

  if (companyRef) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('order_number', companyRef), cols);
    if (r.error) {
      console.error('[dpo/callback] DB select by order_number error', r.error);
      return ok200(res, { warning: 'DB error during lookup' });
    }
    orderRow = r.rows[0] ?? null;
  }

  // Fallback: look up by trans_token if CompanyRef didn't match.
  if (!orderRow && transactionToken) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('trans_token', transactionToken), cols);
    if (r.error) {
      console.error('[dpo/callback] DB select by trans_token error', r.error);
      return ok200(res, { warning: 'DB error during fallback lookup' });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow) {
    console.warn('[dpo/callback] Order not found', { companyRef, transactionToken });
    return ok200(res, { matched: false, reason: 'order_not_found' });
  }

  // ── Idempotency: skip if already in a final state ────────────────────────
  const currentStatus = orderRow.payment_status != null ? String(orderRow.payment_status) : '';
  if (currentStatus === 'paid' || currentStatus === 'refunded') {
    return ok200(res, { matched: true, alreadyFinal: true, payment_status: currentStatus });
  }

  const orderId = String(orderRow.id);

  // ── Verify with DPO before updating — never trust the callback alone ─────
  const transTok =
    transactionToken ||
    (orderRow.trans_token != null ? String(orderRow.trans_token) : '');

  if (!transTok || !companyToken) {
    console.warn('[dpo/callback] Cannot verify — missing TransactionToken or DPO_COMPANY_TOKEN', {
      order: orderRow.order_number,
    });
    return ok200(res, { matched: true, verified: false, reason: 'missing_verify_params' });
  }

  let verifyResult: string | null = null;
  let verifiedRef: string | null = null;
  try {
    const v = await dpoVerifyToken(transTok, companyToken, apiUrl);
    verifyResult = v.result;
    verifiedRef = v.transRef;
  } catch (e) {
    console.error('[dpo/callback] dpoVerifyToken threw', e);
    return ok200(res, { matched: true, verified: false, reason: 'verify_error' });
  }

  // ── Update order based on verified result ────────────────────────────────
  const ts = new Date().toISOString();

  if (verifyResult === '000') {
    const patch: Record<string, unknown> = {
      payment_status: 'paid',
      order_status: 'confirmed',
      updated_at: ts,
    };
    if (verifiedRef) patch.payment_reference = verifiedRef;

    const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), patch);
    if (pr.error) {
      console.error('[dpo/callback] patch error (paid)', pr.error);
    }
    return ok200(res, { matched: true, verified: true, payment_status: 'paid' });
  }

  // Result 002/003 = explicitly failed/cancelled — mark as failed.
  if (verifyResult === '002' || verifyResult === '003') {
    const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
      payment_status: 'failed',
      updated_at: ts,
    });
    if (pr.error) {
      console.error('[dpo/callback] patch error (failed)', pr.error);
    }
    return ok200(res, { matched: true, verified: true, payment_status: 'failed' });
  }

  // Any other result (e.g. 900 = not paid yet) — leave order as pending.
  return ok200(res, { matched: true, verified: true, payment_status: 'pending', dpoResult: verifyResult });
}
