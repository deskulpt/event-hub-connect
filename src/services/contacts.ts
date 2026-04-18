import { supabase } from "@/integrations/supabase/client";
import type { ContactFormInput, ContactRecord } from "@/types/crm";

const formToRow = (input: ContactFormInput) => ({
  full_name: input.full_name,
  email: input.email ? String(input.email) : null,
  phone: input.phone ? String(input.phone) : null,
  company: input.company ? String(input.company) : null,
  role: input.role ? String(input.role) : null,
  notes: input.notes ? String(input.notes) : null,
});

export const listContacts = async (userId: string): Promise<ContactRecord[]> => {
  const { data, error } = await supabase
    .from("contacts").select("*").eq("owner_id", userId).order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContactRecord[];
};

export const createContact = async (input: ContactFormInput, ownerId: string): Promise<ContactRecord> => {
  const { data, error } = await supabase
    .from("contacts").insert({ ...formToRow(input), owner_id: ownerId })
    .select("*").single();
  if (error) throw error;
  return data as ContactRecord;
};

export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
};
