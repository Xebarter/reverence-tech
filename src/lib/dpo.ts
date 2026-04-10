/**
 * Client-side DPO payment helpers.
 * All calls go to Vercel serverless functions -- no Edge Function fallback.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DpoCheckoutOrder = Record<string, unknown>;

export type DpoCheckoutPayment = {
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

export type OrderStatusSnapshot = {
  payment_status: 'paid' | 'failed' | 'pending' | 'refunded' | null;
  payment_reference: string | null;
  order_status: string | null;
};

export type ConfirmDpoResultParams = {
  orderNumber: string;
  statusToken: string;
  dpoResult: string;
  transRef?: string;
};

type CheckoutResult = {
  orderNumber: string;
  redirectUrl: string;
  statusToken: string;
};

// ---------------------------------------------------------------------------
// initiateDpoCheckout
// ---------------------------------------------------------------------------

export async function initiateDpoCheckout(
  order: DpoCheckoutOrder,
  payment: DpoCheckoutPayment,
): Promise<CheckoutResult> {
  const resp = await fetch('/api/dpo/create-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order, payment }),
  });

  const json = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw new Error(
      json?.hint || json?.error || `Failed to initiate payment (HTTP ${resp.status})`,
    );
  }

  const orderNumber = json?.orderNumber as string | undefined;
  const redirectUrl = json?.redirectUrl as string | undefined;
  const statusToken = json?.statusToken as string | undefined;

  if (!orderNumber || !redirectUrl) {
    throw new Error('Failed to create DPO payment session.');
  }

  return { orderNumber, redirectUrl, statusToken: statusToken || '' };
}

// ---------------------------------------------------------------------------
// fetchOrderStatus
// ---------------------------------------------------------------------------

export async function fetchOrderStatus(
  orderNumber: string,
  token: string,
): Promise<OrderStatusSnapshot> {
  const resp = await fetch(
    `/api/orders/status?order=${encodeURIComponent(orderNumber)}&t=${encodeURIComponent(token)}`,
    { method: 'GET' },
  );

  const json = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw new Error(json?.error || `Failed to fetch order status (HTTP ${resp.status})`);
  }

  return {
    payment_status: (json?.payment_status as OrderStatusSnapshot['payment_status']) ?? null,
    payment_reference: (json?.payment_reference as string | null) ?? null,
    order_status: (json?.order_status as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// confirmDpoResult
// ---------------------------------------------------------------------------

export async function confirmDpoResult(
  params: ConfirmDpoResultParams,
): Promise<OrderStatusSnapshot> {
  const resp = await fetch('/api/orders/confirm-dpo-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await resp.json().catch(() => null);

  if (!resp.ok) {
    throw new Error(json?.error || `Confirm failed (HTTP ${resp.status})`);
  }

  return {
    payment_status: (json?.payment_status as OrderStatusSnapshot['payment_status']) ?? null,
    payment_reference: (json?.payment_reference as string | null) ?? null,
    order_status: (json?.order_status as string | null) ?? null,
  };
}
