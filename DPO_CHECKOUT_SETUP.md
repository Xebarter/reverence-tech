# DPO checkout (production)

Live payments use **DPO Pay** credentials and **HTTPS** URLs. **TransToken** is always created for the **CompanyToken** you send — the app cannot force “production” tokens if your `DPO_COMPANY_TOKEN` is still a test account. Use **live** token and **live** service ID from DPO on Production.

- **`DPO_MERCHANT_MODE`** — Defaults to **`production`**. In that mode, `/api/dpo/create-token` **rejects** URLs containing `sandbox`. Set `DPO_MERCHANT_MODE=sandbox` only for local/preview when you intentionally use sandbox hosts. **Vercel Production** must not use `sandbox` mode (the handler returns 500).

Use the endpoints DPO gives you for your live account (often `https://secure.3gdirectpay.com/API/v6/` and `payv3.php?ID=`).

## 1) Vercel (primary)

Set these in the Vercel project **Production** environment:

| Variable | Purpose |
|----------|---------|
| `DPO_MERCHANT_MODE` | `production` (default) or `sandbox` — never `sandbox` on Vercel Production |
| `DPO_COMPANY_TOKEN` | Live company token from DPO |
| `DPO_SERVICE_TYPE` | Live service ID from DPO |
| `DPO_API_URL` | e.g. `https://secure.3gdirectpay.com/API/v6/` |
| `DPO_PAYMENT_URL` | Exact hosted page from DPO, e.g. `https://secure.3gdirectpay.com/payv3.php?ID=` (see note below) |
| `DPO_BACK_URL` | Public **BackURL** callback, e.g. `https://yourdomain.com/api/dpo/callback` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `ALLOWED_ORIGINS` | Optional. Comma-separated site origins for payment API CORS |

**Payment URL:** When DPO sends `https://secure.3gdirectpay.com/payv3.php?ID=token`, the word `token` is only documentation — your env value must be **`...payv3.php?ID=`** with nothing after `=`. The API appends the real `TransToken`. If you paste `...ID=token`, the app strips that placeholder.

`createToken` runs on **`/api/dpo/create-token`**. The DPO server callback is **`/api/dpo/callback`** (same behavior as the Supabase Edge function `dpo-service-payment-callback`, if you still deploy it for local/dev fallback).

## 2) Supabase Edge (optional / dev fallback)

If you use `supabase functions invoke` from the browser in development, set the same `DPO_*` values as **secrets** on the Supabase project:

- `create-dpo-service-payment`
- `dpo-service-payment-callback` (only if you point `DPO_BACK_URL` at Supabase instead of Vercel)

## 3) Database

Ensure migration is applied:

- `supabase/migrations/20260327000100_add_dpo_payment_method_to_orders.sql`
- `supabase/migrations/20260409200000_add_trans_token_to_orders.sql` (if not already applied)

## 4) Verify after deploy

1. Use the **real** storefront URL (same origin as production).
2. Checkout with **DPO Pay**, complete a **small** live or pilot payment.
3. Confirm redirect to `/payment-result?order=…&t=…` and order becomes **paid** in the admin orders view.
4. Check Vercel logs for `/api/dpo/create-token` and `/api/dpo/callback`.

## 5) Frontend

- Do **not** set `VITE_DPO_TEST_MODE=true` in production. Leave it unset or `false`.
- Production builds **do not** register `/test-admin`, `/admin-temp`, or `/admin/test-admin-users` (development only).
