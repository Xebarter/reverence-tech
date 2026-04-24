import { NextResponse } from 'next/server';
import { dpoVerifyToken, getDpoApiUrl } from '../../../../server/dpo';
import { validateDpoServerConfig } from '../../../../server/dpoEnv';
import { eq, pgPatch, pgSelect } from '../../../../server/supabasePostgrest';

export const runtime = 'nodejs';

type ConfirmBody = {
  orderNumber: string;
  statusToken: string;
  dpoResult?: string;
  transRef?: string;
};

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
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    },
  });
}

export async function POST(req: Request) {
  const baseHeaders = {
    ...corsHeaders(req),
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  };

  let body: Partial<ConfirmBody> | null = null;
  try {
    body = (await req.json()) as Partial<ConfirmBody>;
  } catch {
    body = null;
  }

  const orderNumber = (body?.orderNumber || '').trim();
  const statusToken = (body?.statusToken || '').trim();
  const clientTransRef = (body?.transRef || '').trim();

  if (!orderNumber || !statusToken) {
    return NextResponse.json({ error: 'Missing orderNumber or statusToken' }, { status: 400, headers: baseHeaders });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500, headers: baseHeaders });
  }

  const apiUrl = getDpoApiUrl();
  const dpoConfigError = validateDpoServerConfig({
    apiUrl,
    paymentPageBase: process.env.DPO_PAYMENT_URL || '',
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (dpoConfigError) {
    return NextResponse.json({ error: dpoConfigError }, { status: 500, headers: baseHeaders });
  }

  const selQ = `${eq('order_number', orderNumber)}&${eq('status_token', statusToken)}`;
  const { rows, error } = await pgSelect(
    supabaseUrl,
    serviceRoleKey,
    'orders',
    selQ,
    'id,payment_status,payment_reference,order_status,trans_token',
  );
  if (error) return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500, headers: baseHeaders });
  const data = rows[0];
  if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: baseHeaders });

  const payStatus = data.payment_status != null ? String(data.payment_status) : '';
  const pref = data.payment_reference != null && data.payment_reference !== '' ? String(data.payment_reference) : null;

  if (payStatus === 'paid' || payStatus === 'refunded') {
    return NextResponse.json(
      {
        payment_status: payStatus,
        payment_reference: pref ?? (clientTransRef || null),
        order_status: data.order_status != null ? String(data.order_status) : null,
      },
      { status: 200, headers: baseHeaders },
    );
  }

  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const transTok = data.trans_token != null ? String(data.trans_token) : '';

  if (transTok && companyToken) {
    try {
      const { result: dpoVerifyResult, transRef: verifiedRef } = await dpoVerifyToken(transTok, companyToken, apiUrl);
      if (dpoVerifyResult === '000') {
        const ref = verifiedRef || clientTransRef || pref;
        const patch: Record<string, unknown> = {
          payment_status: 'paid',
          order_status: 'confirmed',
          updated_at: new Date().toISOString(),
        };
        if (ref) patch.payment_reference = ref;
        const pr = await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), patch);
        if (pr.error) {
          console.error('[confirm-dpo-result] patch error (paid)', pr.error);
          return NextResponse.json({ error: 'Failed to update order' }, { status: 500, headers: baseHeaders });
        }
        return NextResponse.json(
          { payment_status: 'paid', payment_reference: ref ?? null, order_status: 'confirmed' },
          { status: 200, headers: baseHeaders },
        );
      }

      if (dpoVerifyResult === '002' || dpoVerifyResult === '003') {
        await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(data.id)), {
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        });
        return NextResponse.json(
          {
            payment_status: 'failed',
            payment_reference: pref,
            order_status: data.order_status != null ? String(data.order_status) : null,
          },
          { status: 200, headers: baseHeaders },
        );
      }
    } catch (e) {
      console.error('[confirm-dpo-result] dpoVerifyToken error', e);
    }
  }

  return NextResponse.json(
    {
      payment_status: payStatus || null,
      payment_reference: pref ?? (clientTransRef || null),
      order_status: data.order_status != null ? String(data.order_status) : null,
    },
    { status: 200, headers: baseHeaders },
  );
}

