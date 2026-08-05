import { supabase } from "@/integrations/supabase/client";
import type { VerificationState } from "@/types/community";

export interface ProfessionalCredential {
  id: string;
  vendor_id: string;
  owner_id: string;
  kind: string;
  title: string;
  document_url: string | null;
  issued_on: string | null;
  expires_on: string | null;
  state: VerificationState;
  reviewer_note: string | null;
  created_at: string;
}

export const listCredentials = async (ownerId?: string): Promise<ProfessionalCredential[]> => {
  let query = supabase.from("professional_credentials").select("*");
  if (ownerId) query = query.eq("owner_id", ownerId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProfessionalCredential[];
};

export interface CredentialInput {
  vendor_id: string;
  kind: string;
  title: string;
  document_url?: string | null;
  issued_on?: string | null;
  expires_on?: string | null;
}

export const createCredential = async (input: CredentialInput, ownerId: string) => {
  const { error } = await supabase
    .from("professional_credentials")
    .insert({ ...input, owner_id: ownerId, state: "pending" });
  if (error) throw error;
};

export const reviewCredential = async (
  id: string,
  state: VerificationState,
  reviewerNote: string,
) => {
  const { error } = await supabase
    .from("professional_credentials")
    .update({ state, reviewer_note: reviewerNote })
    .eq("id", id);
  if (error) throw error;
};
