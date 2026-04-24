import { NextResponse } from 'next/server';
import { dpoVerifyToken } from '../../../../server/dpo';
import { validateDpoServerConfig } from '../../../../server/dpoEnv';
import { eq, pgPatch, pgSelect } from '../../../../server/supabasePostgrest';

export const runtime = 'nodejs';

function corsHeaders(req: Request) {
  const raw = (process.env.ALLOWED_ORIGINS || '').trim();
  const origin = (req.headers.get('origin') || '').trim();

  if (raw) {
    const allowed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (origin && allowed.includes(origin)) {
      return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } as Record<string, string>;
    }
    return {} as Record<string, string>;
  }

  return { 'Access-Control-Allow-Origin': '*' } as Record<string, string>;
}

export function OPTIONS(req: Request) {
  return new NextResponse('ok', {
    status: 200,
    headers: {
      ...corsHeaders(req),
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderNumber = (url.searchParams.get('order') || '').trim();
  const token = (url.searchParams.get('t') || '').trim();

  const baseHeaders = {
    ...corsHeaders(req),
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };

  if (!orderNumber || !token) {
    return NextResponse.json({ error: 'Missing order or token' }, { status: 400, headers: baseHeaders });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 500, headers: baseHeaders },
    );
  }

  const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
  const dpoConfigError = validateDpoServerConfig({
    apiUrl,
    paymentPageBase: process.env.DPO_PAYMENT_URL || '',
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (dpoConfigError) {
    return NextResponse.json({ error: dpoConfigError }, { status: 500, headers: baseHeaders });
  }

  const selQ = `${eq('order_number', orderNumber)}&${eq('status_token', token)}`;
  const { rows, error } = await pgSelect(
    supabaseUrl,
    serviceRoleKey,
    'orders',
    selQ,
    'payment_status,payment_reference,order_status,trans_token',
  );

  if (error) return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500, headers: baseHeaders });
  const data = rows[0];
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: baseHeaders });

  const payStatus = data.payment_status != null ? String(data.payment_status) : '';
  const transTok = data.trans_token != null ? String(data.trans_token) : '';
  const pref =
    data.payment_reference != null && data.payment_reference !== '' ? String(data.payment_reference) : null;
  const ordStat = data.order_status != null ? String(data.order_status) : null;

  if (payStatus === 'paid' || payStatus === 'failed' || payStatus === 'refunded') {
    return NextResponse.json(
      { payment_status: payStatus, payment_reference: pref, order_status: ordStat },
      { status: 200, headers: baseHeaders },
    );
  }

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
          if (pr.error) console.error('[orders/status] patch error (paid)', pr.error);
          return NextResponse.json(
            { payment_status: 'paid', payment_reference: transRef ?? pref, order_status: 'confirmed' },
            { status: 200, headers: baseHeaders },
          );
        }
        if (result === '002' || result === '003') {
          await pgPatch(supabaseUrl, serviceRoleKey, 'orders', selQ, {
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          });
          return NextResponse.json(
            { payment_status: 'failed', payment_reference: pref, order_status: ordStat },
            { status: 200, headers: baseHeaders },
          );
        }
      } catch (e) {
        console.error('[orders/status] dpoVerifyToken error', e);
      }
    }
  }

  return NextResponse.json(
    { payment_status: payStatus || null, payment_reference: pref, order_status: ordStat },
    { status: 200, headers: baseHeaders },
  );
}

