import { supabase } from "@/integrations/supabase/client";

export type VoiceCallOutcome =
  | "confirmed"
  | "unavailable"
  | "callback"
  | "voicemail"
  | "no_answer"
  | "wrong_number"
  | "other";

export type VoiceCallStatus = "queued" | "dialing" | "in_progress" | "completed" | "failed" | "cancelled";

export interface VoiceCallRecord {
  id: string;
  owner_id: string;
  event_id: string | null;
  inquiry_id: string | null;
  target_id: string | null;
  target_kind: string | null;
  target_name: string | null;
  phone: string | null;
  status: VoiceCallStatus;
  outcome: VoiceCallOutcome | null;
  summary: string | null;
  transcript: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export const listVoiceCalls = async (ownerId: string): Promise<VoiceCallRecord[]> => {
  const { data, error } = await supabase
    .from("voice_calls")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as VoiceCallRecord[];
};
