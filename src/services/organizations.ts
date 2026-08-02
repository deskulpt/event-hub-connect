import { supabase } from "@/integrations/supabase/client";
import type { Organization, ContentReport } from "@/types/community";

export const listOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Organization[];
};

export interface OrganizationInput {
  name: string;
  kind: string;
  description?: string;
  city?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  registration_number?: string;
  locality_id?: string | null;
}

export const createOrganization = async (
  input: OrganizationInput,
  ownerId: string,
): Promise<Organization> => {
  const { data, error } = await supabase
    .from("organizations")
    .insert({ ...input, owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;
  return data as Organization;
};

export const setOrganizationStatus = async (id: string, status: Organization["status"]) => {
  const { error } = await supabase.from("organizations").update({ status }).eq("id", id);
  if (error) throw error;
};

export const listReports = async (): Promise<ContentReport[]> => {
  const { data, error } = await supabase
    .from("content_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ContentReport[];
};

export const createReport = async (input: {
  subject_table: string;
  subject_id: string;
  reason: string;
  details?: string;
  reporter_id: string;
}) => {
  const { error } = await supabase.from("content_reports").insert(input);
  if (error) throw error;
};

export const decideReport = async (
  id: string,
  status: ContentReport["status"],
  decision: string,
  moderatorId: string,
) => {
  const { error } = await supabase
    .from("content_reports")
    .update({ status, decision, decided_by: moderatorId, decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

export const triageReport = async (reportId: string) => {
  const { data, error } = await supabase.functions.invoke("moderate-content", { body: { reportId } });
  if (error) throw error;
  return data as { label: string; confidence: number; rationale: string };
};
