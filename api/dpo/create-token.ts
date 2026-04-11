import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function normalizeDpoPaymentUrlBase(input: string): string {
  // Accept common env formats:
  // - https://.../payv3.php?ID=
  // - https://.../payv3.php?ID=token   (placeholder mistake)
  // - https://.../payv3.php?ID={token} (placeholder)
  // - https://.../payv3.php?ID=<token>
  const trimmed = (input || '').trim();
  // DPO support often provides links like:
  // https://secure.3gdirectpay.com/dpopayment.php?ID=<TransToken>
  if (!trimmed) return 'https://secure.3gdirectpay.com/dpopayment.php?ID=';

  // Normalize legacy hosted pages (payv2/payv3/pay.asp) to the expected `dpopayment.php?ID=`.
  // This prevents env/config mistakes like `.../payv2.php?ID=TransToken` from leaking into the redirect URL.
  try {
    const url = new URL(trimmed);
    if (/(^|\.)3gdirectpay\.com$/i.test(url.hostname)) {
      url.pathname = '/dpopayment.php';
      url.search = '?ID=';
      url.hash = '';
      return url.toString();
    }
  } catch {
    // Fall back to string normalization below for non-URL inputs.
  }

  // If it ends with a placeholder token, strip it.
  const stripped = trimmed.replace(/(ID=)(token|transtoken|\{token\}|<token>)\s*$/i, '$1');

  // Ensure we end with ID= so `${base}${transToken}` works.
  if (/([?&]ID=)$/i.test(stripped)) return stripped;
  if (/([?&]ID=)/i.test(stripped)) return stripped.replace(/([?&]ID=).*/i, '$1');

  // If they provided the page without query, append ID=
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
  // Order payload to insert into `orders` (server-side using service role)
  order: Record<string, unknown>;
  // DPO payload
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
  // CORS for local + your deployed site
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    process.env.DPO_PAYMENT_URL || 'https://secure.3gdirectpay.com/dpopayment.php?ID=',
  );

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)' });
  }

  if (!companyToken || !serviceType || !backUrlBase) {
    return res.status(500).json({
      error: 'DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.',
    });
  }

  let body: CreateTokenBody | null = null;
  try {
    body = req.body as CreateTokenBody;
  } catch {
    body = null;
  }

  const order = body?.order;
  const payment = body?.payment;
  const amount = Number(payment?.amount);
  const currency = (payment?.currency || 'UGX').toString();
  const redirectUrl = payment?.redirectUrl;
  const serviceName = payment?.serviceName || 'Service Payment';
  const customer = payment?.customer || {};

  if (!order || typeof order !== 'object') {
    return res.status(400).json({ error: 'Missing order payload' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing/invalid amount' });
  }
  if (!redirectUrl) {
    return res.status(400).json({ error: 'Missing redirectUrl' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const statusToken = crypto.randomUUID();

  // 1) Create order
  const { data: inserted, error: insertError } = await supabase
    .from('orders')
    .insert([{ ...order, status_token: statusToken }])
    .select()
    .single();

  if (insertError) {
    return res.status(400).json({ error: insertError.message });
  }

  const orderNumber = (inserted as any)?.order_number as string | undefined;
  const orderId = (inserted as any)?.id as string | undefined;
  if (!orderNumber || !orderId) {
    return res.status(500).json({ error: 'Order created but missing id/order_number' });
  }

  // 2) Create DPO token
  const { firstName, lastName } = splitName(customer?.fullName);
  const customerEmail = customer?.email || '';

  const delimiter = backUrlBase.includes('?') ? '&' : '?';
  const backUrl = `${backUrlBase}${delimiter}order=${encodeURIComponent(orderNumber)}`;

  // Ensure the customer returns to a URL that includes the order number,
  // since the frontend status page relies on `?order=` to look up the record.
  const redirectUrlWithOrder = withTokenParam(withOrderParam(redirectUrl, orderNumber), statusToken);

  // DPO docs show decimals; UGX often expects whole numbers. Keep UGX whole, others fixed(2).
  const paymentAmount = currency.toUpperCase() === 'UGX' ? String(Math.round(amount)) : amount.toFixed(2);

  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const serviceDate = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(
    now.getHours(),
  )}:${pad2(now.getMinutes())}`;

  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>

  <Transaction>
    <PaymentAmount>${escapeXml(paymentAmount)}</PaymentAmount>
    <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
    <CompanyRef>${escapeXml(orderNumber)}</CompanyRef>

    <RedirectURL>${escapeXml(redirectUrlWithOrder)}</RedirectURL>
    <BackURL>${escapeXml(backUrl)}</BackURL>

    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>

    <customerFirstName>${escapeXml(firstName)}</customerFirstName>
    <customerLastName>${escapeXml(lastName)}</customerLastName>
    <customerEmail>${escapeXml(customerEmail)}</customerEmail>
  </Transaction>

  <Services>
    <Service>
      <ServiceType>${escapeXml(serviceType)}</ServiceType>
      <ServiceDescription>${escapeXml(serviceName)}</ServiceDescription>
      <ServiceDate>${escapeXml(serviceDate)}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  const dpoResp = await fetch(apiUrl, {
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

  const responseText = await dpoResp.text();
  const result = extractXmlValue(responseText, 'Result');
  const resultExplanation = extractXmlValue(responseText, 'ResultExplanation');
  const transTokenRaw = extractXmlValue(responseText, 'TransToken');
  // Some integrations/documentation prefix the UUID with "TransToken". The hosted payment page
  // expects the raw token value (usually a UUID).
  const transToken = transTokenRaw ? transTokenRaw.trim().replace(/^TransToken/i, '').trim() : null;
  const transRef = extractXmlValue(responseText, 'TransRef');

  if (!result && !transToken) {
    const cloudFront403 =
      dpoResp.status === 403 &&
      (responseText.toLowerCase().includes('cloudfront') || responseText.toLowerCase().includes('request blocked'));

    return res.status(502).json({
      error: 'Unexpected response from DPO',
      httpStatus: dpoResp.status,
      contentType: dpoResp.headers.get('content-type'),
      bodyPreview: responseText.slice(0, 800),
      ...(cloudFront403
        ? {
            hint:
              'DPO returned HTTP 403 from CloudFront. If this persists, DPO is blocking this hosting provider egress and you will need DPO to allow your server IP/host or use a backend with an allowed egress IP.',
          }
        : {}),
    });
  }

  if (result !== '000') {
    return res.status(400).json({
      error: 'DPO createToken failed',
      result,
      resultExplanation,
      httpStatus: dpoResp.status,
    });
  }

  if (!transToken) {
    return res.status(502).json({
      error: 'DPO response missing payment token',
      result,
      resultExplanation,
    });
  }

  const redirect = `${paymentUrlBase}${transToken}`;

  // Save DPO TransRef + TransToken so the status endpoint can later call
  // verifyToken directly — making payment confirmation resilient to BackURL failures.
  if (transRef || transToken) {
    await supabase
      .from('orders')
      .update({
        ...(transRef ? { payment_reference: transRef } : {}),
        ...(transToken ? { trans_token: transToken } : {}),
      })
      .eq('id', orderId);
  }

  return res.status(200).json({
    orderNumber,
    redirectUrl: redirect,
    transRef,
    transToken,
    statusToken,
  });
}

