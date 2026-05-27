// AI Caller stub: enqueue an outbound call and simulate an outcome. Real telephony plugs in later.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const outcomes = ["available", "unavailable", "callback", "no_answer", "voicemail"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { event_id, target_kind, target_id, target_name, phone, inquiry_id } = await req.json();

    const authHeader = req.headers.get("Authorization") ?? "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const summaryMap: Record<string, string> = {
      available: `Confirmed availability for the requested date with ${target_name ?? "the supplier"}. Quote and follow-up email to be sent.`,
      unavailable: `${target_name ?? "Supplier"} is unavailable for the requested date. Suggested alternates within 7 days.`,
      callback: `${target_name ?? "Supplier"} requested a callback later today to check the calendar.`,
      no_answer: `Three attempts, no answer. Will retry tomorrow morning.`,
      voicemail: `Left a voicemail with event details and callback number.`,
    };

    const { data, error } = await sb.from("voice_calls").insert({
      owner_id: user.id,
      event_id: event_id ?? null,
      inquiry_id: inquiry_id ?? null,
      target_kind: target_kind ?? null,
      target_id: target_id ?? null,
      target_name: target_name ?? null,
      phone: phone ?? null,
      status: "completed",
      outcome,
      summary: summaryMap[outcome],
      transcript: `AI Caller (simulated): Hi, calling on behalf of a host about an event. ...\n${target_name ?? "Supplier"}: ${outcome === "available" ? "Yes, we have that date." : outcome === "unavailable" ? "Sorry, that date is fully booked." : "Could you call back later?"}`,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    }).select("*").single();
    if (error) throw error;

    return new Response(JSON.stringify({ call: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-call error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
