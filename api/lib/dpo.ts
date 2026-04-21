/**
 * Server-side DPO Pay by Network API client.
 * Never import this in client/browser components.
 *
 * Exports:
 *   getDpoConfig()           — Reads env vars; throws if required vars are missing.
 *   dpoCreateToken(params)   — POSTs XML to DPO /API/v6/ to open a payment session.
 *                              Returns { transToken, transRef }.
 *   dpoVerifyToken(params)   — POSTs XML to verify payment status.
 *                              Returns { result, resultExplanation, customerName,
 *                                        transactionAmount, transactionCurrency, transRef }.
 *   dpoBuildCheckoutUrl(t)   — Returns the DPO hosted checkout URL for a given token.
 *   escapeXml(text)          — XML-safe string escaping.
 *   extractXmlValue(xml, tag)— Parse a single tag value from DPO XML response.
 *   normalizeDpoPaymentUrlBase(input) — Normalise the hosted checkout URL base.
 *   splitName(fullName)      — Split a full name into first/last parts.
 *   cartLinesSummary(items)  — Build a short description from cart items.
 *
 * Sandbox URL: https://secure1.sandbox.directpay.online/API/v6/
 * Live URL:    https://secure.3gdirectpay.com/API/v6/
 */

export const DPO_LIVE_API_URL = 'https://secure.3gdirectpay.com/API/v6/';
export const DPO_SANDBOX_API_URL = 'https://secure1.sandbox.directpay.online/API/v6/';
export const DEFAULT_DPO_PAYMENT_PAGE_BASE = 'https://secure.3gdirectpay.com/payv3.php?ID=';

const DPO_UPSTREAM_HEADERS: Record<string, string> = {
  'Content-Type': 'application/xml; charset=utf-8',
  Accept: 'application/xml',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ── String helpers ───────────────────────────────────────────────────────────

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

export function normalizeDpoPaymentUrlBase(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return DEFAULT_DPO_PAYMENT_PAGE_BASE;

  try {
    const url = new URL(trimmed);
    if (/(^|\.)3gdirectpay\.com$/i.test(url.hostname)) {
      url.hash = '';
      let id = url.searchParams.get('ID') ?? url.searchParams.get('id') ?? '';
      id = id.trim().replace(/^TransToken/i, '').trim();
      if (/^(token|transtoken|\{token\}|<token>)$/i.test(id)) id = '';
      url.search = '';
      url.searchParams.set('ID', id);
      return url.toString();
    }
  } catch {
    /* non-URL input — fall through to string normalization */
  }

  const stripped = trimmed.replace(/(ID=)(token|transtoken|\{token\}|<token>)\s*$/i, '$1');
  if (/([?&]ID=)$/i.test(stripped)) return stripped;
  if (/([?&]ID=)/i.test(stripped)) return stripped.replace(/([?&]ID=).*/i, '$1');
  return stripped.includes('?') ? `${stripped}&ID=` : `${stripped}?ID=`;
}

export function splitName(fullName: string | undefined | null): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function cartLinesSummary(items: unknown, maxLines = 15, maxLen = 220): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  const parts: string[] = [];
  for (const raw of items.slice(0, maxLines)) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const name = String(row.product_name ?? row.name ?? 'Item').trim() || 'Item';
    const qty = Math.max(1, Math.round(Number(row.quantity) || 1));
    const shortName = name.length > 72 ? `${name.slice(0, 69)}…` : name;
    parts.push(`${shortName} x${qty}`);
  }
  if (parts.length === 0) return '';
  let s = parts.join(', ');
  if (items.length > maxLines) s += ', ...';
  if (s.length > maxLen) s = `${s.slice(0, maxLen - 1)}…`;
  return s;
}

export function buildDpoDescriptions(
  serviceName: string,
  items: unknown,
): { rootDescription: string; bookingDescription: string } {
  const lines = cartLinesSummary(items);
  if (!lines) {
    return { rootDescription: serviceName, bookingDescription: serviceName };
  }
  return {
    rootDescription: `${serviceName}: ${lines}`,
    bookingDescription: lines,
  };
}

