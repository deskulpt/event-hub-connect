import { supabase } from "@/integrations/supabase/client";
import type {
  ListingKind,
  VendorCategory,
  VendorFormInput,
  VendorRecord,
  VenueFormInput,
  VenueRecord,
} from "@/types/listing";

const dollarsToCents = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

const csvToTags = (v: string | undefined): string[] => {
  if (!v) return [];
  return v
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
};

const venueRow = (input: VenueFormInput) => ({
  name: input.name,
  city: input.city ? String(input.city) : null,
  capacity_min: input.capacity_min ? Number(input.capacity_min) : 0,
  capacity_max: input.capacity_max ? Number(input.capacity_max) : 0,
  base_price_cents: dollarsToCents(input.base_price) ?? 0,
  vibe_tags: csvToTags(input.vibe_tags_csv),
  description: input.description ? String(input.description) : null,
  photo_url: input.photo_url ? String(input.photo_url) : null,
  published: !!input.published,
});

const vendorRow = (input: VendorFormInput) => ({
  name: input.name,
  category: input.category,
  city: input.city ? String(input.city) : null,
  base_price_cents: dollarsToCents(input.base_price) ?? 0,
  vibe_tags: csvToTags(input.vibe_tags_csv),
  description: input.description ? String(input.description) : null,
  photo_url: input.photo_url ? String(input.photo_url) : null,
  published: !!input.published,
});

// ---------- Venues ----------
export interface VenueFilters {
  city?: string;
  capacity?: number;
  query?: string;
}

export const listPublishedVenues = async (filters: VenueFilters = {}): Promise<VenueRecord[]> => {
  let q = supabase.from("venues").select("*").eq("published", true);
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.query) q = q.ilike("name", `%${filters.query}%`);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  let rows = (data ?? []) as VenueRecord[];
  if (filters.capacity && filters.capacity > 0) {
    rows = rows.filter(
      (r) =>
        (r.capacity_max ?? 0) >= filters.capacity! &&
        ((r.capacity_min ?? 0) === 0 || (r.capacity_min ?? 0) <= filters.capacity!),
    );
  }
  return rows;
};

export const listOwnVenues = async (ownerId: string): Promise<VenueRecord[]> => {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VenueRecord[];
};

export const getVenue = async (id: string): Promise<VenueRecord | null> => {
  const { data, error } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as VenueRecord | null) ?? null;
};

export const createVenue = async (input: VenueFormInput, ownerId: string): Promise<VenueRecord> => {
  const { data, error } = await supabase
    .from("venues")
    .insert({ ...venueRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as VenueRecord;
};

export const updateVenue = async (id: string, input: VenueFormInput): Promise<VenueRecord> => {
  const { data, error } = await supabase.from("venues").update(venueRow(input)).eq("id", id).select("*").single();
  if (error) throw error;
  return data as VenueRecord;
};

export const deleteVenue = async (id: string): Promise<void> => {
  const { error } = await supabase.from("venues").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Vendors ----------
export interface VendorFilters {
  city?: string;
  category?: VendorCategory;
  query?: string;
}

export const listPublishedVendors = async (filters: VendorFilters = {}): Promise<VendorRecord[]> => {
  let q = supabase.from("vendors").select("*").eq("published", true);
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.query) q = q.ilike("name", `%${filters.query}%`);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as VendorRecord[];
};

export const listOwnVendors = async (ownerId: string): Promise<VendorRecord[]> => {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VendorRecord[];
};

export const getVendor = async (id: string): Promise<VendorRecord | null> => {
  const { data, error } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as VendorRecord | null) ?? null;
};

export const createVendor = async (input: VendorFormInput, ownerId: string): Promise<VendorRecord> => {
  const { data, error } = await supabase
    .from("vendors")
    .insert({ ...vendorRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as VendorRecord;
};

export const updateVendor = async (id: string, input: VendorFormInput): Promise<VendorRecord> => {
  const { data, error } = await supabase.from("vendors").update(vendorRow(input)).eq("id", id).select("*").single();
  if (error) throw error;
  return data as VendorRecord;
};

export const deleteVendor = async (id: string): Promise<void> => {
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Saved ----------
export interface SavedRow {
  id: string;
  user_id: string;
  listing_id: string;
  listing_kind: ListingKind;
  created_at: string;
}

export const listSaved = async (userId: string): Promise<SavedRow[]> => {
  const { data, error } = await supabase
    .from("saved_listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedRow[];
};

export const isListingSaved = async (
  userId: string,
  listingId: string,
  kind: ListingKind,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("saved_listings")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .eq("listing_kind", kind)
    .maybeSingle();
  if (error) throw error;
  return !!data;
};

export const saveListing = async (
  userId: string,
  listingId: string,
  kind: ListingKind,
): Promise<void> => {
  const { error } = await supabase
    .from("saved_listings")
    .insert({ user_id: userId, listing_id: listingId, listing_kind: kind });
  if (error && !String(error.message).includes("duplicate")) throw error;
};

export const unsaveListing = async (
  userId: string,
  listingId: string,
  kind: ListingKind,
): Promise<void> => {
  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .eq("listing_kind", kind);
  if (error) throw error;
};

// ---------- Hydration helpers ----------
export const getVenuesByIds = async (ids: string[]): Promise<VenueRecord[]> => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("venues").select("*").in("id", ids);
  if (error) throw error;
  return (data ?? []) as VenueRecord[];
};

export const getVendorsByIds = async (ids: string[]): Promise<VendorRecord[]> => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("vendors").select("*").in("id", ids);
  if (error) throw error;
  return (data ?? []) as VendorRecord[];
};
