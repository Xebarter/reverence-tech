/**
 * Shared DPO (3G Direct Pay) utilities for all Vercel serverless functions.
 * Handles XML construction/parsing, token creation, and token verification.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DpoCreateTokenParams = {
  companyToken: string;
  serviceType: string;
  apiUrl: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  orderNumber: string;
  redirectUrl: string;
  backUrl: string;
  serviceName: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
};

export type DpoCreateTokenResult = {
  transToken: string;
  transRef: string | null;
  redirectUrl: string;
};

export type DpoVerifyResult = {
  result: string | null;
  resultExplanation: string | null;
  transRef: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DPO_HEADERS: Record<string, string> = {
  'Content-Type': 'application/xml; charset=utf-8',
  Accept: 'application/xml',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DEFAULT_API_URL = 'https://secure.3gdirectpay.com/API/v6/';
const DEFAULT_PAYMENT_URL = 'https://secure.3gdirectpay.com/dpopayment.php?ID=';

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Normalise any DPO payment page URL so it ends with `dpopayment.php?ID=`.
 * Handles legacy payv2/payv3/pay.asp URLs and common placeholder mistakes.
 */
export function normalizeDpoPaymentUrl(input?: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return DEFAULT_PAYMENT_URL;

  try {
    const url = new URL(trimmed);
    if (/(^|\.)3gdirectpay\.com$/i.test(url.hostname)) {
      url.pathname = '/dpopayment.php';
      url.search = '?ID=';
      url.hash = '';
      return url.toString();
    }
  } catch {
    /* fall through */
  }

  const stripped = trimmed.replace(/(ID=)(token|transtoken|\{token\}|<token>)\s*$/i, '$1');
  if (/([?&]ID=)$/i.test(stripped)) return stripped;
  if (/([?&]ID=)/i.test(stripped)) return stripped.replace(/([?&]ID=).*/i, '$1');
  return stripped.includes('?') ? `${stripped}&ID=` : `${stripped}?ID=`;
}

export function appendQueryParam(url: string, key: string, value: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}${key}=${encodeURIComponent(value)}`;
  }
}

// ---------------------------------------------------------------------------
// Name helpers
// ---------------------------------------------------------------------------

export function splitName(fullName?: string | null): { firstName: string; lastName: string } {
  const trimmed = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

export function getDpoEnv() {
  const companyToken = process.env.DPO_COMPANY_TOKEN || '';
  const serviceType = process.env.DPO_SERVICE_TYPE || '';
  const backUrl = process.env.DPO_BACK_URL || '';
  const apiUrl = process.env.DPO_API_URL || DEFAULT_API_URL;
  const paymentUrl = normalizeDpoPaymentUrl(process.env.DPO_PAYMENT_URL || DEFAULT_PAYMENT_URL);

  return { companyToken, serviceType, backUrl, apiUrl, paymentUrl };
}

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, serviceRoleKey };
}

// ---------------------------------------------------------------------------
// DPO API: createToken
// ---------------------------------------------------------------------------

export async function createDpoToken(params: DpoCreateTokenParams): Promise<DpoCreateTokenResult> {
  const {
    companyToken,
    serviceType,
    apiUrl,
    paymentUrl,
    amount,
    currency,
    orderNumber,
    redirectUrl,
    backUrl,
    serviceName,
    customer,
  } = params;

  const paymentAmount =
    currency.toUpperCase() === 'UGX' ? String(Math.round(amount)) : amount.toFixed(2);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const serviceDate = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${escapeXml(paymentAmount)}</PaymentAmount>
    <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
    <CompanyRef>${escapeXml(orderNumber)}</CompanyRef>
    <RedirectURL>${escapeXml(redirectUrl)}</RedirectURL>
    <BackURL>${escapeXml(backUrl)}</BackURL>
    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>
    <customerFirstName>${escapeXml(customer?.firstName || '')}</customerFirstName>
    <customerLastName>${escapeXml(customer?.lastName || '')}</customerLastName>
    <customerEmail>${escapeXml(customer?.email || '')}</customerEmail>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${escapeXml(serviceType)}</ServiceType>
      <ServiceDescription>${escapeXml(serviceName)}</ServiceDescription>
      <ServiceDate>${escapeXml(serviceDate)}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: DPO_HEADERS,
    body: xmlBody,
  });

  const responseText = await resp.text();
  const result = extractXmlValue(responseText, 'Result');
  const resultExplanation = extractXmlValue(responseText, 'ResultExplanation');
  const transTokenRaw = extractXmlValue(responseText, 'TransToken');
  const transToken = transTokenRaw ? transTokenRaw.trim().replace(/^TransToken/i, '').trim() : null;
  const transRef = extractXmlValue(responseText, 'TransRef');

  if (!result && !transToken) {
    const is403 =
      resp.status === 403 &&
      (responseText.toLowerCase().includes('cloudfront') ||
        responseText.toLowerCase().includes('request blocked'));

    throw Object.assign(new Error('Unexpected response from DPO'), {
      httpStatus: resp.status,
      bodyPreview: responseText.slice(0, 800),
      hint: is403
        ? 'DPO returned HTTP 403 from CloudFront. Contact DPO to allow your server IP.'
        : undefined,
    });
  }

  if (result !== '000') {
    throw Object.assign(new Error(`DPO createToken failed: ${resultExplanation || result}`), {
      dpoResult: result,
      resultExplanation,
    });
  }

  if (!transToken) {
    throw new Error('DPO response missing TransToken');
  }

  return {
    transToken,
    transRef,
    redirectUrl: `${paymentUrl}${transToken}`,
  };
}

// ---------------------------------------------------------------------------
// DPO API: verifyToken
// ---------------------------------------------------------------------------

export async function verifyDpoToken(
  transToken: string,
  companyToken: string,
  apiUrl: string = DEFAULT_API_URL,
): Promise<DpoVerifyResult> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${escapeXml(transToken)}</TransactionToken>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: DPO_HEADERS,
    body: xmlBody,
  });

  const text = await resp.text();
  return {
    result: extractXmlValue(text, 'Result'),
    resultExplanation: extractXmlValue(text, 'ResultExplanation'),
    transRef: extractXmlValue(text, 'TransRef'),
  };
}

// ---------------------------------------------------------------------------
// Shared CORS helper for Vercel handlers
// ---------------------------------------------------------------------------

export function setCorsHeaders(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}
