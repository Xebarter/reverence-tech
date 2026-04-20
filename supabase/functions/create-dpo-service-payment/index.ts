import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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

const DEFAULT_DPO_PAYMENT_PAGE_BASE = "https://secure.3gdirectpay.com/payv3.php?ID=";

function normalizeDpoPaymentUrlBase(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return DEFAULT_DPO_PAYMENT_PAGE_BASE;

  try {
    const url = new URL(trimmed);
    if (/(^|\.)3gdirectpay\.com$/i.test(url.hostname)) {
      url.hash = "";
      let id = url.searchParams.get("ID") ?? url.searchParams.get("id") ?? "";
      id = id.trim().replace(/^TransToken/i, "").trim();
      if (/^(token|transtoken|\{token\}|<token>)$/i.test(id)) id = "";
      url.search = "";
      url.searchParams.set("ID", id);
      return url.toString();
    }
  } catch {
    // Fall back to string normalization below for non-URL inputs.
  }

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

function withOrderParam(input: string, orderNumber: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set("order", orderNumber);
    return url.toString();
  } catch {
    const delimiter = input.includes("?") ? "&" : "?";
    return `${input}${delimiter}order=${encodeURIComponent(orderNumber)}`;
  }
}

function cartLinesSummary(items: unknown, maxLines = 15, maxLen = 220): string {
  if (!Array.isArray(items) || items.length === 0) return "";

  const parts: string[] = [];
  for (const raw of items.slice(0, maxLines)) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const name = String(row.product_name ?? row.name ?? "Item").trim() || "Item";
    const qty = Math.max(1, Math.round(Number(row.quantity) || 1));
    const shortName = name.length > 72 ? `${name.slice(0, 69)}…` : name;
    parts.push(`${shortName} ×${qty}`);
  }

  if (parts.length === 0) return "";

  let s = parts.join(", ");
  if (items.length > maxLines) s += ", …";
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

function withTokenParam(input: string, token: string): string {
  try {
    const url = new URL(input);
    url.searchParams.set("t", token);
    return url.toString();
  } catch {
    const delimiter = input.includes("?") ? "&" : "?";
    return `${input}${delimiter}t=${encodeURIComponent(token)}`;
  }
}

async function markOrderDpoInitFailed(orderNumber: string): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  await supabase
    .from("orders")
    .update({
      payment_status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber);
}

type CreateDpoServicePaymentPayload = {
  orderNumber?: string;
  // Optional: allow the edge function to create the order server-side (service role key),
  // so the browser never needs elevated Supabase credentials.
  order?: Record<string, unknown>;
  amount: number;
  currency?: string;
  serviceName: string;
  redirectUrl: string;
  statusToken?: string;
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

  const orderPayload = payload?.order;
  let orderNumber = payload?.orderNumber;
  const amount = Number(payload?.amount);
  const currency = (payload?.currency || "UGX").toString();
  const serviceName = payload?.serviceName || "Service Payment";
  const redirectUrl = payload?.redirectUrl;
  const customer = payload?.customer || {};

  if ((!orderNumber && !orderPayload) || !amount || amount <= 0) {
    return new Response(JSON.stringify({ error: "Missing/invalid orderNumber (or order) or amount" }), {
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Supabase env vars missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // If the caller didn't provide an order number, create the order server-side.
  if (!orderNumber && orderPayload && typeof orderPayload === "object") {
    const statusToken = String(payload?.statusToken || "").trim();
    const insertRow = {
      ...orderPayload,
      ...(statusToken ? { status_token: statusToken } : {}),
    };

    const { data: inserted, error: insertError } = await adminSupabase
      .from("orders")
      .insert([insertRow])
      .select("order_number")
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message || "Failed to create order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    orderNumber = (inserted as any)?.order_number as string | undefined;
    if (!orderNumber) {
      return new Response(JSON.stringify({ error: "Order created but missing order_number" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const companyToken = Deno.env.get("DPO_COMPANY_TOKEN");
  const serviceType = Deno.env.get("DPO_SERVICE_TYPE");
  const backUrlBase = Deno.env.get("DPO_BACK_URL");
  const apiUrl = Deno.env.get("DPO_API_URL") || "https://secure.3gdirectpay.com/API/v6/";
  // Hosted page for v6 API tokens (override with DPO_PAYMENT_URL if DPO instructs otherwise)
  const paymentUrlBase = normalizeDpoPaymentUrlBase(
    Deno.env.get("DPO_PAYMENT_URL") || DEFAULT_DPO_PAYMENT_PAGE_BASE,
  );

  const dpoMode = (Deno.env.get("DPO_MERCHANT_MODE") || "production").toLowerCase().trim();
  if (dpoMode !== "sandbox") {
    const blob = `${apiUrl} ${paymentUrlBase}`.toLowerCase();
    if (blob.includes("sandbox")) {
      return new Response(
        JSON.stringify({
          error:
            "DPO_MERCHANT_MODE is production but DPO_API_URL or DPO_PAYMENT_URL contains sandbox. Use live hosts or set DPO_MERCHANT_MODE=sandbox only for non-production.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  if (!companyToken || !serviceType || !backUrlBase) {
    return new Response(
      JSON.stringify({
        error:
          "DPO env vars missing. Set DPO_COMPANY_TOKEN, DPO_SERVICE_TYPE, DPO_BACK_URL.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!orderNumber) {
    return new Response(JSON.stringify({ error: "Missing orderNumber" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { firstName, lastName } = splitName(customer?.fullName);
  const customerEmail = customer?.email || "";

  const delimiter = backUrlBase.includes("?") ? "&" : "?";
  const backUrl = `${backUrlBase}${delimiter}order=${encodeURIComponent(orderNumber)}`;

  // Ensure the customer returns with `?order=` so the frontend status page can load the order.
  const redirectUrlWithOrder = (() => {
    const base = withOrderParam(redirectUrl, orderNumber);
    const token = String((payload as any)?.statusToken || "").trim();
    return token ? withTokenParam(base, token) : base;
  })();

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

  const customerPhone = String(customer?.phone || "").trim();

  const orderItems =
    orderPayload && typeof orderPayload === "object" ? (orderPayload as Record<string, unknown>).items : undefined;
  const { rootDescription, bookingDescription } = buildDpoDescriptions(serviceName, orderItems);

  // Use the v6 `createToken` XML shape shown in DPO docs (flat fields at root).
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <PaymentAmount>${escapeXml(paymentAmount)}</PaymentAmount>
  <PaymentCurrency>${escapeXml(currency)}</PaymentCurrency>
  <CompanyRef>${escapeXml(String(orderNumber))}</CompanyRef>
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
    <BookingRef>${escapeXml(String(orderNumber))}</BookingRef>
    <ServiceType>${escapeXml(serviceType)}</ServiceType>
    <Description>${escapeXml(bookingDescription)}</Description>
    <Date>${escapeXml(serviceDate)}</Date>
  </Booking>
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
    await markOrderDpoInitFailed(String(orderNumber));
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
  const transTokenRaw = extractXmlValue(responseText, "TransToken");
  const transToken = transTokenRaw ? transTokenRaw.trim().replace(/^TransToken/i, "").trim() : null;
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

    await markOrderDpoInitFailed(String(orderNumber));
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
    await markOrderDpoInitFailed(String(orderNumber));
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
    await markOrderDpoInitFailed(String(orderNumber));
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && serviceRoleKey && (transRef || transToken)) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    await supabase
      .from("orders")
      .update({
        ...(transRef ? { payment_reference: transRef } : {}),
        ...(transToken ? { trans_token: transToken } : {}),
      })
      .eq("order_number", orderNumber);
  }

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

