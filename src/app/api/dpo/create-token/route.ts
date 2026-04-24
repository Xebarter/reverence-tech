import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  buildDpoDescriptions,
  dpoCreateToken,
  dpoBuildCheckoutUrl,
  dpoFormatAmount,
  dpoServiceDateNow,
  getDpoApiUrl,
  splitName,
  withOrderParam,
  withTokenParam,
} from '../../../../server/dpo';
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
    const companyToken = process.env.DPO_COMPANY_TOKEN;
    const serviceType = process.env.DPO_SERVICE_TYPE;
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

    const { firstName, lastName } = splitName(customer?.fullName);
    const { rootDescription, bookingDescription } = buildDpoDescriptions(serviceName, (order as any).items);
    const backUrl = `${siteUrl}/api/dpo/callback?order=${encodeURIComponent(orderNumber)}`;
    const redirectUrlFinal = withTokenParam(withOrderParam(redirectUrl, orderNumber), statusToken);
    const apiUrl = getDpoApiUrl();

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
        email: customer?.email || '',
        phone: customer?.phone || '',
        serviceDate: dpoServiceDateNow(),
      }));
    } catch (e) {
      await markFailed();
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'DPO createToken failed' },
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

