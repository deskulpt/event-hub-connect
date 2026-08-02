// Provider-abstraction layer. Features request a capability, never a vendor.
// Routing is read at runtime from `ai_provider_settings` so admins can change it
// without a redeploy. Credentials never leave the server.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const DEFAULT_MODEL = "openai/gpt-5.6-sol";

export const serviceClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

export interface Routing {
  feature: string;
  provider: string;
  model: string;
  fallbackProvider: string | null;
  fallbackModel: string | null;
  enabled: boolean;
}

export const resolveRouting = async (feature: string): Promise<Routing> => {
  try {
    const sb = serviceClient();
    const { data } = await sb
      .from("ai_provider_settings")
      .select("*")
      .eq("feature", feature)
      .maybeSingle();
    if (data) {
      return {
        feature,
        provider: data.primary_provider,
        model: data.primary_model || DEFAULT_MODEL,
        fallbackProvider: data.fallback_provider,
        fallbackModel: data.fallback_model,
        enabled: data.enabled,
      };
    }
  } catch (_error) {
    // fall through to the built-in default
  }
  return {
    feature,
    provider: "lovable",
    model: DEFAULT_MODEL,
    fallbackProvider: null,
    fallbackModel: null,
    enabled: true,
  };
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Only the Lovable slot is wired. Other providers (Sarvam, Google, Azure) are
// declared in routing and degrade to the Lovable default until wired.
export const runChat = async (
  feature: string,
  messages: ChatMessage[],
): Promise<string> => {
  const routing = await resolveRouting(feature);
  if (!routing.enabled) throw new Error(`AI capability "${feature}" is disabled`);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const model = routing.provider === "lovable" ? routing.model : DEFAULT_MODEL;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, reasoning_effort: "none" }),
  });

  if (response.status === 429) throw new Error("rate_limited");
  if (response.status === 402) throw new Error("credits_exhausted");
  if (!response.ok) throw new Error(`AI gateway error ${response.status}: ${await response.text()}`);

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content ?? "";
};

export const parseJsonBlock = <T>(raw: string, fallback: T): T => {
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch (_error) {
    return fallback;
  }
};
