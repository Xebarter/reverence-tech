# DPO Payment Integration (Production)

All DPO logic runs through **Vercel serverless functions** under `api/`.
There are no Supabase Edge Functions involved in the payment flow.

## Environment Variables (Vercel)

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Description | Example |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (secret) | `eyJ…` |
| `DPO_COMPANY_TOKEN` | Your DPO company token | *(from DPO dashboard)* |
| `DPO_SERVICE_TYPE` | DPO service type ID | `111455` or `111804` |
| `DPO_API_URL` | DPO XML API endpoint | `https://secure.3gdirectpay.com/API/v6/` |
| `DPO_PAYMENT_URL` | DPO hosted payment page | `https://secure.3gdirectpay.com/dpopayment.php?ID=` |
| `DPO_BACK_URL` | Your callback URL (DPO calls this server-to-server) | `https://yourdomain.com/api/dpo/callback` |

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/dpo/create-token` | POST | Create order + DPO payment token, return redirect URL |
| `/api/dpo/callback` | GET/POST | DPO BackURL handler (server-to-server payment notification) |
| `/api/orders/status` | GET | Fetch order status (with active DPO verification if pending) |
| `/api/orders/confirm-dpo-result` | POST | Confirm payment after redirect (verifyToken + fallback) |

## Database

The `orders` table requires these columns (added by migrations):

- `status_token` — secret token for client-side status lookups
- `trans_token` — DPO TransToken for server-side verification
- `payment_method` must allow `'dpo'`

Relevant migrations:

- `20260327000100_add_dpo_payment_method_to_orders.sql`
- `20260409000100_add_order_status_token.sql`
- `20260409200000_add_trans_token_to_orders.sql`

## Payment Flow

1. Customer fills checkout form and selects **DPO Pay**.
2. Frontend calls `POST /api/dpo/create-token` with order + payment details.
3. Server inserts the order, calls DPO `createToken`, persists `trans_token`.
4. Frontend redirects to DPO hosted payment page.
5. After payment, DPO calls `POST /api/dpo/callback` (BackURL) to update the order.
6. DPO redirects customer to `/payment-result?order=…&t=…&Result=…`.
7. Payment result page calls `POST /api/orders/confirm-dpo-result` to verify.
8. If still pending, the page polls `GET /api/orders/status` every 5 seconds.

## Test Flow

1. Set DPO sandbox credentials in Vercel env vars.
2. Add products to cart → Checkout → DPO Pay → Submit.
3. Complete test payment on DPO sandbox.
4. Confirm redirect back to `/payment-result` with success status.
5. Confirm order status changes to `paid` / `confirmed`.

## Switching to Production

1. Replace sandbox `DPO_COMPANY_TOKEN` with your live company token.
2. Set `DPO_SERVICE_TYPE` to the appropriate live service ID.
3. Set `DPO_API_URL` to `https://secure.3gdirectpay.com/API/v6/`.
4. Set `DPO_BACK_URL` to your production domain callback URL.
5. Redeploy on Vercel.
