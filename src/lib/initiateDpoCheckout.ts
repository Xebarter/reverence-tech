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
      const id = url.searchParams.get('ID');
      if (id) {
        url.searchParams.set('ID', id.trim().replace(/^TransToken/i, '').trim());
      }
      // Force the payment page path to payv3.php.
      url.pathname = '/payv3.php';
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

  const json = (await resp.json().catch(() => null)) as (ApiSuccess & ApiFailure) | null;

  if (!resp.ok) {
    if (isProbablyMissingApiRoute(resp)) {
      throw new Error('__DPO_FALLBACK_TO_EDGE_FUNCTION__');
    }
    throw new Error(json?.hint || json?.error || `Failed to initiate payment (HTTP ${resp.status})`);
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

async function createViaEdgeFunction(order: DpoCheckoutOrderPayload, payment: DpoCheckoutPaymentPayload): Promise<ApiSuccess> {
  // Ask Supabase Edge Function to create both the order (server-side) and the DPO payment token.
  const { data, error } = await supabase.functions.invoke('create-dpo-service-payment', {
    body: {
      order,
      amount: payment.amount,
      currency: payment.currency || 'UGX',
      serviceName: payment.serviceName,
      redirectUrl: payment.redirectUrl,
      statusToken: payment.statusToken,
      customer: payment.customer,
    },
  });

  if (error) {
    // Preserve the original FunctionsHttpError so callers can read the JSON body via `context`.
    throw error;
  }

  const orderNumber = (data as any)?.orderNumber as string | undefined;
  if (!orderNumber) throw new Error('Order created but missing orderNumber');
  const redirectUrl = sanitizeDpoRedirectUrl(((data as any)?.redirectUrl as string | undefined) || '');
  if (!redirectUrl) throw new Error('Failed to create DPO payment session.');

  return {
    orderNumber,
    redirectUrl,
    transRef: (data as any)?.transRef,
    transToken: (data as any)?.transToken,
    statusToken: payment.statusToken,
  };
}

export async function initiateDpoCheckout(order: DpoCheckoutOrderPayload, payment: DpoCheckoutPaymentPayload): Promise<ApiSuccess> {
  try {
    return await tryCreateViaApi(order, payment);
  } catch (e) {
    if (e instanceof Error && e.message === '__DPO_FALLBACK_TO_EDGE_FUNCTION__') {
      return await createViaEdgeFunction(order, payment);
    }
    // For production (e.g. Vercel), do NOT silently fall back to Supabase Edge Functions:
    // DPO can block Supabase Edge egress, and it also makes failures harder to diagnose.
    // In dev, an extra fallback helps when the local serverless route isn't available.
    if (import.meta.env.DEV) {
      try {
        return await createViaEdgeFunction(order, payment);
      } catch {
        throw e;
      }
    }
    throw e;
  }
}

