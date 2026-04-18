import type { EventRecord } from "@/types/event";
import type { VendorRecord, VenueRecord } from "@/types/listing";

export interface FitBreakdown {
  total: number;
  city: number;
  capacity: number;
  vibe: number;
  budget: number;
}

const tokenize = (v: string | null | undefined): string[] =>
  (v ?? "")
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

const sameCity = (a?: string | null, b?: string | null): number => {
  if (!a || !b) return 0;
  return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0;
};

const vibeOverlap = (eventVibe: string | null | undefined, tags: string[] | null): number => {
  if (!tags || tags.length === 0 || !eventVibe) return 0;
  const ev = new Set(tokenize(eventVibe));
  let hits = 0;
  for (const tag of tags) if (ev.has(tag.toLowerCase())) hits += 1;
  return Math.min(1, hits / Math.min(3, tags.length));
};

export const scoreVenueFit = (event: EventRecord | null, venue: VenueRecord): FitBreakdown => {
  if (!event) return { total: 0, city: 0, capacity: 0, vibe: 0, budget: 0 };
  const cityScore = sameCity(event.city, venue.city);
  let capacityScore = 0;
  if (event.guest_count && (venue.capacity_max ?? 0) > 0) {
    const min = venue.capacity_min ?? 0;
    const max = venue.capacity_max ?? 0;
    if (event.guest_count >= min && event.guest_count <= max) capacityScore = 1;
    else if (event.guest_count <= max) capacityScore = 0.6;
    else capacityScore = 0;
  }
  const vibeScore = vibeOverlap(event.vibe, venue.vibe_tags);
  let budgetScore = 0;
  if (event.budget_cents && (venue.base_price_cents ?? 0) > 0) {
    const ratio = (venue.base_price_cents ?? 0) / event.budget_cents;
    if (ratio <= 0.5) budgetScore = 1;
    else if (ratio <= 1) budgetScore = 0.7;
    else if (ratio <= 1.25) budgetScore = 0.3;
    else budgetScore = 0;
  } else if (!event.budget_cents) {
    budgetScore = 0.5;
  }
  const total = Math.round((cityScore * 0.3 + capacityScore * 0.35 + vibeScore * 0.2 + budgetScore * 0.15) * 100);
  return { total, city: cityScore, capacity: capacityScore, vibe: vibeScore, budget: budgetScore };
};

export const scoreVendorFit = (event: EventRecord | null, vendor: VendorRecord): FitBreakdown => {
  if (!event) return { total: 0, city: 0, capacity: 0, vibe: 0, budget: 0 };
  const cityScore = sameCity(event.city, vendor.city);
  const vibeScore = vibeOverlap(event.vibe, vendor.vibe_tags);
  let budgetScore = 0;
  if (event.budget_cents && (vendor.base_price_cents ?? 0) > 0) {
    const ratio = (vendor.base_price_cents ?? 0) / event.budget_cents;
    if (ratio <= 0.2) budgetScore = 1;
    else if (ratio <= 0.4) budgetScore = 0.7;
    else if (ratio <= 0.6) budgetScore = 0.4;
    else budgetScore = 0.1;
  } else if (!event.budget_cents) {
    budgetScore = 0.5;
  }
  const total = Math.round((cityScore * 0.35 + vibeScore * 0.35 + budgetScore * 0.3) * 100);
  return { total, city: cityScore, capacity: 0, vibe: vibeScore, budget: budgetScore };
};

export const formatCents = (cents: number | null | undefined): string => {
  if (!cents) return "—";
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};
