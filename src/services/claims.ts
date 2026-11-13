import { supabase } from "@/integrations/supabase/client";

export type ClaimKind = "venue" | "vendor";

export interface ClaimInput {
  listingId: string;
  listingKind: ClaimKind;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  roleAtBusiness?: string;
  proofNote?: string;
}

export interface ClaimRecord {
  id: string;
  listing_id: string;
  listing_kind: ClaimKind;
  claimant_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  role_at_business: string | null;
  proof_note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface UnclaimedListing {
  id: string;
  name: string;
  kind: ClaimKind;
  city: string | null;
  website: string | null;
  phone: string | null;
}

export const submitClaim = async (input: ClaimInput, claimantId: string): Promise<void> => {
  const { error } = await supabase.from("listing_claims").insert({
    listing_id: input.listingId,
    listing_kind: input.listingKind,
    claimant_id: claimantId,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone || null,
    role_at_business: input.roleAtBusiness || null,
    proof_note: input.proofNote || null,
  });
  if (error) {
    if (error.message.includes("duplicate")) throw new Error("You've already sent a claim for this listing.");
    throw error;
  }
};

export const listClaims = async (): Promise<ClaimRecord[]> => {
  const { data, error } = await supabase.from("listing_claims").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClaimRecord[];
};

export const approveClaim = async (claimId: string): Promise<void> => {
  const { error } = await supabase.rpc("approve_listing_claim", { _claim_id: claimId });
  if (error) throw error;
};

export const rejectClaim = async (claimId: string): Promise<void> => {
  const { error } = await supabase.from("listing_claims").update({ status: "rejected" }).eq("id", claimId);
  if (error) throw error;
};

export const listUnclaimed = async (): Promise<UnclaimedListing[]> => {
  const [v, p] = await Promise.all([
    supabase.from("venues").select("id,name,city,website,phone").eq("claim_status", "unclaimed").order("name"),
    supabase.from("vendors").select("id,name,city,website,phone").eq("claim_status", "unclaimed").order("name"),
  ]);
  if (v.error) throw v.error;
  if (p.error) throw p.error;
  return [
    ...(v.data ?? []).map((r) => ({ ...r, kind: "venue" as const })),
    ...(p.data ?? []).map((r) => ({ ...r, kind: "vendor" as const })),
  ];
};

export const buildInviteMessage = (l: UnclaimedListing, origin: string): string => {
  const path = l.kind === "venue" ? "venue" : "pro";
  return `Hello ${l.name} team,

We've featured ${l.name} on Vibely, a Greater Toronto community platform that helps adults over 50 find and book local activities, venues and professionals.

Claim your free listing to add photos and pricing, receive booking requests, and get paid directly. There's no monthly fee — we only take a 10% fee when a booking is paid.

Claim it here: ${origin}/app/marketplace/${path}/${l.id}

Warm regards,
Aloke — Vibely`;
};
