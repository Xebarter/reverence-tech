# DPO Checkout Setup

This project now supports DPO checkout from the shop checkout page.

## 1) Set Supabase Edge Function secrets

Set these in your Supabase project (Dashboard or CLI):

- `DPO_COMPANY_TOKEN` = your DPO test company token
- `DPO_SERVICE_TYPE` = your DPO test service ID
- `DPO_API_URL` = your DPO API endpoint (for example `https://secure.3gdirectpay.com/API/v6/`)
- `DPO_PAYMENT_URL` = your DPO payment base URL (for example `https://secure.3gdirectpay.com/pay.asp?ID=`)
- `DPO_BACK_URL` = public callback URL for `dpo-service-payment-callback`

`DPO_BACK_URL` should look like:

`https://<project-ref>.functions.supabase.co/dpo-service-payment-callback`

## 2) Apply database migration

This migration allows `dpo` in the `orders.payment_method` constraint:

- `supabase/migrations/20260327000100_add_dpo_payment_method_to_orders.sql`

Run your normal migration flow (local or remote).

## 3) Deploy/redeploy edge functions

Deploy both functions:

- `create-dpo-service-payment`
- `dpo-service-payment-callback`

## 4) Test flow

1. Add products to cart.
2. Open checkout.
3. Keep payment method as **DPO Pay**.
4. Submit checkout.
5. Confirm browser redirects to DPO.
6. Complete test payment in DPO.
7. Confirm redirect back to `/payment-result?order=<ORDER_NUMBER>`.
8. Confirm order status changes from `pending` to `paid` after callback.

## Notes

- Manual payment methods (mobile money, bank transfer, cash, other) still work.
- DPO transaction reference is saved into `orders.payment_reference` when available.
