// Monthly activity proposal engine: turns member density and interests in a
// locality into a slate of candidate activities that members vote on.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, json, runChat, parseJsonBlock, serviceClient } from "../_shared/ai.ts";

interface ProposalDraft {
  title: string;
  summary: string;
  category: string;
  suggested_time: string;
  indoor_outdoor: string;
  accessibility_attributes: string[];
  estimated_cost_cents: number;
  rationale: string;
  days_from_now: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { localityId, slateSize } = await req.json();
    if (!localityId) return json({ error: "localityId required" }, 400);

    const authHeader = req.headers.get("Authorization") ?? "";
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const sb = serviceClient();

    const { data: locality } = await sb.from("localities").select("*").eq("id", localityId).maybeSingle();
    if (!locality) return json({ error: "locality not found" }, 404);

    const { data: rule } = await sb
      .from("event_generation_rules")
      .select("*")
      .eq("locality_id", localityId)
      .maybeSingle();

    const size = slateSize ?? rule?.slate_size ?? 5;
    const votingWindow = rule?.voting_window_days ?? 14;
    const multiplier = Number(rule?.threshold_multiplier ?? 0.2);
    const minThreshold = rule?.min_threshold ?? 5;

    const { count: memberCount } = await sb
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("locality_id", localityId);

    const { data: memberRows } = await sb
      .from("profiles")
      .select("interests, preferred_language")
      .eq("locality_id", localityId)
      .limit(500);

    const interestTally: Record<string, number> = {};
    const languageTally: Record<string, number> = {};
    for (const row of memberRows ?? []) {
      for (const interest of (row.interests ?? []) as string[]) {
        interestTally[interest] = (interestTally[interest] ?? 0) + 1;
      }
      const lang = row.preferred_language ?? "en";
      languageTally[lang] = (languageTally[lang] ?? 0) + 1;
    }
    const topInterests = Object.entries(interestTally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, n]) => `${name} (${n})`);
    const topLanguage =
      Object.entries(languageTally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? locality.default_language;

    const density = memberCount ?? 0;
    const threshold = Math.max(minThreshold, Math.round(density * multiplier) || minThreshold);

    const { data: recent } = await sb
      .from("generated_activity_proposals")
      .select("title")
      .eq("locality_id", localityId)
      .order("created_at", { ascending: false })
      .limit(20);

    const prompt = `You plan community activities for adults aged 50 and over in India.

NEIGHBOURHOOD: ${locality.name}, ${locality.city ?? ""} ${locality.state ?? ""}
Members in this neighbourhood: ${density}
Radius: ${locality.radius_miles} mile(s)
Top interests: ${topInterests.length ? topInterests.join(", ") : "not yet known — use broadly appealing defaults"}
Dominant language: ${topLanguage}
Recently proposed (do not repeat): ${(recent ?? []).map((r) => r.title).join("; ") || "none"}

Propose ${size} distinct activities for the coming month. Rules:
- Low cost or free where possible; realistic for this neighbourhood.
- Morning or late-afternoon timings that suit older adults.
- Each must be reachable within a short distance and physically gentle.
- Include accessibility attributes drawn from: step-free access, seating available, restrooms nearby, short walking distance, wheelchair accessible, hearing loop, shade / indoors, companion welcome.
- Mix indoor and outdoor.

Return ONLY a JSON array of ${size} objects with keys:
title (max 60 chars), summary (max 200 chars), category, suggested_time (e.g. "7:00 AM"),
indoor_outdoor ("indoor" or "outdoor"), accessibility_attributes (array),
estimated_cost_cents (integer, per person, INR paise-free — use rupees*100), rationale (max 160 chars, why this fits this neighbourhood),
days_from_now (integer between 10 and 40).`;

    const raw = await runChat("proposal_generation", [
      { role: "system", content: "You return strictly valid JSON. No prose, no code fences." },
      { role: "user", content: prompt },
    ]);

    const drafts = parseJsonBlock<ProposalDraft[]>(raw, []);
    if (!Array.isArray(drafts) || drafts.length === 0) {
      // Degrade rather than emit low-confidence output.
      await sb.from("proposal_generation_runs").insert({
        locality_id: localityId,
        period: new Date().toISOString().slice(0, 7),
        status: "deferred",
        proposals_created: 0,
        diagnostics: { reason: "model returned no usable slate", density },
      });
      return json({ created: 0, proposals: [], deferred: true });
    }

    const { data: run } = await sb
      .from("proposal_generation_runs")
      .insert({
        locality_id: localityId,
        period: new Date().toISOString().slice(0, 7),
        status: "completed",
        model: "openai/gpt-5.6-sol",
        proposals_created: drafts.length,
        diagnostics: { density, threshold, topInterests, topLanguage },
      })
      .select()
      .single();

    const today = new Date();
    const rows = drafts.slice(0, size).map((draft) => {
      const date = new Date(today);
      date.setDate(date.getDate() + Math.min(60, Math.max(7, Number(draft.days_from_now) || 21)));
      const closes = new Date(today);
      closes.setDate(closes.getDate() + votingWindow);
      return {
        run_id: run?.id ?? null,
        locality_id: localityId,
        title: String(draft.title ?? "").slice(0, 120),
        summary: draft.summary ?? null,
        category: draft.category ?? null,
        language: topLanguage,
        suggested_date: date.toISOString().slice(0, 10),
        suggested_time: draft.suggested_time ?? null,
        indoor_outdoor: draft.indoor_outdoor ?? null,
        accessibility_attributes: Array.isArray(draft.accessibility_attributes)
          ? draft.accessibility_attributes.slice(0, 8)
          : [],
        estimated_cost_cents: Number(draft.estimated_cost_cents) || 0,
        vote_threshold: threshold,
        voting_opens_on: today.toISOString().slice(0, 10),
        voting_closes_on: closes.toISOString().slice(0, 10),
        status: "voting",
        rationale: draft.rationale ?? null,
      };
    });

    const { data: inserted, error } = await sb
      .from("generated_activity_proposals")
      .insert(rows)
      .select();
    if (error) throw error;

    return json({ created: inserted?.length ?? 0, proposals: inserted ?? [], threshold });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const status = message === "rate_limited" ? 429 : message === "credits_exhausted" ? 402 : 500;
    return json({ error: message }, status);
  }
});
