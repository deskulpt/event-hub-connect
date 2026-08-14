import { supabase } from "@/integrations/supabase/client";
import type { PerkOffer, MemorabiliaListing } from "@/types/community";

export const listPerks = async (localityId?: string | null): Promise<PerkOffer[]> => {
  let query = supabase.from("perks_offers").select("*").eq("status", "approved");
  if (localityId) query = query.or(`locality_id.eq.${localityId},locality_id.is.null`);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PerkOffer[];
};

export const listMyPerks = async (ownerId: string): Promise<PerkOffer[]> => {
  const { data, error } = await supabase
    .from("perks_offers")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PerkOffer[];
};

export const listMyRedemptions = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase.from("perk_redemptions").select("perk_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.perk_id);
};

export const redeemPerk = async (perkId: string, userId: string) => {
  const { error } = await supabase.from("perk_redemptions").insert({ perk_id: perkId, user_id: userId });
  if (error) throw error;
};

export interface PerkInput {
  title: string;
  description?: string;
  category?: string;
  discount_label?: string;
  code?: string;
  terms?: string;
  ends_on?: string | null;
  locality_id?: string | null;
}

export const createPerk = async (input: PerkInput, ownerId: string): Promise<PerkOffer> => {
  const { data, error } = await supabase
    .from("perks_offers")
    .insert({ ...input, owner_id: ownerId, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data as PerkOffer;
};

export const listMemorabilia = async (localityId?: string | null): Promise<MemorabiliaListing[]> => {
  let query = supabase.from("memorabilia_listings").select("*").eq("status", "active");
  if (localityId) query = query.or(`locality_id.eq.${localityId},locality_id.is.null`);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MemorabiliaListing[];
};

export interface MemorabiliaInput {
  title: string;
  description?: string;
  category?: string;
  price_cents: number;
  locality_id?: string | null;
}

export const createMemorabilia = async (
  input: MemorabiliaInput,
  ownerId: string,
): Promise<MemorabiliaListing> => {
  const { data, error } = await supabase
    .from("memorabilia_listings")
    .insert({ ...input, owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;
  return data as MemorabiliaListing;
};

export const withdrawMemorabilia = async (id: string) => {
  const { error } = await supabase.from("memorabilia_listings").update({ status: "withdrawn" }).eq("id", id);
  if (error) throw error;
};
