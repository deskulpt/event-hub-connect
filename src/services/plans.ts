import { supabase } from "@/integrations/supabase/client";

export interface EventPlan {
  id: string;
  event_id: string;
  owner_id: string;
  summary: string | null;
  tasks: PlanTask[];
  timeline: PlanTimelineItem[];
  shortlist: PlanShortlistItem[];
  model: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanTask {
  title: string;
  due_offset_days: number;
  priority: "low" | "medium" | "high";
  owner: "host" | "venue" | "pro";
}
export interface PlanTimelineItem { time: string; title: string; detail?: string }
export interface PlanShortlistItem { category: string; reason: string }

export const getEventPlan = async (eventId: string): Promise<EventPlan | null> => {
  const { data, error } = await supabase
    .from("event_plans").select("*").eq("event_id", eventId).maybeSingle();
  if (error) throw error;
  return data as EventPlan | null;
};

export const generateEventPlan = async (eventId: string): Promise<EventPlan> => {
  const { data, error } = await supabase.functions.invoke("generate-plan", { body: { event_id: eventId } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.plan as EventPlan;
};
