import { supabase } from "@/integrations/supabase/client";
import type { BookingFormInput, BookingRecord, BookingStatus } from "@/types/booking";
import type { InquiryRecord } from "@/types/inquiry";
import { updateInquiryStatus } from "@/services/inquiries";

const dollarsToCents = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const formToRow = (input: BookingFormInput) => ({
  title: input.title,
  event_id: input.event_id ?? null,
  inquiry_id: input.inquiry_id ?? null,
  provider_id: input.provider_id,
  provider_kind: input.provider_kind,
  event_date: input.event_date ? String(input.event_date) : null,
  deposit_cents: dollarsToCents(input.deposit),
  total_cents: dollarsToCents(input.total),
  notes: input.notes ? String(input.notes) : null,
});

export const listBookingsAsHost = async (userId: string): Promise<BookingRecord[]> => {
  const { data, error } = await supabase
    .from("bookings").select("*").eq("host_id", userId)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookingRecord[];
};

export const listBookingsAsProvider = async (userId: string): Promise<BookingRecord[]> => {
  const { data, error } = await supabase
    .from("bookings").select("*").eq("provider_id", userId)
    .order("event_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as BookingRecord[];
};

export const createBooking = async (input: BookingFormInput, hostId: string): Promise<BookingRecord> => {
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...formToRow(input), host_id: hostId, status: "pending" as BookingStatus })
    .select("*").single();
  if (error) throw error;
  return data as BookingRecord;
};

/** Provider accepts an inquiry and opens a pending booking (deposit optional). */
export const acceptInquiryAsBooking = async (
  inquiry: InquiryRecord,
  providerId: string,
  opts?: { deposit?: number; total?: number; notes?: string },
): Promise<BookingRecord> => {
  const booking = await createBooking(
    {
      title: inquiry.subject,
      event_id: inquiry.event_id,
      inquiry_id: inquiry.id,
      provider_id: providerId,
      provider_kind: inquiry.recipient_kind,
      event_date: inquiry.requested_date ?? "",
      deposit: opts?.deposit ?? 0,
      total: opts?.total ?? (inquiry.budget_max_cents != null ? inquiry.budget_max_cents / 100 : 0),
      notes: opts?.notes ?? inquiry.message ?? "",
    },
    inquiry.sender_id,
  );
  try {
    await updateInquiryStatus(inquiry.id, "replied", "Accepted — booking created");
  } catch (err) {
    await deleteBooking(booking.id);
    throw err;
  }
  return booking;
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<BookingRecord> => {
  const { data, error } = await supabase.from("bookings").update({ status }).eq("id", id).select("*").single();
  if (error) throw error;
  return data as BookingRecord;
};

/** Deposit lifecycle derived from booking status (no extra column required). */
export type DepositState = "none" | "unpaid" | "paid" | "refunded";

export const getDepositState = (b: Pick<BookingRecord, "deposit_cents" | "status">): DepositState => {
  if (!b.deposit_cents) return "none";
  if (b.status === "refunded") return "refunded";
  if (b.status === "pending" || b.status === "cancelled") return "unpaid";
  return "paid";
};

export const markDepositPaid = (id: string) => updateBookingStatus(id, "confirmed");
export const markDepositRefunded = (id: string) => updateBookingStatus(id, "refunded");

export const deleteBooking = async (id: string): Promise<void> => {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
};

export const countUpcomingBookingsForProvider = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", userId)
    .in("status", ["pending", "confirmed", "in_progress"])
    .or(`event_date.gte.${today},event_date.is.null`);
  if (error) throw error;
  return count ?? 0;
};
