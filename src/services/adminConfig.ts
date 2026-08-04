import { supabase } from "@/integrations/supabase/client";
import type {
  AiProviderSetting,
  CommissionRule,
  ContentModerationSetting,
  EventGenerationRule,
  FeatureFlag,
  LocalizationSetting,
  ProfessionalCredential,
  ProposalGenerationRun,
  SponsorshipPackage,
  VerificationState,
} from "@/types/community";
import type { Organization } from "@/types/community";
import { listLocalities } from "@/services/localities";

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

export const upsertSponsorshipPackage = async (
  input: Partial<SponsorshipPackage> & { name: string; price_cents: number },
) => {
  const { error } = await supabase.from("sponsorship_packages").upsert(input);
  if (error) throw error;
};

export const setSponsorshipPackageActive = async (id: string, active: boolean) => {
  const { error } = await supabase.from("sponsorship_packages").update({ active }).eq("id", id);
  if (error) throw error;
};

export const listCommissionRules = async (): Promise<CommissionRule[]> => {
  const { data, error } = await supabase
    .from("commission_rules")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CommissionRule[];
};

export const createCommissionRule = async (input: {
  category: string;
  rate_percent: number;
  floor_cents?: number;
  cap_cents?: number | null;
  created_by?: string;
}) => {
  const { error } = await supabase.from("commission_rules").insert(input);
  if (error) throw error;
};

export const listModerationSettings = async (): Promise<ContentModerationSetting[]> => {
  const { data, error } = await supabase.from("content_moderation_settings").select("*").order("key");
  if (error) throw error;
  return (data ?? []) as ContentModerationSetting[];
};

export const upsertModerationSetting = async (key: string, value: Record<string, unknown>) => {
  const { error } = await supabase
    .from("content_moderation_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
};

export const listProposalRuns = async (): Promise<ProposalGenerationRun[]> => {
  const { data, error } = await supabase
    .from("proposal_generation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ProposalGenerationRun[];
};

export const listPendingCredentials = async (): Promise<ProfessionalCredential[]> => {
  const { data, error } = await supabase
    .from("professional_credentials")
    .select("*")
    .eq("state", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProfessionalCredential[];
};

export const reviewCredential = async (
  id: string,
  state: VerificationState,
  reviewerNote?: string,
) => {
  const { error } = await supabase
    .from("professional_credentials")
    .update({ state, reviewer_note: reviewerNote ?? null })
    .eq("id", id);
  if (error) throw error;
};

export const listPendingOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Organization[];
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

export const adminListLocalities = () => listLocalities({ includeInactive: true });

export const updateLocalityActive = async (id: string, active: boolean) => {
  const { error } = await supabase.from("localities").update({ active }).eq("id", id);
  if (error) throw error;
};

export const createLocality = async (input: {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  default_language?: string;
  radius_miles?: number;
}) => {
  const { error } = await supabase.from("localities").insert({
    name: input.name,
    city: input.city ?? null,
    state: input.state ?? null,
    country: input.country ?? "IN",
    default_language: input.default_language ?? "en",
    radius_miles: input.radius_miles ?? 3,
  });
  if (error) throw error;
};
