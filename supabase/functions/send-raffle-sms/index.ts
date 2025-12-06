/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const body = (await req.json()) as SmsRequest;
    const { parentPhone, parentName, children } = body;

    if (!parentPhone || !children || !Array.isArray(children) || children.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: parentPhone, children[]" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const SMS_API_URL = Deno.env.get("SMS_API_URL") || "https://smsmisr.com/api/SMS/";
    const SMS_USERNAME = Deno.env.get("SMS_USERNAME");
    const SMS_PASSWORD = Deno.env.get("SMS_PASSWORD");
    const SMS_SENDER = Deno.env.get("SMS_SENDER");
    const SMS_ENVIRONMENT = Deno.env.get("SMS_ENVIRONMENT") || "1";
    const SMS_TEMPLATE = Deno.env.get("SMS_TEMPLATE");

    if (!SMS_USERNAME || !SMS_PASSWORD || !SMS_SENDER) {
      console.error("[send-raffle-sms] Missing SMS credentials");
      return new Response(JSON.stringify({ error: "SMS service not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const cleanedPhone = String(parentPhone).replace(/[^\d]/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      return new Response(JSON.stringify({ error: "Invalid parent phone number format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const childLines = children
      .map(
        (child) =>
          `${child.kidName} — Raffle Number: #${child.raffleNumber.toString().padStart(3, "0")}`,
      )
      .join("\n");

    const defaultMessage = `Congratulations! The following children are entered in the raffle:\n${childLines}${
      parentName ? `\nParent: ${parentName}` : ""
    }`;

    const message = SMS_TEMPLATE
      ? SMS_TEMPLATE.replace("{children}", childLines).replace("{parent}", parentName ?? "")
      : defaultMessage;

    const formData = new URLSearchParams();
    formData.append("environment", SMS_ENVIRONMENT);
    formData.append("username", SMS_USERNAME);
    formData.append("password", SMS_PASSWORD);
    formData.append("sender", SMS_SENDER);
    formData.append("mobile", cleanedPhone);
    formData.append("language", "1");
    formData.append("message", message);

    console.log(`[send-raffle-sms] Sending to ${cleanedPhone}`);

    const smsResponse = await fetch(SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const responseText = await smsResponse.text();
    console.log(
      `[send-raffle-sms] SMS API status ${smsResponse.status} response: ${responseText}`,
    );

    if (!smsResponse.ok) {
      return new Response(
        JSON.stringify({ error: "SMS API error", status: smsResponse.status, responseText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    let success = true;
    let apiCode: string | undefined;
    try {
      const responseJson = JSON.parse(responseText);
      apiCode = responseJson.code;
      if (responseJson.code !== "1901") {
        success = false;
      }
    } catch (_err) {
      // if parse fails, consider success if HTTP ok
    }

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "SMS API indicated failure",
          status: smsResponse.status,
          code: apiCode,
          responseText,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: cleanedPhone,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("[send-raffle-sms] Unexpected error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error", message: e?.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

