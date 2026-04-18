import { z } from "zod";

export const EVENT_STATUSES = ["draft", "planning", "booked", "completed", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_TYPES = [
  "wedding",
  "birthday",
  "corporate",
  "anniversary",
  "fundraiser",
  "conference",
  "social",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface EventRecord {
  id: string;
  owner_id: string;
  title: string;
  event_type: string | null;
  event_date: string | null;
  city: string | null;
  guest_count: number | null;
  budget_cents: number | null;
  vibe: string | null;
  dietary_notes: string | null;
  accessibility_notes: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export const eventBriefSchema = z.object({
  title: z.string().trim().min(2, "Give your event a name").max(120),
  event_type: z.enum(EVENT_TYPES).optional(),
  event_date: z.string().optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  guest_count: z.coerce.number().int().min(1).max(100000).optional().or(z.literal("" as unknown as number)),
  budget: z.coerce.number().min(0).max(10_000_000).optional().or(z.literal("" as unknown as number)),
  vibe: z.string().trim().max(280).optional().or(z.literal("")),
  dietary_notes: z.string().trim().max(500).optional().or(z.literal("")),
  accessibility_notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(EVENT_STATUSES).default("draft"),
});

export type EventBriefInput = z.infer<typeof eventBriefSchema>;
