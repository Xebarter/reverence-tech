import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  orderNumber?: string;
  token?: string;
};

function extractXmlValue(xml: string, tagName: string): string | null {
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

async function verifyDpoToken(
  transToken: string,
  companyToken: string,
  apiUrl: string,
): Promise<{ result: string | null; transRef: string | null }> {
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${escapeXml(companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${escapeXml(transToken)}</TransactionToken>
</API3G>`;

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Accept: "application/xml",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    body: xmlBody,
  });

  const text = await resp.text();
  return {
    result: extractXmlValue(text, "Result"),
    transRef: extractXmlValue(text, "TransRef"),
  };
}

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

  let payload: Payload | null = null;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    payload = null;
  }

  const orderNumber = (payload?.orderNumber || "").trim();
  const token = (payload?.token || "").trim();

  if (!orderNumber || !token) {
    return new Response(JSON.stringify({ error: "Missing orderNumber or token" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase env vars missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("orders")
    .select("payment_status, payment_reference, order_status, trans_token")
    .eq("order_number", orderNumber)
    .eq("status_token", token)
    .maybeSingle();

  if (error) {
    console.error("[get-order-status] supabase error", error);
    return new Response(JSON.stringify({ error: "Failed to fetch order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // If still pending and we have DPO's TransToken, actively verify with DPO.
  if (data.payment_status === "pending" && data.trans_token) {
    const companyToken = Deno.env.get("DPO_COMPANY_TOKEN");
    const apiUrl = Deno.env.get("DPO_API_URL") || "https://secure.3gdirectpay.com/API/v6/";

    if (companyToken) {
      try {
        const { result, transRef } = await verifyDpoToken(data.trans_token, companyToken, apiUrl);

        if (result === "000") {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              order_status: "confirmed",
              ...(transRef ? { payment_reference: transRef } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("order_number", orderNumber)
            .eq("status_token", token);

          return new Response(
            JSON.stringify({
              payment_status: "paid",
              payment_reference: transRef ?? data.payment_reference ?? null,
              order_status: "confirmed",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        if (result === "002" || result === "003") {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("order_number", orderNumber)
            .eq("status_token", token);

          return new Response(
            JSON.stringify({
              payment_status: "failed",
              payment_reference: data.payment_reference ?? null,
              order_status: data.order_status ?? null,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // result 001 = not paid yet, 004 = expired — fall through to return DB value
      } catch (e) {
        console.error("[get-order-status] verifyToken error", e);
      }
    }
  }

  return new Response(
    JSON.stringify({
      payment_status: data.payment_status ?? null,
      payment_reference: data.payment_reference ?? null,
      order_status: data.order_status ?? null,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
