import { supabase } from "@/integrations/supabase/client";
import type { EventBriefInput, EventRecord } from "@/types/event";

const dollarsToCents = (dollars: number | null | undefined): number | null => {
  if (dollars === null || dollars === undefined || Number.isNaN(dollars) || (dollars as unknown) === "") return null;
  return Math.round(Number(dollars) * 100);
};

const briefToRow = (input: EventBriefInput) => ({
  title: input.title,
  event_type: input.event_type ?? null,
  event_date: input.event_date ? String(input.event_date) : null,
  city: input.city ? String(input.city) : null,
  guest_count: input.guest_count ? Number(input.guest_count) : null,
  budget_cents: dollarsToCents(input.budget as number | undefined),
  vibe: input.vibe ? String(input.vibe) : null,
  dietary_notes: input.dietary_notes ? String(input.dietary_notes) : null,
  accessibility_notes: input.accessibility_notes ? String(input.accessibility_notes) : null,
  status: input.status,
});

export const listEvents = async (): Promise<EventRecord[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRecord[];
};

export const getEvent = async (id: string): Promise<EventRecord | null> => {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as EventRecord | null) ?? null;
};

export const createEvent = async (input: EventBriefInput, ownerId: string): Promise<EventRecord> => {
  const { data, error } = await supabase
    .from("events")
    .insert({ ...briefToRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as EventRecord;
};

export const updateEvent = async (id: string, input: EventBriefInput): Promise<EventRecord> => {
  const { data, error } = await supabase.from("events").update(briefToRow(input)).eq("id", id).select("*").single();
  if (error) throw error;
  return data as EventRecord;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
};

export const countActiveEvents = async (ownerId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .in("status", ["draft", "planning", "booked"]);
  if (error) throw error;
  return count ?? 0;
};
