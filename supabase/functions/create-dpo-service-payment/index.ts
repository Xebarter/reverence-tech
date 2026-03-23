import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
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

  const paymentAmount = amount.toFixed(2);

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
    <CompanyRef>${orderNumber}</CompanyRef>

    <RedirectURL>${redirectUrl}</RedirectURL>
    <BackURL>${backUrl}</BackURL>

    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>

    <customerFirstName>${firstName}</customerFirstName>
    <customerLastName>${lastName}</customerLastName>
    <customerEmail>${customerEmail}</customerEmail>
  </Transaction>

  <Services>
    <Service>
      <ServiceType>${serviceType}</ServiceType>
      <ServiceDescription>${serviceName}</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Accept: "application/xml",
    },
    body: xmlBody,
  });

  const responseText = await resp.text();

  const result = extractXmlValue(responseText, "Result");
  const resultExplanation = extractXmlValue(responseText, "ResultExplanation");
  const transToken = extractXmlValue(responseText, "TransToken");
  const transRef = extractXmlValue(responseText, "TransRef");

  if (result !== "000") {
    return new Response(
      JSON.stringify({
        error: "DPO createToken failed",
        result,
        resultExplanation,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const redirect = `https://secure.3gdirectpay.com/pay.asp?ID=${transToken}`;

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

