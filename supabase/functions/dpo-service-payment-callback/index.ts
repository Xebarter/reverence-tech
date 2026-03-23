import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

function extractXmlValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
  const match = xml.match(re);
  return match?.[1]?.trim() ?? null;
}

serve(async (req) => {
  const url = new URL(req.url);
  const params = url.searchParams;

  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch {
    bodyText = "";
  }

  // DPO may call BackURL with query parameters and/or XML body.
  const result =
    params.get("Result") ||
    params.get("result") ||
    extractXmlValue(bodyText, "Result");

  const transRef =
    params.get("TransRef") ||
    params.get("transRef") ||
    extractXmlValue(bodyText, "TransRef");

  const orderNumber =
    params.get("order") ||
    params.get("Order") ||
    params.get("CompanyRef") ||
    params.get("companyRef") ||
    extractXmlValue(bodyText, "CompanyRef");

  const paymentStatus = result === "000" ? "paid" : "failed";

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase env vars missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const updateData = {
      payment_status: paymentStatus,
      payment_reference: transRef || null,
      order_status: paymentStatus === "paid" ? "confirmed" : "pending",
      updated_at: new Date().toISOString(),
    };

    let query = supabase.from("orders").update(updateData);
    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else if (transRef) {
      query = query.eq("payment_reference", transRef);
    } else {
      return new Response(
        JSON.stringify({
          error: "Callback missing order reference (order/CompanyRef) and TransRef.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { error: updateError } = await query;
    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        ok: true,
        paymentStatus,
        result,
        transRef,
        orderNumber,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("DPO callback update error:", e);
    return new Response(JSON.stringify({ error: "Failed to update order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

