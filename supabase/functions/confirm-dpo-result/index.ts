import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

type Payload = {
  orderNumber?: string;
  statusToken?: string;
  dpoResult?: string;
  transRef?: string;
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

  let payload: Payload | null = null;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    payload = null;
  }

  const orderNumber = (payload?.orderNumber || "").trim();
  const statusToken = (payload?.statusToken || "").trim();
  const dpoResult = (payload?.dpoResult || "").trim();
  const clientTransRef = (payload?.transRef || "").trim();

  if (!orderNumber || !statusToken) {
    return new Response(JSON.stringify({ error: "Missing orderNumber or statusToken" }), {
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
    .select("id, payment_status, payment_reference, order_status, trans_token")
    .eq("order_number", orderNumber)
    .eq("status_token", statusToken)
    .maybeSingle();

  if (error) {
    console.error("[confirm-dpo-result] supabase error", error);
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

  const json = (body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (data.payment_status === "paid" || data.payment_status === "refunded") {
    return json({
      payment_status: data.payment_status,
      payment_reference: data.payment_reference ?? clientTransRef || null,
      order_status: data.order_status,
    });
  }

  // Try server-side DPO verifyToken
  const companyToken = Deno.env.get("DPO_COMPANY_TOKEN");
  const apiUrl = Deno.env.get("DPO_API_URL") || "https://secure.3gdirectpay.com/API/v6/";

  if (data.trans_token && companyToken) {
    try {
      const { result, transRef: verifiedRef } = await verifyDpoToken(
        data.trans_token,
        companyToken,
        apiUrl,
      );

      if (result === "000") {
        const ref = verifiedRef || clientTransRef || data.payment_reference;
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "confirmed",
            ...(ref ? { payment_reference: ref } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        return json({
          payment_status: "paid",
          payment_reference: ref ?? null,
          order_status: "confirmed",
        });
      }

      if (result === "002" || result === "003") {
        await supabase
          .from("orders")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", data.id);

        return json({
          payment_status: "failed",
          payment_reference: data.payment_reference ?? null,
          order_status: data.order_status,
        });
      }
    } catch (e) {
      console.error("[confirm-dpo-result] verifyToken error", e);
    }
  }

  // Fallback: trust DPO redirect result (statusToken acts as auth)
  if (dpoResult === "000") {
    const ref = clientTransRef || data.payment_reference;
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "confirmed",
        ...(ref ? { payment_reference: ref } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return json({
      payment_status: "paid",
      payment_reference: ref ?? null,
      order_status: "confirmed",
    });
  }

  if (dpoResult === "002" || dpoResult === "003") {
    await supabase
      .from("orders")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", data.id);

    return json({
      payment_status: "failed",
      payment_reference: data.payment_reference ?? null,
      order_status: data.order_status,
    });
  }

  return json({
    payment_status: data.payment_status ?? null,
    payment_reference: data.payment_reference ?? null,
    order_status: data.order_status ?? null,
  });
});
