import { z } from "zod";
import type { RecipientKind } from "./inquiry";

export const bookingStatusValues = ["pending","confirmed","in_progress","completed","cancelled","refunded"] as const;
export type BookingStatus = (typeof bookingStatusValues)[number];

export const bookingFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  event_id: z.string().uuid().optional().nullable(),
  inquiry_id: z.string().uuid().optional().nullable(),
  provider_id: z.string().uuid("Provider is required"),
  provider_kind: z.enum(["venue","pro","business"] as const),
  event_date: z.string().optional().or(z.literal("")),
  deposit: z.coerce.number().min(0).optional().or(z.literal("")),
  total: z.coerce.number().min(0).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export interface BookingRecord {
  id: string;
  event_id: string | null;
  inquiry_id: string | null;
  host_id: string;
  provider_id: string;
  provider_kind: RecipientKind;
  title: string;
  event_date: string | null;
  deposit_cents: number;
  total_cents: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
