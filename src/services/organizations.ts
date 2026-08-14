import { supabase } from "@/integrations/supabase/client";
import type { Organization, ContentReport, OrganizationMember } from "@/types/community";

export const listOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Organization[];
};

export const getOrganization = async (id: string): Promise<Organization | null> => {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Organization | null) ?? null;
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
  await supabase
    .from("organization_members")
    .insert({ organization_id: data.id, user_id: ownerId, org_role: "admin" });
  return data as Organization;
};

export const setOrganizationStatus = async (id: string, status: Organization["status"]) => {
  const { error } = await supabase.from("organizations").update({ status }).eq("id", id);
  if (error) throw error;
};

export const listOrgMembers = async (organizationId: string): Promise<OrganizationMember[]> => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId);
  if (error) throw error;
  return (data ?? []) as OrganizationMember[];
};

export const lookupUserIdByEmail = async (emailOrId: string): Promise<string> => {
  const raw = emailOrId.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)) {
    return raw;
  }
  const { data, error } = await supabase.rpc("lookup_user_id_by_email", { _email: raw });
  if (error) throw error;
  if (!data) throw new Error("No member found with that email");
  return data as string;
};

export const inviteOrgMember = async (
  organizationId: string,
  emailOrUserId: string,
  orgRole = "member",
) => {
  const userId = await lookupUserIdByEmail(emailOrUserId);
  const { error } = await supabase
    .from("organization_members")
    .insert({ organization_id: organizationId, user_id: userId, org_role: orgRole });
  if (error) throw error;
};

export const removeOrgMember = async (organizationId: string, userId: string) => {
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", userId);
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
