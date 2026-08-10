// Generate a shareable invite: AI copy + AI image, persisted as an event_invite with a slug.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "invite";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { event_id, style_hint, image_url } = await req.json();
    if (!event_id) {
      return new Response(JSON.stringify({ error: "event_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: event, error: evErr } = await sb.from("events").select("*").eq("id", event_id).single();
    if (evErr || !event) return new Response(JSON.stringify({ error: "event not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1) Copy via tool calling
    const copyResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write warm, modern, share-ready event invitations for WhatsApp and social posts. Tone: inviting, concise, energetic." },
          { role: "user", content: `Write an invite for this event.\n\nTitle: ${event.title}\nType: ${event.event_type ?? "celebration"}\nDate: ${event.event_date ?? "TBD"}\nCity: ${event.city ?? "TBD"}\nGuests: ${event.guest_count ?? "?"}\nVibe: ${event.vibe ?? "—"}\nStyle hint: ${style_hint ?? "modern"}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_invite",
            description: "Return invitation copy.",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "Short, punchy headline, max 60 chars." },
                copy: { type: "string", description: "Body copy, 2-4 short sentences. Include date and city if known." },
                share_text: { type: "string", description: "Single line ideal for WhatsApp share, includes invite link placeholder {link}." },
                image_prompt: { type: "string", description: "Visual prompt for a square invite image, no text in image." },
              },
              required: ["headline", "copy", "share_text", "image_prompt"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_invite" } },
      }),
    });
    if (!copyResp.ok) {
      if (copyResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (copyResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("copy generation failed");
    }
    const copyJson = await copyResp.json();
    const copyArgs = JSON.parse(copyJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");

    // 2) Image: either use provided image_url, or generate one
    let finalImageUrl: string | null = image_url ?? null;
    if (!finalImageUrl && copyArgs.image_prompt) {
      try {
        const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: `Square 1:1 event invite cover, no text overlays. ${copyArgs.image_prompt}` }],
            modalities: ["image", "text"],
          }),
        });
        if (imgResp.ok) {
          const imgJson = await imgResp.json();
          const b64 = imgJson.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? imgJson.choices?.[0]?.message?.content?.find?.((c: { type: string; image_url?: { url: string } }) => c.type === "image_url")?.image_url?.url;
          if (b64 && typeof b64 === "string" && b64.startsWith("data:")) {
            const [meta, data] = b64.split(",");
            const mime = meta.match(/data:(.*?);/)?.[1] ?? "image/png";
            const ext = mime.split("/")[1] ?? "png";
            const bin = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
            const path = `${user.id}/${event_id}-${Date.now()}.${ext}`;
            const { error: upErr } = await service.storage.from("invites").upload(path, bin, { contentType: mime, upsert: true });
            if (!upErr) {
              const { data: signed } = await service.storage
                .from("invites")
                .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
              if (signed?.signedUrl) finalImageUrl = signed.signedUrl;
            }
          }
        }
      } catch (imgE) {
        console.error("image gen failed (non-fatal)", imgE);
      }
    }

    const slug = `${slugify(event.title)}-${crypto.randomUUID().slice(0, 6)}`;

    const { data: invite, error: insErr } = await sb.from("event_invites").insert({
      event_id, owner_id: user.id, slug,
      headline: copyArgs.headline ?? event.title,
      copy: copyArgs.copy ?? null,
      image_url: finalImageUrl,
      source: image_url ? "upload" : "ai",
    }).select("*").single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ invite, share_text: copyArgs.share_text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-invite error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
