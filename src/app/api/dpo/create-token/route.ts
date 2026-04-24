import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  buildDpoDescriptions,
  DPO_LIVE_PAYMENT_URL,
  DPO_SANDBOX_PAYMENT_URL,
  dpoCreateToken,
  dpoBuildCheckoutUrl,
  dpoFormatAmount,
  dpoServiceDateNow,
  getDpoApiUrl,
  isDpoSandbox,
  splitName,
  withOrderParam,
  withTokenParam,
} from '../../../../server/dpo';
import { validateDpoServerConfig } from '../../../../server/dpoEnv';
import { eq, pgInsertRow, pgPatch } from '../../../../server/supabasePostgrest';

export const runtime = 'nodejs';

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

function isValidAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidAbsoluteHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizePhone(input: string): string {
  // DPO commonly expects a phone-like string; keep digits and leading plus.
  const s = (input || '').trim();
  if (!s) return '';
  const plus = s.startsWith('+') ? '+' : '';
  const digits = s.replace(/[^\d]/g, '');
  return `${plus}${digits}`;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  } as const;
}

export function OPTIONS() {
  return new NextResponse('ok', { status: 200, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const companyToken = (process.env.DPO_COMPANY_TOKEN || '').trim();
    const serviceType = (process.env.DPO_SERVICE_TYPE || '').trim();
    const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500, headers: corsHeaders() },
      );
    }
    if (!companyToken || !serviceType) {
      return NextResponse.json(
        { error: 'Missing DPO_COMPANY_TOKEN or DPO_SERVICE_TYPE' },
        { status: 500, headers: corsHeaders() },
      );
    }
    if (!siteUrl) {
      return NextResponse.json(
        { error: 'Missing SITE_URL (needed to build DPO callback URL)' },
        { status: 500, headers: corsHeaders() },
      );
    }

    const body = (await req.json()) as CreateTokenBody;
    const order = body?.order;
    const payment = body?.payment;

    const amount = Number(payment?.amount);
    const currency = (payment?.currency || 'UGX').toString();
    const redirectUrl = payment?.redirectUrl;

    if (!order || typeof order !== 'object') {
      return NextResponse.json({ error: 'Missing order payload' }, { status: 400, headers: corsHeaders() });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Missing or invalid amount' }, { status: 400, headers: corsHeaders() });
    }
    if (!redirectUrl) {
      return NextResponse.json({ error: 'Missing redirectUrl' }, { status: 400, headers: corsHeaders() });
    }

    const serviceName = payment?.serviceName || 'Service Payment';
    const customer = payment?.customer || {};

    if (!customer?.fullName?.trim()) {
      return NextResponse.json({ error: 'Missing customer full name' }, { status: 400, headers: corsHeaders() });
    }
    if (!customer?.email?.trim()) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400, headers: corsHeaders() });
    }
    if (!customer?.phone?.trim()) {
      return NextResponse.json({ error: 'Missing customer phone' }, { status: 400, headers: corsHeaders() });
    }
    if (!isValidAbsoluteHttpUrl(redirectUrl)) {
      return NextResponse.json({ error: 'redirectUrl must be an absolute URL' }, { status: 400, headers: corsHeaders() });
    }
    if (!isValidAbsoluteHttpsUrl(siteUrl)) {
      return NextResponse.json(
        { error: 'SITE_URL must be an absolute https URL on Vercel' },
        { status: 500, headers: corsHeaders() },
      );
    }

    // Insert pending order
    const statusToken = randomUUID();
    const { row: inserted, error: insertError } = await pgInsertRow(
      supabaseUrl,
      serviceRoleKey,
      'orders',
      { ...order, status_token: statusToken },
    );

    if (insertError) {
      return NextResponse.json({ error: insertError }, { status: 400, headers: corsHeaders() });
    }

    const orderNumber = inserted?.order_number != null ? String(inserted.order_number) : '';
    const orderId = inserted?.id != null ? String(inserted.id) : '';
    if (!orderNumber || !orderId) {
      return NextResponse.json({ error: 'Order created but missing id/order_number' }, { status: 500, headers: corsHeaders() });
    }

    const markFailed = async () => {
      await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      });
    };

    const split = splitName(customer?.fullName);
    const firstName = split.firstName || 'Customer';
    const lastName = split.lastName || 'Customer';
    const { rootDescription, bookingDescription } = buildDpoDescriptions(serviceName, (order as any).items);
    const backUrl = `${siteUrl}/api/dpo/callback?order=${encodeURIComponent(orderNumber)}`;
    const redirectUrlFinal = withTokenParam(withOrderParam(redirectUrl, orderNumber), statusToken);
    const apiUrl = getDpoApiUrl();
    const paymentPageBase =
      (process.env.DPO_PAYMENT_URL || '').trim() || (isDpoSandbox() ? DPO_SANDBOX_PAYMENT_URL : DPO_LIVE_PAYMENT_URL);

    const configErr = validateDpoServerConfig({
      apiUrl,
      paymentPageBase,
      vercelEnv: process.env.VERCEL_ENV,
    });
    if (configErr) {
      return NextResponse.json({ error: configErr }, { status: 500, headers: corsHeaders() });
    }

    if (!isValidAbsoluteHttpsUrl(backUrl) || !isValidAbsoluteHttpUrl(redirectUrlFinal)) {
      return NextResponse.json(
        { error: 'Internal URL configuration error (invalid BackURL/RedirectURL)' },
        { status: 500, headers: corsHeaders() },
      );
    }

    let transToken: string;
    let transRef: string | null;
    try {
      ({ transToken, transRef } = await dpoCreateToken({
        companyToken,
        serviceType,
        apiUrl,
        paymentAmount: dpoFormatAmount(amount, currency),
        currency,
        companyRef: orderNumber,
        redirectUrl: redirectUrlFinal,
        backUrl,
        description: rootDescription,
        bookingDescription,
        firstName,
        lastName,
        email: customer.email,
        phone: normalizePhone(customer.phone),
        serviceDate: dpoServiceDateNow(),
      }));
    } catch (e) {
      await markFailed();
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : 'DPO createToken failed',
          hint:
            'On Vercel Production, ensure DPO_COMPANY_TOKEN and DPO_SERVICE_TYPE are LIVE and match each other, and SITE_URL is https.',
        },
        { status: 502, headers: corsHeaders() },
      );
    }

    await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
      ...(transRef ? { payment_reference: transRef } : {}),
      trans_token: transToken,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        orderNumber,
        redirectUrl: dpoBuildCheckoutUrl(transToken),
        transRef,
        transToken,
        statusToken,
      },
      { status: 200, headers: corsHeaders() },
    );
  } catch (e) {
    console.error('[dpo/create-token] fatal', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

