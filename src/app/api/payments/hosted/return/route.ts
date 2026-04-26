import { NextResponse } from 'next/server';
import { getPublicAppBaseUrl } from '../../../../../server/appBaseUrl';
import { tryFinalizeHostedOrderByTransactionToken } from '../../../../../server/orderHostedCheckout';
import { extractTransactionTokenFromPayload } from '../../../../../server/hostedCheckoutGateway';

export const runtime = 'nodejs';

function resolvePublicBase(req: Request): string {
  try {
    return getPublicAppBaseUrl();
  } catch {
    return new URL(req.url).origin;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = extractTransactionTokenFromPayload(url.searchParams, '');
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const base = resolvePublicBase(req);
  const fallbackOrders = `${base}/orders`;

  if (!token || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(fallbackOrders);
  }

  const result = await tryFinalizeHostedOrderByTransactionToken(supabaseUrl, serviceRoleKey, token);
  if (!result) {
    return NextResponse.redirect(fallbackOrders);
  }

  const dest = `${base}/payment-result?order=${encodeURIComponent(result.orderNumber)}&t=${encodeURIComponent(result.statusToken)}`;
  return NextResponse.redirect(dest);
}
