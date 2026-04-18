import { z } from "zod";

export const inquiryStatusValues = ["new", "sent", "replied", "declined", "expired"] as const;
export type InquiryStatus = (typeof inquiryStatusValues)[number];

export const recipientKindValues = ["venue", "pro", "business"] as const;
export type RecipientKind = (typeof recipientKindValues)[number];

export const inquiryFormSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required").max(120),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  recipient_id: z.string().uuid("Recipient is required"),
  recipient_kind: z.enum(recipientKindValues),
  event_id: z.string().uuid().optional().nullable(),
  requested_date: z.string().optional().or(z.literal("")),
  guest_count: z.coerce.number().int().min(1).optional().or(z.literal("")),
  budget_min: z.coerce.number().min(0).optional().or(z.literal("")),
  budget_max: z.coerce.number().min(0).optional().or(z.literal("")),
});

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;

export interface InquiryRecord {
  id: string;
  event_id: string | null;
  sender_id: string;
  recipient_id: string;
  recipient_kind: RecipientKind;
  subject: string;
  message: string | null;
  requested_date: string | null;
  guest_count: number | null;
  budget_min_cents: number | null;
  budget_max_cents: number | null;
  status: InquiryStatus;
  reply_note: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}
