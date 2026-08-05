import { supabase } from "@/integrations/supabase/client";
import type {
  AiProviderSetting,
  EventGenerationRule,
  FeatureFlag,
  LocalizationSetting,
  SponsorshipPackage,
} from "@/types/community";

export const listFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const { data, error } = await supabase.from("feature_flags").select("*").order("key");
  if (error) throw error;
  return (data ?? []) as FeatureFlag[];
};

export const setFeatureFlag = async (key: string, enabled: boolean) => {
  const { error } = await supabase.from("feature_flags").update({ enabled }).eq("key", key);
  if (error) throw error;
};

export const listAiSettings = async (): Promise<AiProviderSetting[]> => {
  const { data, error } = await supabase.from("ai_provider_settings").select("*").order("feature");
  if (error) throw error;
  return (data ?? []) as AiProviderSetting[];
};

export const updateAiSetting = async (id: string, patch: Partial<AiProviderSetting>) => {
  const { error } = await supabase.from("ai_provider_settings").update(patch).eq("id", id);
  if (error) throw error;
};

export const listLanguages = async (): Promise<LocalizationSetting[]> => {
  const { data, error } = await supabase
    .from("localization_settings")
    .select("*")
    .order("is_default", { ascending: false })
    .order("label");
  if (error) throw error;
  return (data ?? []) as LocalizationSetting[];
};

export const updateLanguage = async (id: string, patch: Partial<LocalizationSetting>) => {
  const { error } = await supabase.from("localization_settings").update(patch).eq("id", id);
  if (error) throw error;
};

export const listGenerationRules = async (): Promise<EventGenerationRule[]> => {
  const { data, error } = await supabase.from("event_generation_rules").select("*");
  if (error) throw error;
  return (data ?? []) as EventGenerationRule[];
};

export const upsertGenerationRule = async (
  localityId: string,
  patch: Partial<EventGenerationRule>,
) => {
  const { error } = await supabase
    .from("event_generation_rules")
    .upsert({ locality_id: localityId, ...patch }, { onConflict: "locality_id" });
  if (error) throw error;
};

export const listSponsorshipPackages = async (): Promise<SponsorshipPackage[]> => {
  const { data, error } = await supabase.from("sponsorship_packages").select("*").order("price_cents");
  if (error) throw error;
  return (data ?? []) as SponsorshipPackage[];
};

export const listAuditLog = async () => {
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
};

export const recordAudit = async (entry: {
  actor_id: string;
  domain: string;
  action: string;
  target_id?: string;
  reason?: string;
  after_value?: Record<string, string | number | boolean | null>;
}) => {
  await supabase.from("admin_audit_log").insert([entry]);
};

export interface CommissionRule {
  id: string;
  category: string;
  rate_percent: number;
  floor_cents: number;
  cap_cents: number | null;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export const listCommissionRules = async (): Promise<CommissionRule[]> => {
  const { data, error } = await supabase
    .from("commission_rules")
    .select("*")
    .order("category");
  if (error) throw error;
  return (data ?? []) as CommissionRule[];
};

export interface ToggleOverride {
  id: string;
  flag_key: string;
  scope_kind: string;
  scope_id: string | null;
  enabled: boolean;
  created_at: string;
}

export const listToggleOverrides = async (): Promise<ToggleOverride[]> => {
  const { data, error } = await supabase
    .from("feature_toggle_overrides")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ToggleOverride[];
};

export interface GenerationRun {
  id: string;
  locality_id: string | null;
  period: string;
  status: string;
  model: string | null;
  proposals_created: number;
  diagnostics: unknown;
  created_at: string;
}

export const listGenerationRuns = async (): Promise<GenerationRun[]> => {
  const { data, error } = await supabase
    .from("proposal_generation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as GenerationRun[];
};

export const listAllLocalities = async () => {
  const { data, error } = await supabase.from("localities").select("*").order("name");
  if (error) throw error;
  return data ?? [];
};

export const setLocalityActive = async (id: string, active: boolean) => {
  const { error } = await supabase.from("localities").update({ active }).eq("id", id);
  if (error) throw error;
};

export const setSponsorshipPackageActive = async (id: string, active: boolean) => {
  const { error } = await supabase.from("sponsorship_packages").update({ active }).eq("id", id);
  if (error) throw error;
};

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  domain: string;
  action: string;
  target_id: string | null;
  reason: string | null;
  created_at: string;
}
