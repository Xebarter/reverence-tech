import { supabase } from './supabase';

export type DpoCheckoutOrderPayload = Record<string, unknown>;

export type DpoCheckoutPaymentPayload = {
  amount: number;
  currency?: string;
  serviceName: string;
  redirectUrl: string;
  statusToken?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string | null;
  };
};

type ApiSuccess = {
  orderNumber: string;
  redirectUrl: string;
  transRef?: string;
  transToken?: string;
  /** Secret returned by the server (`/api/dpo/create-token`); must match `t` on `/payment-result`. */
  statusToken?: string;
};
type ApiFailure = { error?: string; hint?: string };

function sanitizeDpoRedirectUrl(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return trimmed;

  // Ensure the returned redirect is a clean DPO hosted checkout URL and
  // remove the common erroneous "TransToken" prefix from the ID value.
  //
  // Some merchants/accounts see multiple hosted page entrypoints (payv3.php, pay.asp, dpopayment.php).
  // This project standardizes on `payv3.php?ID=<token>` so the browser is always sent to the same path.
  try {
    const url = new URL(trimmed);
    if (/(^|\.)3gdirectpay\.com$/i.test(url.hostname)) {
      const id = url.searchParams.get('ID') ?? url.searchParams.get('id');
      if (id) {
        url.searchParams.set('ID', id.trim().replace(/^TransToken/i, '').trim());
      }
      // Keep DPO’s hosted path as configured (payv3.php, pay.asp, etc.).
      return url.toString();
    }
  } catch {
    // If it's not a valid absolute URL, do a safe string-level cleanup.
  }

  return trimmed.replace(/(\bID=)\s*TransToken/gi, '$1');
}

function isProbablyMissingApiRoute(resp: Response): boolean {
  // Vite dev server commonly returns 404 (or 405) for /api/* when not proxying to Vercel functions.
  return resp.status === 404 || resp.status === 405;
}

async function tryCreateViaApi(order: DpoCheckoutOrderPayload, payment: DpoCheckoutPaymentPayload): Promise<ApiSuccess> {
  const resp = await fetch('/api/dpo/create-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order, payment }),
  });

  const ct = resp.headers.get('content-type') ?? '';
  const json = (ct.includes('application/json')
    ? await resp.json().catch(() => null)
    : null) as (ApiSuccess & ApiFailure) | null;
  const textPreview =
    !json ? await resp.text().then((t) => t.slice(0, 500)).catch(() => '') : '';

  if (!resp.ok) {
    // Only fall back in local development where /api routes might not exist.
    if (import.meta.env.DEV && isProbablyMissingApiRoute(resp)) {
      throw new Error('__DPO_FALLBACK_TO_EDGE_FUNCTION__');
    }
    throw new Error(
      json?.hint ||
        json?.error ||
        (textPreview ? `Failed to initiate payment (HTTP ${resp.status}): ${textPreview}` : null) ||
        `Failed to initiate payment (HTTP ${resp.status})`,
    );
  }

  const orderNumber = json?.orderNumber;
  const redirectUrl = sanitizeDpoRedirectUrl(json?.redirectUrl || '');
  if (!orderNumber || !redirectUrl) throw new Error('Failed to create DPO payment session.');

  return {
    orderNumber,
    redirectUrl,
    transRef: json?.transRef,
    transToken: json?.transToken,
    statusToken: json?.statusToken,
  };
}

async function createViaEdgeFunction(
  order: DpoCheckoutOrderPayload,
  payment: DpoCheckoutPaymentPayload,
): Promise<ApiSuccess> {
  // Local-dev fallback: insert the order directly via the anon client first so we
  // get a real order_number from the DB trigger, then call the edge function with
  // just the orderNumber. Requires the anon role to have INSERT on public.orders
  // (granted by migration 20260421000100_fix_orders_rls_anon_insert.sql).
  const statusToken =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { data: inserted, error: insertError } = await supabase
    .from('orders')
    .insert([{ ...order, status_token: statusToken }])
    .select('order_number')
    .single();

  if (insertError) {
    throw new Error(insertError.message || 'Failed to create order before DPO session');
  }

  const orderNumber = (inserted as { order_number?: string } | null)?.order_number;
  if (!orderNumber) {
    throw new Error('Order created but order_number was not returned');
  }

  const { data, error } = await supabase.functions.invoke('create-dpo-service-payment', {
    body: {
      orderNumber,
      amount: payment.amount,
      currency: payment.currency || 'UGX',
      serviceName: payment.serviceName,
      redirectUrl: payment.redirectUrl,
      statusToken,
      customer: payment.customer,
    },
  });

  if (error) {
    // Preserve the original FunctionsHttpError so callers can read the JSON body.
    throw error;
  }

  const returnedOrderNumber =
    ((data as Record<string, unknown>)?.orderNumber as string | undefined) ?? orderNumber;
  const rawRedirectUrl =
    ((data as Record<string, unknown>)?.redirectUrl as string | undefined) ?? '';
  const redirectUrl = sanitizeDpoRedirectUrl(rawRedirectUrl);
  if (!redirectUrl) throw new Error('Failed to create DPO payment session.');

  return {
    orderNumber: returnedOrderNumber,
    redirectUrl,
    transRef: (data as Record<string, unknown>)?.transRef as string | undefined,
    transToken: (data as Record<string, unknown>)?.transToken as string | undefined,
    statusToken,
  };
}

export async function initiateDpoCheckout(order: DpoCheckoutOrderPayload, payment: DpoCheckoutPaymentPayload): Promise<ApiSuccess> {
  try {
    return await tryCreateViaApi(order, payment);
  } catch (e) {
    if (e instanceof Error && e.message === '__DPO_FALLBACK_TO_EDGE_FUNCTION__') {
      return await createViaEdgeFunction(order, payment);
    }
    throw e;
  }
}

