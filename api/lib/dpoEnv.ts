/**
 * DPO does not expose a separate "test flag" in createToken XML — the TransToken is always
 * issued for whichever CompanyToken / service you send. Production vs sandbox is therefore
 * entirely determined by env (live credentials + live hosts).
 */

export type DpoMerchantMode = 'production' | 'sandbox';

export function getDpoMerchantMode(): DpoMerchantMode {
  const raw = (process.env.DPO_MERCHANT_MODE || 'production').toLowerCase().trim();
  return raw === 'sandbox' ? 'sandbox' : 'production';
}

/**
 * Returns an error message if configuration contradicts production rules; otherwise null.
 */
export function validateDpoServerConfig(params: {
  apiUrl: string;
  paymentPageBase: string;
  vercelEnv: string | undefined;
}): string | null {
  const mode = getDpoMerchantMode();

  if (params.vercelEnv === 'production' && mode === 'sandbox') {
    return (
      'This deployment is Vercel Production but DPO_MERCHANT_MODE=sandbox. ' +
      'Unset DPO_MERCHANT_MODE or set it to production, and use live DPO credentials.'
    );
  }

  if (mode === 'production') {
    const blob = `${params.apiUrl} ${params.paymentPageBase}`.toLowerCase();
    if (blob.includes('sandbox')) {
      return (
        'DPO_MERCHANT_MODE is production but DPO_API_URL or DPO_PAYMENT_URL contains "sandbox". ' +
        'Use the live hosts DPO gave you, or set DPO_MERCHANT_MODE=sandbox only on local/preview.'
      );
    }
  }

  return null;
}