// ── URL param helpers ────────────────────────────────────────────────────────

export function withOrderParam(input: string, orderNumber: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set('order', orderNumber);
    return url.toString();
  } catch {
    const delimiter = input.includes('?') ? '&' : '?';
    return `${input}${delimiter}order=${encodeURIComponent(orderNumber)}`;
  }
}

export function withTokenParam(input: string, token: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set('t', token);
    return url.toString();
  } catch {
    const delimiter = input.includes('?') ? '&' : '?';
    return `${input}${delimiter}t=${encodeURIComponent(token)}`;
  }
}

// ── Config ───────────────────────────────────────────────────────────────────

export type DpoConfig = {
  companyToken: string;
  serviceType: string;
  apiUrl: string;
  paymentUrlBase: string;
  backUrlBase: string;
};

/**
 * Reads DPO env vars and returns a validated config object.
 * Throws a descriptive Error if any required variable is absent.
 */
export function getDpoConfig(): DpoConfig {
  const companyToken = process.env.DPO_COMPANY_TOKEN;
  const serviceType = process.env.DPO_SERVICE_TYPE;
  const backUrlBase = process.env.DPO_BACK_URL;

  if (!companyToken) throw new Error('DPO_COMPANY_TOKEN is not set');
  if (!serviceType) throw new Error('DPO_SERVICE_TYPE is not set');
  if (!backUrlBase) throw new Error('DPO_BACK_URL is not set');

  const apiUrl = process.env.DPO_API_URL || DPO_LIVE_API_URL;
  const paymentUrlBase = normalizeDpoPaymentUrlBase(
    process.env.DPO_PAYMENT_URL || DEFAULT_DPO_PAYMENT_PAGE_BASE,
  );

  return { companyToken, serviceType, apiUrl, paymentUrlBase, backUrlBase };
}

/**
 * Returns the DPO hosted checkout URL for a given TransToken.
 */
export function dpoBuildCheckoutUrl(transToken: string): string {
  const paymentUrlBase = normalizeDpoPaymentUrlBase(
    process.env.DPO_PAYMENT_URL || DEFAULT_DPO_PAYMENT_PAGE_BASE,
  );
  return `${paymentUrlBase}${transToken}`;
}

// ── createToken ──────────────────────────────────────────────────────────────

export type CreateTokenParams = {
  companyToken: string;
  serviceType: string;
  apiUrl: string;
  /** Payment amount — pass as string already formatted (UGX: whole number; others: 2 d.p.) */
  paymentAmount: string;
  currency: string;
  /** CompanyRef echoed back in the DPO redirect/callback (= our order_number). */
  companyRef: string;
  redirectUrl: string;
  backUrl: string;
  description: string;
  bookingDescription: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO-style service date: YYYY/MM/DD HH:MM */
  serviceDate: string;
  /** Payment Token Lifetime in hours (default 5). */
  ptl?: number;
};

export type CreateTokenResult = {
  transToken: string;
  transRef: string | null;
};

/**
 * POSTs a `createToken` XML request to the DPO API.
 * Returns { transToken, transRef } on success; throws on any error.
 */
