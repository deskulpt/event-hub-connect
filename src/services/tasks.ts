import { supabase } from "@/integrations/supabase/client";
import type { TaskFormInput, TaskRecord, TaskStatus } from "@/types/crm";

const formToRow = (input: TaskFormInput) => ({
  title: input.title,
  description: input.description ? String(input.description) : null,
  due_date: input.due_date ? String(input.due_date) : null,
  status: input.status,
  event_id: input.event_id ?? null,
  booking_id: input.booking_id ?? null,
});

export const listTasks = async (userId: string): Promise<TaskRecord[]> => {
  const { data, error } = await supabase
    .from("tasks").select("*").eq("owner_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TaskRecord[];
};

export const createTask = async (input: TaskFormInput, ownerId: string): Promise<TaskRecord> => {
  const { data, error } = await supabase
    .from("tasks").insert({ ...formToRow(input), owner_id: ownerId })
    .select("*").single();
  if (error) throw error;
  return data as TaskRecord;
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw error;
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
};
