import { eq, pgPatch, pgSelect } from './supabasePostgrest';
import { getPublicAppBaseUrl } from './appBaseUrl';
import {
  createHostedPaymentSession,
  hostedPaymentPageUrl,
  verifyHostedTransaction,
} from './hostedCheckoutGateway';

export function orderDescriptionFromRow(row: Record<string, unknown>): string {
  const items = row.items;
  if (Array.isArray(items) && items[0] && typeof items[0] === 'object' && items[0] !== null) {
    const pn = (items[0] as { product_name?: string }).product_name;
    if (typeof pn === 'string' && pn.trim()) return pn.trim().slice(0, 120);
  }
  const num = row.order_number != null ? String(row.order_number) : '';
  return num ? `Order ${num}` : 'Order';
}

export async function attachHostedCheckoutToOrder(
  supabaseUrl: string,
  serviceKey: string,
  row: Record<string, unknown>,
  serviceDescription: string,
): Promise<string> {
  const orderNumber = String(row.order_number);
  const orderId = String(row.id);
  const amount = Number(row.total_amount);
  const email = String(row.customer_email ?? '');
  const name = String(row.customer_name ?? '');

  const base = getPublicAppBaseUrl();
  const returnUrl = `${base}/api/payments/hosted/return`;
  const notifyUrl = `${base}/api/payments/hosted/notify`;

  const currency = process.env.HOSTED_CHECKOUT_CURRENCY?.trim() || 'UGX';

  const { transToken } = await createHostedPaymentSession({
    companyRef: orderNumber,
    paymentAmount: amount,
    paymentCurrency: currency,
    redirectUrl: returnUrl,
    backUrl: notifyUrl,
    customerName: name,
    customerEmail: email,
    serviceDescription,
  });

  const { error } = await pgPatch(supabaseUrl, serviceKey, 'orders', eq('id', orderId), {
    trans_token: transToken,
    payment_method: 'dpo',
  });
  if (error) throw new Error(error);

  return hostedPaymentPageUrl(transToken);
}

export async function finalizeHostedOrderByTransactionToken(
  supabaseUrl: string,
  serviceKey: string,
  transactionToken: string,
): Promise<{ orderNumber: string; statusToken: string } | null> {
  const { rows, error } = await pgSelect(
    supabaseUrl,
    serviceKey,
    'orders',
    eq('trans_token', transactionToken),
    'id,order_number,status_token,payment_status',
  );
  if (error || !rows[0]) return null;
  const row = rows[0];

  if (String(row.payment_status) === 'paid') {
    return { orderNumber: String(row.order_number), statusToken: String(row.status_token) };
  }

  const v = await verifyHostedTransaction(transactionToken);
  const patch: Record<string, unknown> = {
    payment_status: v.payment_status,
    payment_reference: v.reference,
  };
  if (v.payment_status === 'paid') patch.order_status = 'processing';

  await pgPatch(supabaseUrl, serviceKey, 'orders', eq('id', String(row.id)), patch);

  return { orderNumber: String(row.order_number), statusToken: String(row.status_token) };
}

export async function tryFinalizeHostedOrderByTransactionToken(
  supabaseUrl: string,
  serviceKey: string,
  transactionToken: string,
): Promise<{ orderNumber: string; statusToken: string } | null> {
  try {
    return await finalizeHostedOrderByTransactionToken(supabaseUrl, serviceKey, transactionToken);
  } catch (e) {
    console.error('[hosted-checkout] verify/finalize failed', e);
    const { rows } = await pgSelect(
      supabaseUrl,
      serviceKey,
      'orders',
      eq('trans_token', transactionToken),
      'order_number,status_token',
    );
    const r = rows[0];
    if (!r) return null;
    return { orderNumber: String(r.order_number), statusToken: String(r.status_token) };
  }
}
