import { supabase } from "@/integrations/supabase/client";
import type { ProfessionalCredential, VerificationState } from "@/types/community";

export const listMyCredentials = async (ownerId: string): Promise<ProfessionalCredential[]> => {
  const { data, error } = await supabase
    .from("professional_credentials")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProfessionalCredential[];
};

export const createCredential = async (input: {
  vendor_id: string;
  owner_id: string;
  kind: string;
  title: string;
  document_url?: string;
  issued_on?: string;
  expires_on?: string;
}): Promise<ProfessionalCredential> => {
  const { data, error } = await supabase
    .from("professional_credentials")
    .insert({ ...input, state: "pending" as VerificationState })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProfessionalCredential;
};

export const expressSponsorshipInterest = async (input: {
  package_id: string;
  user_id: string;
  organization_id?: string | null;
  note?: string;
}) => {
  // No dedicated interest table in Phase 1 — record via audit-style content report channel
  // so staff see intent in the report queue without a migration.
  const { error } = await supabase.from("content_reports").insert({
    reporter_id: input.user_id,
    subject_table: "sponsorship_packages",
    subject_id: input.package_id,
    reason: "sponsorship_interest",
    details: input.note ?? (input.organization_id ? `org:${input.organization_id}` : null),
  });
  if (error) throw error;
};
