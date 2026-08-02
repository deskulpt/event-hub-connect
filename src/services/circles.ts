import { supabase } from "@/integrations/supabase/client";
import type { Circle } from "@/types/community";

export const listCircles = async (localityId?: string | null): Promise<Circle[]> => {
  let query = supabase.from("circles").select("*").eq("published", true);
  if (localityId) query = query.eq("locality_id", localityId);
  const { data, error } = await query.order("member_count", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Circle[];
};

export const listMyCircleIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.circle_id);
};

export const joinCircle = async (circleId: string, userId: string) => {
  const { error } = await supabase.from("circle_members").insert({ circle_id: circleId, user_id: userId });
  if (error) throw error;
  await bumpMemberCount(circleId);
};

export const leaveCircle = async (circleId: string, userId: string) => {
  const { error } = await supabase
    .from("circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", userId);
  if (error) throw error;
  await bumpMemberCount(circleId);
};

const bumpMemberCount = async (circleId: string) => {
  const { count } = await supabase
    .from("circle_members")
    .select("id", { count: "exact", head: true })
    .eq("circle_id", circleId);
  await supabase.from("circles").update({ member_count: count ?? 0 }).eq("id", circleId);
};

export interface CircleInput {
  name: string;
  description?: string;
  interest_tags: string[];
  language: string;
  locality_id?: string | null;
}

export const createCircle = async (input: CircleInput, ownerId: string): Promise<Circle> => {
  const { data, error } = await supabase
    .from("circles")
    .insert({ ...input, owner_id: ownerId, member_count: 1 })
    .select()
    .single();
  if (error) throw error;
  await supabase
    .from("circle_members")
    .insert({ circle_id: data.id, user_id: ownerId, is_organizer: true });
  return data as Circle;
};
