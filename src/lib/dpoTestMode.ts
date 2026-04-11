/**
 * Set VITE_DPO_TEST_MODE=true in .env to show DPO sandbox test card hints in checkout UIs.
 * Does not enable sandbox on the server; configure Supabase secrets (DPO_COMPANY_TOKEN, etc.) separately.
 */
export function isDpoTestMode(): boolean {
  return import.meta.env.VITE_DPO_TEST_MODE === 'true';
}
