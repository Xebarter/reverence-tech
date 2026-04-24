import { NextResponse } from 'next/server';
import { dpoVerifyToken, getDpoApiUrl } from '../../../../server/dpo';
import { validateDpoServerConfig } from '../../../../server/dpoEnv';
import { eq, pgPatch, pgSelect } from '../../../../server/supabasePostgrest';

export const runtime = 'nodejs';

function ok200(data?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...(data || {}) }, { status: 200 });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function pickField(
  url: URL,
  bodyText: string,
  bodyObj: Record<string, unknown> | null,
  ...keys: string[]
): string {
  for (const key of keys) {
    const fromQ = (url.searchParams.get(key) || '').trim();
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

async function handle(req: Request) {
  const url = new URL(req.url);
  const bodyText = req.method === 'POST' ? await req.text() : '';
  const bodyObj = (() => {
    if (!bodyText) return null;
    try {
      const v = JSON.parse(bodyText) as unknown;
      return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  })();

  const pick = (...keys: string[]) => pickField(url, bodyText, bodyObj, ...keys);
  const transactionToken = pick('TransactionToken', 'TransID', 'transactionToken', 'transId');
  const companyRef = pick('CompanyRef', 'companyRef', 'order', 'Order');

  if (!transactionToken && !companyRef) {
    console.warn('[dpo/callback] Missing TransactionToken and CompanyRef — ignoring');
    return ok200({ matched: false, reason: 'missing_params' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[dpo/callback] Supabase env vars missing');
    return ok200({ warning: 'Supabase env vars missing' });
  }

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const apiUrl = getDpoApiUrl();
  const configErr = validateDpoServerConfig({
    apiUrl,
    paymentPageBase: process.env.DPO_PAYMENT_URL || '',
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (configErr) {
    console.error('[dpo/callback] Invalid DPO server config:', configErr);
    return ok200({ matched: false, reason: 'invalid_config' });
  }
  const cols = 'id,order_number,payment_status,trans_token';

  let orderRow: Record<string, unknown> | null = null;

  if (companyRef) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('order_number', companyRef), cols);
    if (r.error) {
      console.error('[dpo/callback] DB select by order_number error', r.error);
      return ok200({ warning: 'DB error during lookup' });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow && transactionToken) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('trans_token', transactionToken), cols);
    if (r.error) {
      console.error('[dpo/callback] DB select by trans_token error', r.error);
      return ok200({ warning: 'DB error during fallback lookup' });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow) {
    console.warn('[dpo/callback] Order not found', { companyRef, transactionToken });
    return ok200({ matched: false, reason: 'order_not_found' });
  }

  const currentStatus = orderRow.payment_status != null ? String(orderRow.payment_status) : '';
  if (currentStatus === 'paid' || currentStatus === 'refunded') {
    return ok200({ matched: true, alreadyFinal: true, payment_status: currentStatus });
  }

  const orderId = String(orderRow.id);
  const transTok = transactionToken || (orderRow.trans_token != null ? String(orderRow.trans_token) : '');
  if (!transTok || !companyToken) {
    console.warn('[dpo/callback] Cannot verify — missing TransactionToken or DPO_COMPANY_TOKEN', {
      order: orderRow.order_number,
    });
    return ok200({ matched: true, verified: false, reason: 'missing_verify_params' });
  }

  let verifyResult: string | null = null;
  let verifiedRef: string | null = null;
  try {
    const v = await dpoVerifyToken(transTok, companyToken, apiUrl);
    verifyResult = v.result;
    verifiedRef = v.transRef;
  } catch (e) {
    console.error('[dpo/callback] dpoVerifyToken threw', e);
    return ok200({ matched: true, verified: false, reason: 'verify_error' });
  }

  const ts = new Date().toISOString();
  if (verifyResult === '000') {
    const patch: Record<string, unknown> = {
      payment_status: 'paid',
      order_status: 'confirmed',
      updated_at: ts,
    };
    if (verifiedRef) patch.payment_reference = verifiedRef;
    const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), patch);
    if (pr.error) console.error('[dpo/callback] patch error (paid)', pr.error);
    return ok200({ matched: true, verified: true, payment_status: 'paid' });
  }

  if (verifyResult === '002' || verifyResult === '003') {
    const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
      payment_status: 'failed',
      updated_at: ts,
    });
    if (pr.error) console.error('[dpo/callback] patch error (failed)', pr.error);
    return ok200({ matched: true, verified: true, payment_status: 'failed' });
  }

  return ok200({ matched: true, verified: true, payment_status: 'pending', dpoResult: verifyResult });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}