export async function dpoCreateToken(params: CreateTokenParams): Promise<CreateTokenResult> {
  const {
    companyToken,
    serviceType,
    apiUrl,
    paymentAmount,
    currency,
    companyRef,
    redirectUrl,
    backUrl,
    description,
    bookingDescription,
    firstName,
    lastName,
    email,
    phone,
    serviceDate,
    ptl = 5,
  } = params;

  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <PaymentAmount>${escapeXml(paymentAmount)}</PaymentAmount>
  <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
  <CompanyRef>${escapeXml(companyRef)}</CompanyRef>
  <RedirectURL>${escapeXml(redirectUrl)}</RedirectURL>
  <BackURL>${escapeXml(backUrl)}</BackURL>
  <PTL>${ptl}</PTL>
  <ServiceType>${escapeXml(serviceType)}</ServiceType>
  <Description>${escapeXml(description)}</Description>
  <customerFirstName>${escapeXml(firstName)}</customerFirstName>
  <customerLastName>${escapeXml(lastName)}</customerLastName>
  <customerEmail>${escapeXml(email)}</customerEmail>
  <customerPhone>${escapeXml(phone)}</customerPhone>
  <Booking>
    <BookingRef>${escapeXml(companyRef)}</BookingRef>
    <Description>${escapeXml(bookingDescription)}</Description>
    <Date>${escapeXml(serviceDate)}</Date>
  </Booking>
</API3G>`;

  let resp: Response;
  try {
    resp = await fetch(apiUrl, {
      method: 'POST',
      headers: DPO_UPSTREAM_HEADERS,
      body: xmlBody,
    });
  } catch (e) {
    throw new Error(`Could not reach DPO. Try again in a moment. (${String(e)})`);
  }

  const responseText = await resp.text();
  const result = extractXmlValue(responseText, 'Result');
  const resultExplanation = extractXmlValue(responseText, 'ResultExplanation');
  const transTokenRaw = extractXmlValue(responseText, 'TransToken');
  const transToken = transTokenRaw
    ? transTokenRaw.trim().replace(/^TransToken/i, '').trim()
    : null;
  const transRef = extractXmlValue(responseText, 'TransRef');

  if (!result && !transToken) {
    const cloudFront403 =
      resp.status === 403 &&
      (responseText.toLowerCase().includes('cloudfront') ||
        responseText.toLowerCase().includes('request blocked'));
    throw Object.assign(
      new Error(
        cloudFront403
          ? 'DPO returned HTTP 403 from CloudFront. Contact DPO support if this persists.'
          : `Unexpected response from DPO (HTTP ${resp.status})`,
      ),
      { httpStatus: resp.status, bodyPreview: responseText.slice(0, 800) },
    );
  }

  if (result !== '000') {
    throw Object.assign(
      new Error(
        resultExplanation
          ? `DPO createToken failed: ${resultExplanation} (result=${result})`
          : `DPO createToken failed (result=${result})`,
      ),
      { result, resultExplanation, httpStatus: resp.status },
    );
  }

  if (!transToken) {
    throw new Error('DPO response missing TransToken');
  }

  return { transToken, transRef };
}

// ── verifyToken ──────────────────────────────────────────────────────────────

export type VerifyTokenResult = {
  result: string | null;
  resultExplanation: string | null;
  customerName: string | null;
  transactionAmount: string | null;
  transactionCurrency: string | null;
  transRef: string | null;
};

/**
 * POSTs a `verifyToken` XML request to the DPO API to check payment status.
 * Never trust a Result=000 in the BackURL/redirect without calling this.
 */
export async function dpoVerifyToken(
  transToken: string,
  companyToken: string,
  apiUrl: string,
): Promise<VerifyTokenResult> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${escapeXml(transToken)}</TransactionToken>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: DPO_UPSTREAM_HEADERS,
    body: xmlBody,
  });

  const text = await resp.text();
  return {
    result: extractXmlValue(text, 'Result'),
    resultExplanation: extractXmlValue(text, 'ResultExplanation'),
    customerName: extractXmlValue(text, 'CustomerName'),
    transactionAmount: extractXmlValue(text, 'TransactionAmount'),
    transactionCurrency: extractXmlValue(text, 'TransactionCurrency'),
    transRef: extractXmlValue(text, 'TransRef'),
  };
}

// ── Service date helper ──────────────────────────────────────────────────────

/** Returns current date/time as DPO service date string: YYYY/MM/DD HH:MM */
export function dpoServiceDateNow(): string {
  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(
    now.getHours(),
  )}:${pad2(now.getMinutes())}`;
}

/** Format a payment amount correctly for DPO: UGX as whole number, others 2 d.p. */
export function dpoFormatAmount(amount: number, currency: string): string {
  return currency.toUpperCase() === 'UGX'
    ? String(Math.round(amount))
    : amount.toFixed(2);
}
