import { NextResponse } from 'next/server';
import { dpoVerifyToken } from '../../../../server/dpo';
import { eq, pgPatch, pgSelect } from '../../../../server/supabasePostgrest';

export const runtime = 'nodejs';

export function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

function normalizeBodyString(body: unknown): string {
  if (body == null || body === '') return '';
  if (typeof body === 'string') return body;
  if (body instanceof ArrayBuffer) return Buffer.from(body).toString('utf8');
  return '';
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const t = text.trim();
  if (!t.startsWith('{')) return null;
  try {
    const v = JSON.parse(t) as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickString(obj: Record<string, unknown> | null, keys: string[]): string {
  if (!obj) return '';
  for (const k of keys) {
    const v = obj[k] ?? obj[k.charAt(0).toLowerCase() + k.slice(1)];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function parsePushFields(reqUrl: URL, bodyText: string, bodyObj: Record<string, unknown> | null) {
  const flat: Record<string, unknown> = { ...(bodyObj || {}) };
  const q = (k: string): string => (reqUrl.searchParams.get(k) || '').trim();

  const merchantOrderId =
    pickString(flat, [
      'merchantOrderId',
      'MerchantOrderId',
      'companyRef',
      'CompanyRef',
      'orderNumber',
      'OrderNumber',
      'order',
      'Order',
    ]) ||
    q('merchantOrderId') ||
    q('CompanyRef') ||
    q('order');

  const transactionId =
    pickString(flat, ['transactionId', 'TransactionId', 'transRef', 'TransRef', 'TransactionToken']) ||
    q('transactionId') ||
    q('TransRef') ||
    q('TransactionToken');

  const statusRaw = pickString(flat, ['status', 'Status', 'paymentStatus', 'PaymentStatus']) || q('status');

  return { merchantOrderId, transactionId, statusRaw };
}

export async function POST(req: Request) {
  const secret = (process.env.DPO_PUSH_SECRET || '').trim();
  if (secret) {
    const hdr = (req.headers.get('x-dpo-push-secret') || req.headers.get('x-push-secret') || '').trim();
    if (hdr !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const bodyText = normalizeBodyString(await req.text());
  const json = tryParseJsonObject(bodyText);

  const { merchantOrderId, transactionId, statusRaw } = parsePushFields(url, bodyText, json);
  const successish = /^success|paid|completed|000$/i.test(statusRaw) || statusRaw === '';

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
  }

  const cols = 'id,order_number,payment_status,payment_reference,trans_token';
  let orderRow: Record<string, unknown> | null = null;

  if (merchantOrderId) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('order_number', merchantOrderId), cols);
    if (r.error) {
      console.error('[dpo/push] select error', r.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow && transactionId) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('trans_token', transactionId), cols);
    if (r.error) {
      console.error('[dpo/push] select by trans_token error', r.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow && transactionId) {
    const r = await pgSelect(supabaseUrl, serviceRoleKey, 'orders', eq('payment_reference', transactionId), cols);
    if (r.error) {
      console.error('[dpo/push] select by payment_reference error', r.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    orderRow = r.rows[0] ?? null;
  }

  if (!orderRow) {
    console.warn('[dpo/push] no matching order', { merchantOrderId, transactionId, statusRaw });
    return NextResponse.json({ ok: true, matched: false }, { status: 200 });
  }

  const paySt = orderRow.payment_status != null ? String(orderRow.payment_status) : '';
  if (paySt === 'paid' || paySt === 'refunded') {
    return NextResponse.json({ ok: true, matched: true, alreadyFinal: true }, { status: 200 });
  }

  if (!successish) {
    return NextResponse.json({ ok: true, matched: true, ignoredStatus: statusRaw }, { status: 200 });
  }

  const transTok = orderRow.trans_token != null ? String(orderRow.trans_token) : '';
  if (!transTok || !companyToken) {
    console.warn('[dpo/push] cannot verify — missing trans_token or DPO_COMPANY_TOKEN', {
      order: orderRow.order_number,
    });
    return NextResponse.json({ ok: true, matched: true, verified: false }, { status: 200 });
  }

  try {
    const { result, transRef } = await dpoVerifyToken(transTok, companyToken, apiUrl);
    if (result === '000') {
      const ref =
        transRef ||
        transactionId ||
        (orderRow.payment_reference != null ? String(orderRow.payment_reference) : '');
      const orderId = String(orderRow.id);
      const patch: Record<string, unknown> = {
        payment_status: 'paid',
        order_status: 'confirmed',
        updated_at: new Date().toISOString(),
      };
      if (ref) patch.payment_reference = ref;

      const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), patch);
      if (pr.error) console.error('[dpo/push] patch error', pr.error);
      return NextResponse.json({ ok: true, matched: true, verified: true, payment_status: 'paid' }, { status: 200 });
    }
  } catch (e) {
    console.error('[dpo/push] dpoVerifyToken failed', e);
  }

  return NextResponse.json({ ok: true, matched: true, verified: false }, { status: 200 });
}

