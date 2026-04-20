import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { setPaymentApiCorsHeaders } from '../lib/corsAllowOrigin';
import { validateDpoServerConfig } from '../lib/dpoEnv';
import { eq, pgInsertRow, pgPatch } from '../lib/supabasePostgrest';

const DEFAULT_DPO_PAYMENT_PAGE_BASE = 'https://secure.3gdirectpay.com/payv3.php?ID=';

function normalizeDpoPaymentUrlBase(input: string): string {
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
    /* non-URL */
  }

  const stripped = trimmed.replace(/(ID=)(token|transtoken|\{token\}|<token>)\s*$/i, '$1');
  if (/([?&]ID=)$/i.test(stripped)) return stripped;
  if (/([?&]ID=)/i.test(stripped)) return stripped.replace(/([?&]ID=).*/i, '$1');
  return stripped.includes('?') ? `${stripped}&ID=` : `${stripped}?ID=`;
}

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cartLinesSummary(items: unknown, maxLines = 15, maxLen = 220): string {
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

function buildDpoDescriptions(serviceName: string, items: unknown): {
  rootDescription: string;
  bookingDescription: string;
} {
  const lines = cartLinesSummary(items);
  if (!lines) {
    return { rootDescription: serviceName, bookingDescription: serviceName };
  }
  return {
    rootDescription: `${serviceName}: ${lines}`,
    bookingDescription: lines,
  };
}

function splitName(fullName: string | undefined | null): { firstName: string; lastName: string } {
  const trimmed = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const parts = trimmed.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function withOrderParam(input: string, orderNumber: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set('order', orderNumber);
    return url.toString();
  } catch {
    const delimiter = input.includes('?') ? '&' : '?';
    return `${input}${delimiter}order=${encodeURIComponent(orderNumber)}`;
  }
}

function withTokenParam(input: string, token: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set('t', token);
    return url.toString();
  } catch {
    const delimiter = input.includes('?') ? '&' : '?';
    return `${input}${delimiter}t=${encodeURIComponent(token)}`;
  }
}

