import { supabase } from "@/integrations/supabase/client";

export interface MessageRecord {
  id: string;
  inquiry_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const listMessages = async (inquiryId: string): Promise<MessageRecord[]> => {
  const { data, error } = await supabase
    .from("messages").select("*").eq("inquiry_id", inquiryId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MessageRecord[];
};

export const sendMessage = async (inquiryId: string, senderId: string, body: string): Promise<MessageRecord> => {
  const { data, error } = await supabase
    .from("messages").insert({ inquiry_id: inquiryId, sender_id: senderId, body })
    .select("*").single();
  if (error) throw error;
  return data as MessageRecord;
};
