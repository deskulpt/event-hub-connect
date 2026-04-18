import { z } from "zod";

export const taskStatusValues = ["todo","in_progress","done","blocked"] as const;
export type TaskStatus = (typeof taskStatusValues)[number];

export const taskFormSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  status: z.enum(taskStatusValues).default("todo"),
  event_id: z.string().uuid().optional().nullable(),
  booking_id: z.string().uuid().optional().nullable(),
});
export type TaskFormInput = z.infer<typeof taskFormSchema>;

export interface TaskRecord {
  id: string;
  owner_id: string;
  event_id: string | null;
  booking_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export const contactFormSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  role: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export interface ContactRecord {
  id: string;
  owner_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
