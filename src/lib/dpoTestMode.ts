/**
 * Production builds: always false unless explicitly overridden.
 * Set NEXT_PUBLIC_DPO_TEST_MODE=true only in local .env when using DPO sandbox credentials.
 * Never enable for production deployments.
 */
export function isDpoTestModeEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.NEXT_PUBLIC_DPO_TEST_MODE === 'true';
}
