import { z } from "zod";

export const VENDOR_CATEGORIES = [
  "chef",
  "dj",
  "photographer",
  "planner",
  "artist",
  "caterer",
  "florist",
  "other",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export type ListingKind = "venue" | "vendor";

export interface VenueRecord {
  id: string;
  owner_id: string;
  name: string;
  city: string | null;
  capacity_min: number | null;
  capacity_max: number | null;
  base_price_cents: number | null;
  vibe_tags: string[] | null;
  description: string | null;
  photo_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorRecord {
  id: string;
  owner_id: string;
  name: string;
  category: VendorCategory;
  city: string | null;
  base_price_cents: number | null;
  vibe_tags: string[] | null;
  description: string | null;
  photo_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type AnyListing =
  | ({ kind: "venue" } & VenueRecord)
  | ({ kind: "vendor" } & VendorRecord);

export const venueFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  capacity_min: z.coerce.number().int().min(0).max(100000).optional().or(z.literal("" as unknown as number)),
  capacity_max: z.coerce.number().int().min(0).max(100000).optional().or(z.literal("" as unknown as number)),
  base_price: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("" as unknown as number)),
  vibe_tags_csv: z.string().trim().max(280).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  photo_url: z.string().trim().url("Must be a URL").optional().or(z.literal("")),
  published: z.boolean().default(false),
});
export type VenueFormInput = z.infer<typeof venueFormSchema>;

export const vendorFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  category: z.enum(VENDOR_CATEGORIES),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  base_price: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("" as unknown as number)),
  vibe_tags_csv: z.string().trim().max(280).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  photo_url: z.string().trim().url("Must be a URL").optional().or(z.literal("")),
  published: z.boolean().default(false),
});
export type VendorFormInput = z.infer<typeof vendorFormSchema>;
