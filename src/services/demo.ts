import { addDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const DEMO_TAG = "demo";
const DEMO_NOTE = "[demo]";
const day = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");

const demoEvents = [
  { title: "Tea & tales afternoon", event_type: "social", city: "Toronto", guest_count: 24, budget_cents: 60000, offset: 12, status: "planning" as const },
  { title: "Chair yoga in the park", event_type: "wellness", city: "North York", guest_count: 18, budget_cents: 30000, offset: 20, status: "booked" as const },
  { title: "Pottery workshop for beginners", event_type: "workshop", city: "Toronto", guest_count: 12, budget_cents: 90000, offset: 34, status: "draft" as const },
];

const demoEventIds = async (ownerId: string): Promise<string[]> => {
  const { data, error } = await supabase.from("events").select("id").eq("owner_id", ownerId).eq("external_source", DEMO_TAG);
  if (error) throw error;
  return (data ?? []).map((r) => r.id);
};

export const hasDemoData = async (ownerId: string): Promise<boolean> => (await demoEventIds(ownerId)).length > 0;

export const seedDemoData = async (ownerId: string): Promise<void> => {
  if (await hasDemoData(ownerId)) return;
  const { data: events, error } = await supabase
    .from("events")
    .insert(demoEvents.map(({ offset, ...e }) => ({ ...e, owner_id: ownerId, event_date: day(offset), external_source: DEMO_TAG })))
    .select("id,title,event_date");
  if (error) throw error;

  const { data: venues } = await supabase.from("venues").select("id,name").eq("published", true).limit(3);
  const list = events ?? [];
  const venueList = venues ?? [];

  if (venueList.length > 0) {
    const totals = [85000, 42000, 120000];
    const { error: bErr } = await supabase.from("bookings").insert(
      list.map((e, i) => ({
        host_id: ownerId,
        provider_id: venueList[i % venueList.length].id,
        provider_kind: "venue" as const,
        event_id: e.id,
        title: `${venueList[i % venueList.length].name} — ${e.title}`,
        event_date: e.event_date,
        total_cents: totals[i],
        deposit_cents: Math.round(totals[i] * 0.25),
        status: i === 1 ? ("confirmed" as const) : ("pending" as const),
      })),
    );
    if (bErr) throw bErr;
  }

  const { error: tErr } = await supabase.from("tasks").insert(
    list.flatMap((e, i) => [
      { owner_id: ownerId, event_id: e.id, title: "Confirm accessible entrance", status: "todo" as const, due_date: day(5 + i) },
      { owner_id: ownerId, event_id: e.id, title: "Send invites to circle", status: "done" as const, due_date: day(2 + i) },
    ]),
  );
  if (tErr) throw tErr;

  const { error: xErr } = await supabase.from("transactions").insert(
    list.map((e, i) => ({
      owner_id: ownerId,
      event_id: e.id,
      kind: "deposit" as const,
      status: "succeeded" as const,
      amount_cents: [21250, 10500, 30000][i],
      occurred_on: day(-i - 1),
      description: `Deposit for ${e.title}`,
      currency: "CAD",
    })),
  );
  if (xErr) throw xErr;

  const { error: cErr } = await supabase.from("contacts").insert([
    { owner_id: ownerId, full_name: "Margaret Chen", email: "margaret@example.com", company: "Leaside Seniors Circle", role: "Organizer", notes: DEMO_NOTE },
    { owner_id: ownerId, full_name: "Ravi Patel", email: "ravi@example.com", company: "Clay Studio", role: "Instructor", notes: DEMO_NOTE },
  ]);
  if (cErr) throw cErr;
};

export const clearDemoData = async (ownerId: string): Promise<void> => {
  const ids = await demoEventIds(ownerId);
  if (ids.length > 0) {
    for (const table of ["tasks", "transactions", "bookings"] as const) {
      const { error } = await supabase.from(table).delete().in("event_id", ids);
      if (error) throw error;
    }
    const { error } = await supabase.from("events").delete().in("id", ids);
    if (error) throw error;
  }
  const { error } = await supabase.from("contacts").delete().eq("owner_id", ownerId).eq("notes", DEMO_NOTE);
  if (error) throw error;
};
