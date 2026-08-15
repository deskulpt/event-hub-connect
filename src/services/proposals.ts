import { supabase } from "@/integrations/supabase/client";
import type { ActivityProposal } from "@/types/community";

export const listProposals = async (localityId?: string | null): Promise<ActivityProposal[]> => {
  let query = supabase.from("generated_activity_proposals").select("*");
  if (localityId) query = query.eq("locality_id", localityId);
  const { data, error } = await query
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as ActivityProposal[];
};

export const listMyVotes = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("proposal_votes")
    .select("proposal_id")
    .eq("user_id", userId)
    .gt("vote", 0);
  if (error) throw error;
  return (data ?? []).map((row) => row.proposal_id);
};

export const castVote = async (proposalId: string, userId: string) => {
  const { error } = await supabase
    .from("proposal_votes")
    .upsert({ proposal_id: proposalId, user_id: userId, vote: 1 }, { onConflict: "proposal_id,user_id" });
  if (error) throw error;
};

export const withdrawVote = async (proposalId: string, userId: string) => {
  const { error } = await supabase
    .from("proposal_votes")
    .delete()
    .eq("proposal_id", proposalId)
    .eq("user_id", userId);
  if (error) throw error;
};

export const claimProposal = async (proposalId: string, userId: string) => {
  const { error } = await supabase
    .from("generated_activity_proposals")
    .update({ claimed_by: userId })
    .eq("id", proposalId);
  if (error) throw error;
};

export const claimAndPublishProposal = async (
  proposal: ActivityProposal,
  userId: string,
): Promise<string> => {
  await claimProposal(proposal.id, userId);
  try {
    return await publishProposalAsActivity(proposal, userId);
  } catch (err) {
    await supabase
      .from("generated_activity_proposals")
      .update({ claimed_by: null })
      .eq("id", proposal.id)
      .eq("claimed_by", userId);
    throw err;
  }
};

export const generateProposals = async (localityId: string, slateSize?: number) => {
  const { data, error } = await supabase.functions.invoke("generate-proposals", {
    body: { localityId, slateSize },
  });
  if (error) throw error;
  return data as { created: number; proposals: ActivityProposal[] };
};

export const publishProposalAsActivity = async (
  proposal: ActivityProposal,
  ownerId: string,
): Promise<string> => {
  const { data, error } = await supabase
    .from("events")
    .insert({
      owner_id: ownerId,
      title: proposal.title,
      event_type: proposal.category,
      event_date: proposal.suggested_date,
      status: "planning",
      origin: "proposal",
      proposal_id: proposal.id,
      circle_id: proposal.circle_id,
      locality_id: proposal.locality_id,
      language: proposal.language,
      indoor_outdoor: proposal.indoor_outdoor,
      accessibility_attributes: proposal.accessibility_attributes,
      vibe: proposal.summary,
    })
    .select("id")
    .single();
  if (error) throw error;
  const { error: linkErr } = await supabase
    .from("generated_activity_proposals")
    .update({ status: "published", event_id: data.id })
    .eq("id", proposal.id);
  if (linkErr) {
    // Best-effort rollback so we don't leave an orphan activity without proposal link
    await supabase.from("events").delete().eq("id", data.id);
    throw linkErr;
  }
  return data.id;
};
