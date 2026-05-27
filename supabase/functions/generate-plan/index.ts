// Generate an AI plan (tasks + run-of-show timeline + supplier shortlist) for an event.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { event_id } = await req.json();
    if (!event_id) {
      return new Response(JSON.stringify({ error: "event_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: event, error: evErr } = await sb.from("events").select("*").eq("id", event_id).single();
    if (evErr || !event) return new Response(JSON.stringify({ error: "event not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Plan this event end-to-end. Return a concise overview, prioritized task list with due offsets (in days before event), an hour-by-hour day-of run of show, and recommended supplier categories to source.

EVENT:
- Title: ${event.title}
- Type: ${event.event_type ?? "n/a"}
- Date: ${event.event_date ?? "TBD"}
- City: ${event.city ?? "n/a"}
- Guests: ${event.guest_count ?? "n/a"}
- Budget cents: ${event.budget_cents ?? "n/a"}
- Vibe: ${event.vibe ?? "n/a"}
- Dietary: ${event.dietary_notes ?? "none"}
- Accessibility: ${event.accessibility_notes ?? "none"}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert event planner. Always respond by calling the return_plan tool." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_plan",
            description: "Return the structured event plan.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      due_offset_days: { type: "number", description: "Days before event_date. 0 = day-of." },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      owner: { type: "string", enum: ["host", "venue", "pro"] },
                    },
                    required: ["title", "due_offset_days", "priority", "owner"],
                  },
                },
                timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string", description: "Time of day like '18:00'." },
                      title: { type: "string" },
                      detail: { type: "string" },
                    },
                    required: ["time", "title"],
                  },
                },
                shortlist: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      reason: { type: "string" },
                    },
                    required: ["category", "reason"],
                  },
                },
              },
              required: ["summary", "tasks", "timeline", "shortlist"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_plan" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiResp.json();
    const args = aiJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No plan returned");
    const parsed = JSON.parse(args);

    const { data: plan, error: insErr } = await sb
      .from("event_plans")
      .upsert(
        {
          event_id,
          owner_id: user.id,
          summary: parsed.summary,
          tasks: parsed.tasks,
          timeline: parsed.timeline,
          shortlist: parsed.shortlist,
          model: "google/gemini-2.5-flash",
        },
        { onConflict: "event_id" },
      )
      .select("*")
      .single();
    if (insErr) {
      // Fallback: delete then insert if no unique constraint on event_id
      await sb.from("event_plans").delete().eq("event_id", event_id);
      const { data: p2, error: e2 } = await sb.from("event_plans").insert({
        event_id, owner_id: user.id, summary: parsed.summary, tasks: parsed.tasks, timeline: parsed.timeline, shortlist: parsed.shortlist, model: "google/gemini-2.5-flash",
      }).select("*").single();
      if (e2) throw e2;
      return new Response(JSON.stringify({ plan: p2 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ plan }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-plan error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
