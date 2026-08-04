import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Gift, Sparkles, Users, Vote, ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { BentoCard, BentoGrid, GradientOrb } from "@/components/shell/Bento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { listProposals, listMyVotes } from "@/services/proposals";
import { listCircles, listMyCircleIds } from "@/services/circles";
import { listPerks } from "@/services/perks";

export const MemberHome = () => {
  const { profile, user } = useAuth();
  const { localityId, t } = usePreferences();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const proposalsQ = useQuery({
    queryKey: ["proposals", localityId],
    queryFn: () => listProposals(localityId),
  });
  const votesQ = useQuery({
    queryKey: ["my-votes", user?.id],
    queryFn: () => listMyVotes(user!.id),
    enabled: Boolean(user),
  });
  const circlesQ = useQuery({
    queryKey: ["circles", localityId],
    queryFn: () => listCircles(localityId),
  });
  const myCirclesQ = useQuery({
    queryKey: ["my-circles", user?.id],
    queryFn: () => listMyCircleIds(user!.id),
    enabled: Boolean(user),
  });
  const perksQ = useQuery({
    queryKey: ["perks", localityId],
    queryFn: () => listPerks(localityId),
  });

  const proposals = (proposalsQ.data ?? []).filter((p) =>
    ["voting", "threshold_met", "scheduled"].includes(p.status),
  );
  const myVotes = votesQ.data ?? [];
  const circles = (circlesQ.data ?? []).slice(0, 3);
  const perks = (perksQ.data ?? []).slice(0, 3);

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Community"
        title={`${t("home.greeting")}${firstName ? `, ${firstName}` : ""}`}
        subtitle="Vote on what happens next, join a circle, and claim local perks."
        primaryCta={
          <Button size="sm" className="rounded-full" onClick={() => navigate("/app/proposals")}>
            <Vote className="h-4 w-4" /> {t("home.vote")}
          </Button>
        }
      />

      <BentoGrid className="grid-cols-1 md:grid-cols-6">
        <BentoCard gradient="sunset" className="md:col-span-4 md:row-span-2 overflow-hidden p-7">
          <GradientOrb color="primary" className="-top-24 -left-16 h-80 w-80" />
          <div className="relative space-y-4">
            <span className="chip">
              <Sparkles className="h-3 w-3" /> This month
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {proposals[0] ? (
                <>
                  Vote on <span className="text-gradient">{proposals[0].title}</span>
                </>
              ) : (
                <>
                  Neighbours shape what happens <span className="text-gradient">next</span>
                </>
              )}
            </h2>
            {proposals[0] && (
              <div className="max-w-md space-y-2">
                <Progress
                  value={Math.min(
                    Math.round(
                      (proposals[0].vote_count / Math.max(proposals[0].vote_threshold, 1)) * 100,
                    ),
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground tab-num">
                  {proposals[0].vote_count}/{proposals[0].vote_threshold} votes
                  {myVotes.includes(proposals[0].id) ? " · you voted" : ""}
                </p>
              </div>
            )}
            <Button className="rounded-full" onClick={() => navigate("/app/proposals")}>
              Open proposals <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BentoCard>

        <BentoCard interactive className="md:col-span-2 p-5" onClick={() => navigate("/app/circles")}>
          <Users className="mb-2 h-5 w-5 text-primary" />
          <p className="font-display text-lg font-semibold">Circles</p>
          <p className="text-xs text-muted-foreground tab-num">
            {(myCirclesQ.data ?? []).length} joined · {circlesQ.data?.length ?? 0} nearby
          </p>
        </BentoCard>

        <BentoCard interactive className="md:col-span-2 p-5" onClick={() => navigate("/app/perks")}>
          <Gift className="mb-2 h-5 w-5 text-primary" />
          <p className="font-display text-lg font-semibold">Perks</p>
          <p className="text-xs text-muted-foreground tab-num">{perksQ.data?.length ?? 0} offers</p>
        </BentoCard>
      </BentoGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="font-display text-base font-semibold">Nearby circles</h3>
          {circles.map((circle) => (
            <button
              key={circle.id}
              type="button"
              className="flex w-full items-start justify-between rounded-2xl border border-border/60 bg-card/70 p-4 text-left"
              onClick={() => navigate(`/app/circles/${circle.id}`)}
            >
              <div>
                <p className="font-medium">{circle.name}</p>
                <p className="text-xs text-muted-foreground tab-num">{circle.member_count} members</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {circle.interest_tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
          {circles.length === 0 && (
            <p className="text-sm text-muted-foreground">No circles nearby yet.</p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-display text-base font-semibold">Local perks</h3>
          {perks.map((perk) => (
            <button
              key={perk.id}
              type="button"
              className="flex w-full items-start justify-between rounded-2xl border border-border/60 bg-card/70 p-4 text-left"
              onClick={() => navigate("/app/perks")}
            >
              <div>
                <p className="font-medium">{perk.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{perk.description}</p>
              </div>
              {perk.discount_label && (
                <Badge className="rounded-full shrink-0">{perk.discount_label}</Badge>
              )}
            </button>
          ))}
          {perks.length === 0 && (
            <p className="text-sm text-muted-foreground">No perks in your locality yet.</p>
          )}
        </section>
      </div>
    </PageLayout>
  );
};
