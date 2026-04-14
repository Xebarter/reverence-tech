/**
 * Production builds: always false unless explicitly overridden.
 * Set VITE_DPO_TEST_MODE=true only in local .env when using DPO sandbox credentials.
 * Never enable for production deployments.
 */
export function isDpoTestModeEnabled(): boolean {
  return import.meta.env.VITE_DPO_TEST_MODE === 'true';
}
