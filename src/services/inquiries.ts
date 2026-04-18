import { supabase } from "@/integrations/supabase/client";
import type { InquiryFormInput, InquiryRecord, InquiryStatus } from "@/types/inquiry";

const dollarsToCents = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

const formToRow = (input: InquiryFormInput) => ({
  subject: input.subject,
  message: input.message ? String(input.message) : null,
  recipient_id: input.recipient_id,
  recipient_kind: input.recipient_kind,
  event_id: input.event_id ?? null,
  requested_date: input.requested_date ? String(input.requested_date) : null,
  guest_count: input.guest_count ? Number(input.guest_count) : null,
  budget_min_cents: dollarsToCents(input.budget_min),
  budget_max_cents: dollarsToCents(input.budget_max),
});

export const listInquiriesSent = async (userId: string): Promise<InquiryRecord[]> => {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InquiryRecord[];
};

export const listInquiriesReceived = async (userId: string): Promise<InquiryRecord[]> => {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InquiryRecord[];
};

export const createInquiry = async (input: InquiryFormInput, senderId: string): Promise<InquiryRecord> => {
  const { data, error } = await supabase
    .from("inquiries")
    .insert({ ...formToRow(input), sender_id: senderId, status: "sent" as InquiryStatus })
    .select("*")
    .single();
  if (error) throw error;
  return data as InquiryRecord;
};

export const updateInquiryStatus = async (
  id: string,
  status: InquiryStatus,
  replyNote?: string,
): Promise<InquiryRecord> => {
  const patch: { status: InquiryStatus; reply_note?: string; replied_at?: string } = { status };
  if (replyNote !== undefined) patch.reply_note = replyNote;
  if (status === "replied") patch.replied_at = new Date().toISOString();
  const { data, error } = await supabase.from("inquiries").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as InquiryRecord;
};

export const deleteInquiry = async (id: string): Promise<void> => {
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw error;
};

export const countPendingRepliesForSender = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .in("status", ["sent", "new"]);
  if (error) throw error;
  return count ?? 0;
};

export const countNewLeadsForRecipient = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .in("status", ["new", "sent"]);
  if (error) throw error;
  return count ?? 0;
};
