import { supabase } from "@/integrations/supabase/client";

export interface EventInvite {
  id: string;
  event_id: string;
  owner_id: string;
  slug: string;
  headline: string | null;
  copy: string | null;
  image_url: string | null;
  source: string;
  rsvp_enabled: boolean;
  created_at: string;
}

export const generateInvite = async (eventId: string, opts?: { style_hint?: string; image_url?: string }): Promise<{ invite: EventInvite; share_text?: string }> => {
  const { data, error } = await supabase.functions.invoke("generate-invite", {
    body: { event_id: eventId, ...opts },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { invite: EventInvite; share_text?: string };
};

export const listInvitesForEvent = async (eventId: string): Promise<EventInvite[]> => {
  const { data, error } = await supabase
    .from("event_invites").select("*").eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventInvite[];
};

export type PublicInvite = Omit<EventInvite, "owner_id" | "source">;

export const getInviteBySlug = async (slug: string): Promise<PublicInvite | null> => {
  const { data, error } = await supabase.rpc("get_invite_by_slug", { _slug: slug });
  if (error) throw error;
  return ((data ?? [])[0] as PublicInvite | undefined) ?? null;
};


export const uploadInviteImage = async (userId: string, eventId: string, file: File): Promise<string> => {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/${eventId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("invites").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("invites")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signErr) throw signErr;
  return data.signedUrl;
};

export const startAiCall = async (input: {
  event_id?: string;
  inquiry_id?: string;
  target_kind?: "venue" | "vendor";
  target_id?: string;
  target_name?: string;
  phone?: string;
}): Promise<{ call: { id: string; status: string; outcome: string | null; summary: string | null } }> => {
  const { data, error } = await supabase.functions.invoke("ai-call", { body: input });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { call: { id: string; status: string; outcome: string | null; summary: string | null } };
};
