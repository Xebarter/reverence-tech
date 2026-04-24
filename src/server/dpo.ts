/**
 * Server-side DPO Pay by Network API client.
 * Never import this in client/browser components.
 */

export const DPO_LIVE_API_URL = 'https://secure.3gdirectpay.com/API/v6/';
export const DPO_SANDBOX_API_URL = 'https://secure1.sandbox.directpay.online/API/v6/';
export const DPO_LIVE_PAYMENT_URL = 'https://secure.3gdirectpay.com/payv3.php?ID=';
export const DPO_SANDBOX_PAYMENT_URL = 'https://secure1.sandbox.directpay.online/payv3.php?ID=';

/** Returns true when DPO_SANDBOX=true is set in env. */
export function isDpoSandbox(): boolean {
  return (process.env.DPO_SANDBOX || '').toLowerCase().trim() === 'true';
}

/** Returns the DPO API URL based on DPO_SANDBOX env var. */
export function getDpoApiUrl(): string {
  return isDpoSandbox() ? DPO_SANDBOX_API_URL : DPO_LIVE_API_URL;
}

/** Returns the DPO hosted checkout URL for a given TransToken. */
export function dpoBuildCheckoutUrl(transToken: string): string {
  const base = isDpoSandbox() ? DPO_SANDBOX_PAYMENT_URL : DPO_LIVE_PAYMENT_URL;
  return `${base}${transToken}`;
}

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

export function splitName(
  fullName: string | undefined | null,
): {
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
  if (!lines) return { rootDescription: serviceName, bookingDescription: serviceName };
  return {
    rootDescription: `${serviceName}: ${lines}`,
    bookingDescription: lines,
  };
}

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

/** Returns current date/time as DPO service date string: YYYY/MM/DD HH:MM */
export function dpoServiceDateNow(): string {
  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

/** Format a payment amount for DPO: UGX as whole number, others 2 d.p. */
export function dpoFormatAmount(amount: number, currency: string): string {
  return currency.toUpperCase() === 'UGX' ? String(Math.round(amount)) : amount.toFixed(2);
}

export type CreateTokenParams = {
  companyToken: string;
  serviceType: string;
  apiUrl: string;
  paymentAmount: string;
  currency: string;
  companyRef: string;
  redirectUrl: string;
  backUrl: string;
  description: string;
  bookingDescription: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceDate: string;
  ptl?: number;
};

export type CreateTokenResult = {
  transToken: string;
  transRef: string | null;
};

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let resp: Response;
  try {
    resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml',
      },
      body: xmlBody,
      signal: controller.signal,
    });
  } catch (e) {
    const msg =
      e instanceof Error && e.name === 'AbortError'
        ? 'DPO API timed out. Please try again.'
        : `Could not reach DPO. Try again in a moment. (${String(e)})`;
    throw new Error(msg);
  } finally {
    clearTimeout(timeout);
  }

  const responseText = await resp.text();
  const result = extractXmlValue(responseText, 'Result');
  const resultExplanation = extractXmlValue(responseText, 'ResultExplanation');
  const transToken = extractXmlValue(responseText, 'TransToken');
  const transRef = extractXmlValue(responseText, 'TransRef');

  if (result !== '000') {
    throw new Error(
      resultExplanation
        ? `DPO createToken failed: ${resultExplanation} (result=${result})`
        : `DPO createToken failed (result=${result ?? 'no result, HTTP ' + resp.status})`,
    );
  }

  if (!transToken) throw new Error('DPO response missing TransToken');
  return { transToken, transRef };
}

export type VerifyTokenResult = {
  result: string | null;
  resultExplanation: string | null;
  customerName: string | null;
  transactionAmount: string | null;
  transactionCurrency: string | null;
  transRef: string | null;
};

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        Accept: 'application/xml',
      },
      body: xmlBody,
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeout);
  }
}

