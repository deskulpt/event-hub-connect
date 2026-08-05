import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Sparkles, Users, Vote, ArrowRight, Volume2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { BentoCard, BentoGrid, GradientOrb } from "@/components/shell/Bento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { listProposals, listMyVotes } from "@/services/proposals";
import { joinCircle, listCircles, listMyCircleIds } from "@/services/circles";
import { listPerks } from "@/services/perks";

export const MemberHome = () => {
  const { profile, user } = useAuth();
  const { localityId, t, accessibility } = usePreferences();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [widen, setWiden] = useState(false);
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const effectiveLocality = widen ? null : localityId;

  const proposalsQ = useQuery({
    queryKey: ["proposals", effectiveLocality],
    queryFn: () => listProposals(effectiveLocality),
  });
  const votesQ = useQuery({
    queryKey: ["my-votes", user?.id],
    queryFn: () => listMyVotes(user!.id),
    enabled: Boolean(user),
  });
  const circlesQ = useQuery({
    queryKey: ["circles", effectiveLocality],
    queryFn: () => listCircles(effectiveLocality),
  });
  const myCirclesQ = useQuery({
    queryKey: ["my-circles", user?.id],
    queryFn: () => listMyCircleIds(user!.id),
    enabled: Boolean(user),
  });
  const perksQ = useQuery({
    queryKey: ["perks", effectiveLocality],
    queryFn: () => listPerks(effectiveLocality),
  });

  const join = useMutation({
    mutationFn: (circleId: string) => joinCircle(circleId, user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-circles"] });
      void queryClient.invalidateQueries({ queryKey: ["circles"] });
      toast.success(t("circles.join"));
    },
    onError: () => toast.error("Could not join circle"),
  });

  const proposals = (proposalsQ.data ?? []).filter((p) =>
    ["voting", "threshold_met", "scheduled"].includes(p.status),
  );
  const myVotes = votesQ.data ?? [];
  const myIds = myCirclesQ.data ?? [];
  const circles = (circlesQ.data ?? []).slice(0, 3);
  const perks = (perksQ.data ?? []).slice(0, 3);

  const isSparse = useMemo(
    () =>
      !proposalsQ.isLoading &&
      !circlesQ.isLoading &&
      proposals.length === 0 &&
      circles.length === 0,
    [proposalsQ.isLoading, circlesQ.isLoading, proposals.length, circles.length],
  );

  const readAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.message("Read aloud is not available on this device");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = document.documentElement.lang || "en";
    window.speechSynthesis.speak(utterance);
  };

  const bringFriend = async () => {
    const url = window.location.origin;
    const text = "Join me on Vibely — local activities with neighbours nearby.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Vibely", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Invite link copied — send it on WhatsApp or SMS");
    } catch {
      toast.message("Share from your browser menu, or copy the site address");
    }
  };

  const primaryProposal = proposals[0];
  const primaryCircle = circles.find((c) => !myIds.includes(c.id)) ?? circles[0];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Community"
        title={`${t("home.greeting")}${firstName ? `, ${firstName}` : ""}`}
        subtitle={t("home.subtitle")}
        primaryCta={
          <Button size="sm" className="rounded-full min-h-11" onClick={() => navigate("/app/proposals")}>
            <Vote className="h-4 w-4" /> {t("home.vote")}
          </Button>
        }
      />

      {isSparse && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="font-display text-base font-semibold">{t("home.emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("home.emptyBody")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!widen && (
              <Button className="rounded-full min-h-11" onClick={() => setWiden(true)}>
                {t("home.widenArea")}
              </Button>
            )}
            <Button variant="outline" className="rounded-full min-h-11" onClick={() => navigate("/app/circles")}>
              {t("nav.circles")}
            </Button>
          </div>
        </div>
      )}

      {widen && (
        <Badge variant="secondary" className="w-fit rounded-full">
          {t("home.widenArea")} · showing all localities
        </Badge>
      )}

      <div className="flex flex-wrap gap-2">
        {primaryCircle && user && !myIds.includes(primaryCircle.id) && (
          <Button
            className="rounded-full min-h-11"
            disabled={join.isPending}
            onClick={() => join.mutate(primaryCircle.id)}
          >
            <Users className="h-4 w-4" /> {t("home.join")}: {primaryCircle.name}
          </Button>
        )}
        {(accessibility.readAloud || primaryProposal) && (
          <Button
            variant="outline"
            className="rounded-full min-h-11"
            onClick={() =>
              readAloud(
                primaryProposal
                  ? `${primaryProposal.title}. ${primaryProposal.summary ?? ""}`
                  : t("home.greeting"),
              )
            }
          >
            <Volume2 className="h-4 w-4" /> {t("home.readAloud")}
          </Button>
        )}
        <Button variant="outline" className="rounded-full min-h-11" onClick={() => void bringFriend()}>
          <UserPlus className="h-4 w-4" /> {t("home.bringFriend")}
        </Button>
      </div>

      <BentoGrid className="grid-cols-1 md:grid-cols-6">
        <BentoCard gradient="sunset" className="md:col-span-4 md:row-span-2 overflow-hidden p-7">
          <GradientOrb color="primary" className="-top-24 -left-16 h-80 w-80" />
          <div className="relative space-y-4">
            <span className="chip">
              <Sparkles className="h-3 w-3" /> {t("home.thisMonth")}
            </span>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {primaryProposal ? (
                <>
                  Vote on <span className="text-gradient">{primaryProposal.title}</span>
                </>
              ) : (
                <>
                  Neighbours shape what happens <span className="text-gradient">next</span>
                </>
              )}
            </h2>
            {primaryProposal && (
              <div className="max-w-md space-y-2">
                <Progress
                  value={Math.min(
                    Math.round(
                      (primaryProposal.vote_count / Math.max(primaryProposal.vote_threshold, 1)) * 100,
                    ),
                    100,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground tab-num">
                  {primaryProposal.vote_count}/{primaryProposal.vote_threshold} votes
                  {myVotes.includes(primaryProposal.id) ? " · you voted" : ""}
                </p>
              </div>
            )}
            <Button className="rounded-full min-h-11" onClick={() => navigate("/app/proposals")}>
              {t("home.openProposals")} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BentoCard>

        <BentoCard interactive className="md:col-span-2 p-5" onClick={() => navigate("/app/circles")}>
          <Users className="mb-2 h-5 w-5 text-primary" />
          <p className="font-display text-lg font-semibold">{t("nav.circles")}</p>
          <p className="text-xs text-muted-foreground tab-num">
            {(myCirclesQ.data ?? []).length} joined · {circlesQ.data?.length ?? 0} nearby
          </p>
        </BentoCard>

        <BentoCard interactive className="md:col-span-2 p-5" onClick={() => navigate("/app/perks")}>
          <Gift className="mb-2 h-5 w-5 text-primary" />
          <p className="font-display text-lg font-semibold">{t("nav.perks")}</p>
          <p className="text-xs text-muted-foreground tab-num">{perksQ.data?.length ?? 0} offers</p>
        </BentoCard>
      </BentoGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3">
          <h3 className="font-display text-base font-semibold">{t("home.nearbyCircles")}</h3>
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 p-4"
            >
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => navigate(`/app/circles/${circle.id}`)}
              >
                <p className="font-medium">{circle.name}</p>
                <p className="text-xs text-muted-foreground tab-num">{circle.member_count} members</p>
              </button>
              {user && !myIds.includes(circle.id) && (
                <Button
                  size="sm"
                  className="rounded-full min-h-10"
                  disabled={join.isPending}
                  onClick={() => join.mutate(circle.id)}
                >
                  {t("home.join")}
                </Button>
              )}
            </div>
          ))}
          {circles.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("home.noCircles")}</p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="font-display text-base font-semibold">{t("home.localPerks")}</h3>
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
            <p className="text-sm text-muted-foreground">{t("home.noPerks")}</p>
          )}
        </section>
      </div>
    </PageLayout>
  );
};
