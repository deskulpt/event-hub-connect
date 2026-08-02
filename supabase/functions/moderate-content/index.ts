// Moderation triage + scam/fact-check reasoning. Pattern match always runs
// first; the model only adds a label and confidence. Takedown stays human.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, json, runChat, parseJsonBlock, serviceClient } from "../_shared/ai.ts";

interface Triage {
  label: string;
  confidence: number;
  rationale: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reportId, text } = await req.json();

    const authHeader = req.headers.get("Authorization") ?? "";
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const sb = serviceClient();

    let subject = text ?? "";
    let report: { id: string; reason: string; details: string | null } | null = null;
    if (reportId) {
      const { data } = await sb.from("content_reports").select("*").eq("id", reportId).maybeSingle();
      if (!data) return json({ error: "report not found" }, 404);
      report = data;
      subject = `${data.reason}\n\n${data.details ?? ""}`;
    }
    if (!subject.trim()) return json({ error: "nothing to review" }, 400);

    // Rules-only pass: always runs, and is the fallback if the model is down.
    const { data: patternRow } = await sb
      .from("content_moderation_settings")
      .select("value")
      .eq("key", "banned_patterns")
      .maybeSingle();
    const patterns: string[] = (patternRow?.value as { patterns?: string[] })?.patterns ?? [];
    const hit = patterns.find((p) => subject.toLowerCase().includes(p.toLowerCase()));

    let triage: Triage = hit
      ? { label: "likely_scam", confidence: 0.9, rationale: `Matched banned pattern: "${hit}".` }
      : { label: "needs_review", confidence: 0.3, rationale: "No banned pattern matched." };

    try {
      const raw = await runChat("moderation_triage", [
        {
          role: "system",
          content:
            "You triage community safety reports for a platform used by adults over 50 in India. You never decide takedowns; you label and explain. Return strictly valid JSON only.",
        },
        {
          role: "user",
          content: `Classify this report. Labels: likely_scam, harassment, misinformation, spam, off_topic, no_action, needs_review.\n\nREPORT:\n${subject}\n\nReturn JSON: {"label": "...", "confidence": 0.0-1.0, "rationale": "max 200 chars"}`,
        },
      ]);
      const parsed = parseJsonBlock<Triage>(raw, triage);
      if (parsed?.label) {
        triage = {
          label: parsed.label,
          confidence: Math.max(hit ? 0.9 : 0, Number(parsed.confidence) || 0),
          rationale: parsed.rationale ?? triage.rationale,
        };
      }
    } catch (_error) {
      // Degrade to the rules-only result.
    }

    if (report) {
      await sb
        .from("content_reports")
        .update({
          status: "triaged",
          triage_label: triage.label,
          triage_confidence: triage.confidence,
        })
        .eq("id", report.id);
    }

    return json(triage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return json({ error: message }, 500);
  }
});
