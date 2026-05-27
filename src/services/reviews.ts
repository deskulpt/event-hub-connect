import { supabase } from "@/integrations/supabase/client";

export interface ReviewRecord {
  id: string;
  author_id: string;
  subject_kind: "venue" | "vendor";
  subject_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export const listReviews = async (kind: "venue" | "vendor", id: string): Promise<ReviewRecord[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("subject_kind", kind)
    .eq("subject_id", id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewRecord[];
};

export const createReview = async (input: {
  subject_kind: "venue" | "vendor";
  subject_id: string;
  rating: number;
  title?: string;
  body?: string;
}, authorId: string): Promise<ReviewRecord> => {
  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...input, author_id: authorId })
    .select("*").single();
  if (error) throw error;
  return data as ReviewRecord;
};

export const averageRating = (rows: ReviewRecord[]): { avg: number; count: number } => {
  if (rows.length === 0) return { avg: 0, count: 0 };
  const sum = rows.reduce((a, r) => a + r.rating, 0);
  return { avg: sum / rows.length, count: rows.length };
};

export const getSubjectStats = async (kind: "venue" | "vendor", ids: string[]): Promise<Record<string, { avg: number; count: number }>> => {
  if (ids.length === 0) return {};
  const { data, error } = await supabase
    .from("reviews")
    .select("subject_id,rating")
    .eq("subject_kind", kind)
    .in("subject_id", ids);
  if (error) throw error;
  const map: Record<string, { sum: number; count: number }> = {};
  for (const r of data ?? []) {
    const key = r.subject_id as string;
    map[key] ??= { sum: 0, count: 0 };
    map[key].sum += r.rating as number;
    map[key].count += 1;
  }
  const out: Record<string, { avg: number; count: number }> = {};
  for (const [k, v] of Object.entries(map)) out[k] = { avg: v.sum / v.count, count: v.count };
  return out;
};
