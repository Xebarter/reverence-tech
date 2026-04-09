import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// DPO sits behind CloudFront/WAF. Bare server fetches (e.g. from Supabase Edge) are sometimes
// blocked unless the request looks like a normal client. Match DPO docs + browser-like UA.
const dpoUpstreamHeaders: Record<string, string> = {
  "Content-Type": "application/xml; charset=utf-8",
  Accept: "application/xml",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

function normalizeDpoPaymentUrlBase(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return "https://secure.3gdirectpay.com/dpopayment.php?ID=";

  // Strip common placeholder mistakes like ...?ID=token or ...?ID={token}
  const stripped = trimmed.replace(/(ID=)(token|transtoken|\{token\}|<token>)\s*$/i, "$1");

  // Ensure we end with ID= so `${base}${transToken}` is valid.
  if (/([?&]ID=)$/i.test(stripped)) return stripped;
  if (/([?&]ID=)/i.test(stripped)) return stripped.replace(/([?&]ID=).*/i, "$1");

  // If they provided the page without query, append ID=
  return stripped.includes("?") ? `${stripped}&ID=` : `${stripped}?ID=`;
}

function extractXmlValue(xml: string, tagName: string): string | null {
  // DPO responses are XML, but tag casing can vary; make matching case-insensitive.
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitName(fullName: string | undefined | null): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (fullName || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

type CreateDpoServicePaymentPayload = {
  orderNumber: string;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Partial<CreateDpoServicePaymentPayload> | null = null;
  try {
    payload = (await req.json()) as Partial<CreateDpoServicePaymentPayload>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderNumber = payload?.orderNumber;
  const amount = Number(payload?.amount);
  const currency = (payload?.currency || "UGX").toString();
  const serviceName = payload?.serviceName || "Service Payment";
  const redirectUrl = payload?.redirectUrl;
  const customer = payload?.customer || {};

  if (!orderNumber || !amount || amount <= 0) {
    return new Response(JSON.stringify({ error: "Missing/invalid orderNumber or amount" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!redirectUrl) {
    return new Response(JSON.stringify({ error: "Missing redirectUrl" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const companyToken = Deno.env.get("DPO_COMPANY_TOKEN");
  const serviceType = Deno.env.get("DPO_SERVICE_TYPE");
  const backUrlBase = Deno.env.get("DPO_BACK_URL");
  const apiUrl = Deno.env.get("DPO_API_URL") || "https://secure.3gdirectpay.com/API/v6/";
  // Hosted page for v6 API tokens (override with DPO_PAYMENT_URL if DPO instructs otherwise)
  const paymentUrlBase = normalizeDpoPaymentUrlBase(
    Deno.env.get("DPO_PAYMENT_URL") || "https://secure.3gdirectpay.com/dpopayment.php?ID=",
  );

  if (!companyToken || !serviceType || !backUrlBase) {
    return new Response(
      JSON.stringify({
        error:
          "DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { firstName, lastName } = splitName(customer?.fullName);
  const customerEmail = customer?.email || "";

  const delimiter = backUrlBase.includes("?") ? "&" : "?";
  const backUrl = `${backUrlBase}${delimiter}order=${encodeURIComponent(orderNumber)}`;

  // UGX has no minor units; some DPO setups reject "500000.00" — send a whole amount.
  const paymentAmount =
    currency.toUpperCase() === "UGX"
      ? String(Math.max(0, Math.round(amount)))
      : amount.toFixed(2);

  // DPO wants a service date in the example payload; it may be optional, but we include it.
  const now = new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  const serviceDate = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())} ${pad2(
    now.getHours(),
  )}:${pad2(now.getMinutes())}`;

  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${companyToken}</CompanyToken>
  <Request>createToken</Request>

  <Transaction>
    <PaymentAmount>${paymentAmount}</PaymentAmount>
    <PaymentCurrency>${currency}</PaymentCurrency>
    <CompanyRef>${escapeXml(String(orderNumber))}</CompanyRef>

    <RedirectURL>${escapeXml(redirectUrl)}</RedirectURL>
    <BackURL>${escapeXml(backUrl)}</BackURL>

    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>

    <customerFirstName>${escapeXml(firstName)}</customerFirstName>
    <customerLastName>${escapeXml(lastName)}</customerLastName>
    <customerEmail>${escapeXml(customerEmail)}</customerEmail>
  </Transaction>

  <Services>
    <Service>
      <ServiceType>${serviceType}</ServiceType>
      <ServiceDescription>${escapeXml(serviceName)}</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: dpoUpstreamHeaders,
    body: xmlBody,
  }).catch((e) => {
    console.error("[create-dpo-service-payment] Fetch to DPO failed", e);
    return null;
  });

  if (!resp) {
    return new Response(
      JSON.stringify({
        error: "Failed to reach DPO API",
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const responseText = await resp.text();

  const result = extractXmlValue(responseText, "Result");
  const resultExplanation = extractXmlValue(responseText, "ResultExplanation");
  const transToken = extractXmlValue(responseText, "TransToken");
  const transRef = extractXmlValue(responseText, "TransRef");

  // If we can't parse the expected XML shape, return a preview for debugging.
  if (!result && !transToken) {
    const httpStatus = resp.status;
    const contentType = resp.headers.get("content-type");
    const cloudFront403 =
      httpStatus === 403 &&
      (responseText.includes("cloudfront") || responseText.toLowerCase().includes("request blocked"));

    console.error("[create-dpo-service-payment] Unexpected DPO response", {
      httpStatus,
      contentType,
      bodyPreview: responseText.slice(0, 800),
    });

    const hint = cloudFront403
      ? "DPO returned HTTP 403 from CloudFront (often blocks API calls from cloud datacenters like Supabase Edge). If this persists after deploy, contact DPO support to allow server-to-server access from your host, or run createToken from a small VPS/proxy with an allowed egress IP."
      : httpStatus >= 400
        ? "DPO did not return XML (check DPO_API_URL, network reachability, and Supabase function logs)."
        : undefined;

    return new Response(
      JSON.stringify({
        error: "Unexpected response from DPO",
        httpStatus,
        contentType,
        bodyPreview: responseText.slice(0, 800),
        ...(hint ? { hint } : {}),
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (result !== "000") {
    console.error("[create-dpo-service-payment] DPO non-success", {
      result,
      resultExplanation,
      httpStatus: resp.status,
      bodyPreview: responseText.slice(0, 400),
    });
    return new Response(
      JSON.stringify({
        error: "DPO createToken failed",
        result,
        resultExplanation,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!transToken) {
    console.error("[create-dpo-service-payment] Missing TransToken", responseText.slice(0, 500));
    return new Response(
      JSON.stringify({
        error: "DPO response missing payment token",
        result,
        resultExplanation,
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const redirect = `${paymentUrlBase}${transToken}`;

  return new Response(
    JSON.stringify({
      redirectUrl: redirect,
      transRef,
      transToken,
      orderNumber,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

