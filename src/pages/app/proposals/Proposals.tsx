import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Vote, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import {
  castVote, claimProposal, listMyVotes, listProposals, publishProposalAsActivity, withdrawVote,
} from "@/services/proposals";
import type { ActivityProposal, ProposalStatus } from "@/types/community";

const statusLabel: Record<ProposalStatus, string> = {
  draft: "Draft",
  voting: "Voting open",
  threshold_met: "Enough votes",
  scheduled: "Scheduled",
  published: "Happening",
  expired: "Expired",
  rejected: "Not going ahead",
};

export const Proposals = () => {
  const { user } = useAuth();
  const { localityId, t } = usePreferences();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const proposalsQuery = useQuery({
    queryKey: ["proposals", localityId],
    queryFn: () => listProposals(localityId),
  });
  const votesQuery = useQuery({
    queryKey: ["my-votes", user?.id],
    queryFn: () => listMyVotes(user!.id),
    enabled: Boolean(user),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["proposals"] });
    void queryClient.invalidateQueries({ queryKey: ["my-votes"] });
  };

  const vote = useMutation({
    mutationFn: async ({ id, voted }: { id: string; voted: boolean }) =>
      voted ? withdrawVote(id, user!.id) : castVote(id, user!.id),
    onSuccess: invalidate,
    onError: () => toast.error("Could not record your vote. Please try again."),
  });

  const claim = useMutation({
    mutationFn: async (proposal: ActivityProposal) => {
      await claimProposal(proposal.id, user!.id);
      return publishProposalAsActivity(proposal, user!.id);
    },
    onSuccess: (eventId) => {
      invalidate();
      toast.success("You are hosting this activity");
      navigate(`/app/events/${eventId}`);
    },
    onError: () => toast.error("Could not claim this proposal. Please try again."),
  });

  const proposals = proposalsQuery.data ?? [];
  const myVotes = votesQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Next month"
        title={t("proposals.title")}
        subtitle={t("proposals.subtitle")}
      />

      {proposalsQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {proposalsQuery.isError && (
        <EmptyState
          title="We could not load proposals"
          description="Something went wrong while fetching this month's slate."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => proposalsQuery.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      )}

      {proposalsQuery.isSuccess && proposals.length === 0 && (
        <EmptyState
          icon={<Sparkles className="h-6 w-6 text-primary-foreground" />}
          title="No proposals yet this month"
          description="Once enough neighbours join your area, we generate a fresh slate of activity ideas to vote on."
          action={
            <Button className="rounded-full" onClick={() => navigate("/app/circles")}>
              Browse circles
            </Button>
          }
        />
      )}

      {proposals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {proposals.map((proposal) => {
            const voted = myVotes.includes(proposal.id);
            const remaining = Math.max(proposal.vote_threshold - proposal.vote_count, 0);
            const percent = Math.min(
              Math.round((proposal.vote_count / Math.max(proposal.vote_threshold, 1)) * 100),
              100,
            );
            const canClaim =
              proposal.status === "threshold_met" && !proposal.event_id && Boolean(user);
            return (
              <Card key={proposal.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{proposal.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">
                      {statusLabel[proposal.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {proposal.suggested_date ?? "Date to be confirmed"}
                    {proposal.suggested_time ? ` · ${proposal.suggested_time}` : ""}
                    {proposal.indoor_outdoor ? ` · ${proposal.indoor_outdoor}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{proposal.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proposal.accessibility_attributes.slice(0, 3).map((attribute) => (
                      <Badge key={attribute} variant="secondary" className="rounded-full text-[10px]">
                        {attribute}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Progress value={percent} className="h-2" />
                    <p className="text-xs text-muted-foreground tab-num">
                      {proposal.vote_count} votes ·{" "}
                      {remaining === 0 ? "Threshold reached" : `${remaining} ${t("proposals.threshold")}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={voted ? "outline" : "default"}
                      className="flex-1 rounded-full"
                      disabled={!user || vote.isPending}
                      onClick={() => vote.mutate({ id: proposal.id, voted })}
                    >
                      <Vote className="h-4 w-4" />
                      {voted ? t("proposals.voted") : t("proposals.vote")}
                    </Button>
                    {canClaim && (
                      <Button
                        variant="secondary"
                        className="rounded-full"
                        disabled={claim.isPending}
                        onClick={() => claim.mutate(proposal)}
                      >
                        Host this
                      </Button>
                    )}
                    {proposal.event_id && (
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate(`/app/events/${proposal.event_id}`)}
                      >
                        View activity
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};