type CreateTokenBody = {
  order: Record<string, unknown>;
  payment: {
    amount: number;
    currency?: string;
    serviceName: string;
    redirectUrl: string;
    customer?: {
      fullName?: string;
      email?: string;
      phone?: string;
      company?: string | null;
    };
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[dpo/create-token] start', { method: req.method });

    setPaymentApiCorsHeaders(req, res);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    if (req.method === 'OPTIONS') return res.status(200).send('ok');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const companyToken = process.env.DPO_COMPANY_TOKEN;
    const serviceType = process.env.DPO_SERVICE_TYPE;
    const backUrlBase = process.env.DPO_BACK_URL;
    const apiUrl = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
    const paymentUrlBase = normalizeDpoPaymentUrlBase(
      process.env.DPO_PAYMENT_URL || DEFAULT_DPO_PAYMENT_PAGE_BASE,
    );

    const dpoConfigError = validateDpoServerConfig({
      apiUrl,
      paymentPageBase: paymentUrlBase,
      vercelEnv: process.env.VERCEL_ENV,
    });
    if (dpoConfigError) {
      return res.status(500).json({ error: dpoConfigError });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return res
        .status(500)
        .json({ error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
    }

    if (!companyToken || !serviceType || !backUrlBase) {
      return res.status(500).json({
        error: 'DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.',
      });
    }

    let body: CreateTokenBody | null = null;
    try {
      const raw = (req as { body?: unknown }).body;
      if (typeof raw === 'string') {
        body = JSON.parse(raw) as CreateTokenBody;
      } else {
        body = raw as CreateTokenBody;
      }
    } catch {
      body = null;
    }

    const order = body?.order;
    const payment = body?.payment;
    const amount = Number(payment?.amount);
    const currency = (payment?.currency || 'UGX').toString();
    const redirectUrl = payment?.redirectUrl;

    if (!order || typeof order !== 'object') {
      return res.status(400).json({ error: 'Missing order payload' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing/invalid amount' });
    }
    if (!redirectUrl) {
      return res.status(400).json({ error: 'Missing redirectUrl' });
    }

    const serviceName = payment?.serviceName || 'Service Payment';
    const customer = payment?.customer || {};
    const { rootDescription, bookingDescription } = buildDpoDescriptions(serviceName, order.items);

    const statusToken = randomUUID();
    const insertPayload = { ...order, status_token: statusToken };

    const { row: inserted, error: insertError } = await pgInsertRow(
      supabaseUrl,
      serviceRoleKey,
      'orders',
      insertPayload,
    );

    if (insertError) {
      return res.status(400).json({ error: insertError });
    }

    const orderNumber = inserted?.order_number != null ? String(inserted.order_number) : '';
    const orderId = inserted?.id != null ? String(inserted.id) : '';
    if (!orderNumber || !orderId) {
      return res.status(500).json({ error: 'Order created but missing id/order_number' });
    }

    async function markOrderDpoInitFailed(): Promise<void> {
      const ts = new Date().toISOString();
      await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
        payment_status: 'failed',
        updated_at: ts,
      });
    }

    const { firstName, lastName } = splitName(customer?.fullName);
    const customerEmail = customer?.email || '';
    const customerPhone = customer?.phone || '';

    const delimiter = backUrlBase.includes('?') ? '&' : '?';
    const backUrl = `${backUrlBase}${delimiter}order=${encodeURIComponent(orderNumber)}`;
    const redirectUrlWithOrder = withTokenParam(withOrderParam(redirectUrl, orderNumber), statusToken);

    const paymentAmount =
      currency.toUpperCase() === 'UGX' ? String(Math.round(amount)) : amount.toFixed(2);

    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const serviceDate = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(
      now.getHours(),
    )}:${pad2(now.getMinutes())}`;

    const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <PaymentAmount>${escapeXml(paymentAmount)}</PaymentAmount>
  <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
  <CompanyRef>${escapeXml(orderNumber)}</CompanyRef>
  <RedirectURL>${escapeXml(redirectUrlWithOrder)}</RedirectURL>
  <BackURL>${escapeXml(backUrl)}</BackURL>
  <PTL>5</PTL>
  <ServiceType>${escapeXml(serviceType)}</ServiceType>
  <Description>${escapeXml(rootDescription)}</Description>
  <customerFirstName>${escapeXml(firstName)}</customerFirstName>
  <customerLastName>${escapeXml(lastName)}</customerLastName>
  <customerEmail>${escapeXml(customerEmail)}</customerEmail>
  <customerPhone>${escapeXml(customerPhone)}</customerPhone>
  <Booking>
    <BookingRef>${escapeXml(orderNumber)}</BookingRef>
    <Description>${escapeXml(bookingDescription)}</Description>
    <Date>${escapeXml(serviceDate)}</Date>
  </Booking>
</API3G>`;

    let dpoResp: Awaited<ReturnType<typeof fetch>>;
    try {
      dpoResp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          Accept: 'application/xml',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        body: xmlBody,
      });
    } catch {
      await markOrderDpoInitFailed();
      return res.status(502).json({ error: 'Could not reach DPO. Try again in a moment.' });
    }

    const responseText = await dpoResp.text();
    const result = extractXmlValue(responseText, 'Result');
    const resultExplanation = extractXmlValue(responseText, 'ResultExplanation');
    const transTokenRaw = extractXmlValue(responseText, 'TransToken');
    const transToken = transTokenRaw ? transTokenRaw.trim().replace(/^TransToken/i, '').trim() : null;
    const transRef = extractXmlValue(responseText, 'TransRef');

    if (!result && !transToken) {
      await markOrderDpoInitFailed();
      const cloudFront403 =
        dpoResp.status === 403 &&
        (responseText.toLowerCase().includes('cloudfront') ||
          responseText.toLowerCase().includes('request blocked'));

      return res.status(502).json({
        error: 'Unexpected response from DPO',
        httpStatus: dpoResp.status,
        contentType: dpoResp.headers.get('content-type'),
        bodyPreview: responseText.slice(0, 800),
        ...(cloudFront403
          ? {
              hint:
                'DPO returned HTTP 403 from CloudFront. If this persists, DPO may be blocking this host; contact DPO support.',
            }
          : {}),
      });
    }

    if (result !== '000') {
      await markOrderDpoInitFailed();
      return res.status(400).json({
        error: 'DPO createToken failed',
        result,
        resultExplanation,
        httpStatus: dpoResp.status,
      });
    }

    if (!transToken) {
      await markOrderDpoInitFailed();
      return res.status(502).json({
        error: 'DPO response missing payment token',
        result,
        resultExplanation,
      });
    }

    const redirect = `${paymentUrlBase}${transToken}`;

    if (transRef || transToken) {
      const ts = new Date().toISOString();
      await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', orderId), {
        ...(transRef ? { payment_reference: transRef } : {}),
        ...(transToken ? { trans_token: transToken } : {}),
        updated_at: ts,
      });
    }

    return res.status(200).json({
      orderNumber,
      redirectUrl: redirect,
      transRef,
      transToken,
      statusToken,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    console.error('[dpo/create-token] fatal', e);
    return res.status(500).json({ error: message });
  }
}
