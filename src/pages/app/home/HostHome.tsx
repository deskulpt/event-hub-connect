import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { BentoCard, BentoGrid, GradientOrb, StatTile } from "@/components/shell/Bento";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MessageSquare, Wallet, Clock, Sparkles, ArrowRight, Heart, Store, MapPin, Users, ChevronRight, Wand2 } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { listEvents } from "@/services/events";
import { countPendingRepliesForSender } from "@/services/inquiries";

export const HostHome = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: listEvents });
  const { data: pendingReplies = 0 } = useQuery({
    queryKey: ["inquiries-pending", user?.id],
    queryFn: () => countPendingRepliesForSender(user!.id),
    enabled: !!user,
  });

  const activeEvents = events.filter((e) => ["draft", "planning", "booked"].includes(e.status));
  const upcoming = events
    .filter((e) => e.event_date && new Date(e.event_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? ""));
  const next = upcoming[0];
  const daysToNext = next?.event_date ? differenceInCalendarDays(parseISO(next.event_date), new Date()) : null;

  const totalBudget = activeEvents.reduce((sum, e) => sum + (e.budget_cents ?? 0), 0);
  const budgetLabel = totalBudget > 0 ? `$${(totalBudget / 100).toLocaleString()}` : "—";

  return (
    <PageLayout>
      <PageHeader
        eyebrow="HOST WORKSPACE"
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your event planning command center — today's priorities and upcoming events."
        primaryCta={
          <Button size="sm" onClick={() => navigate("/app/events/new")}>
            <Sparkles className="h-4 w-4" /> Create event
          </Button>
        }
        secondaryCta={
          <Button size="sm" variant="outline" onClick={() => navigate("/app/marketplace")}>
            Discover
          </Button>
        }
      />

      {/* Hero bento */}
      <BentoGrid className="grid-cols-1 md:grid-cols-6">
        <BentoCard gradient="sunset" className="md:col-span-4 md:row-span-2 overflow-hidden p-7">
          <GradientOrb color="primary" className="-top-24 -left-16 h-80 w-80" />
          <GradientOrb color="accent" className="-bottom-20 right-0 h-72 w-72" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="chip"><Wand2 className="h-3 w-3" /> Vibely AI</span>
              <h2 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight md:text-3xl">
                {next ? (
                  <>
                    <span className="text-gradient">{daysToNext === 0 ? "Today" : daysToNext === 1 ? "Tomorrow" : `${daysToNext} days`}</span>
                    {" "}to {next.title}
                  </>
                ) : (
                  <>Turn an idea into a <span className="text-gradient">complete plan</span> in minutes.</>
                )}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {next
                  ? `Next: ${format(parseISO(next.event_date!), "EEE, MMM d")}${next.city ? ` · ${next.city}` : ""}${next.guest_count ? ` · ${next.guest_count} guests` : ""}.`
                  : "Brief, match, inquire, and book — all from one canvas."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="glass" onClick={() => navigate("/app/events/new")}>
                Create event <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("/app/marketplace")}>
                Browse marketplace
              </Button>
            </div>
          </div>
        </BentoCard>

        <StatTile
          className="md:col-span-2"
          label="Active events"
          value={activeEvents.length}
          hint="In planning or booked"
          icon={CalendarDays}
          onClick={() => navigate("/app/events")}
          gradient="sunset"
        />
        <StatTile
          className="md:col-span-2"
          label="Pending replies"
          value={pendingReplies}
          hint="Awaiting vendor response"
          icon={MessageSquare}
          onClick={() => navigate("/app/crm/inquiries")}
          gradient="ocean"
        />

        <StatTile
          className="md:col-span-3"
          label="Budget across active"
          value={budgetLabel}
          hint="Sum of active event budgets"
          icon={Wallet}
          onClick={() => navigate("/app/finance")}
          gradient="mint"
        />
        <StatTile
          className="md:col-span-3"
          label="Next event"
          value={daysToNext != null ? `${daysToNext}d` : "—"}
          hint={next?.title ?? "Days until nearest"}
          icon={Clock}
          onClick={() => navigate("/app/events")}
          gradient="aurora"
        />
      </BentoGrid>

      {/* Upcoming + AI rail */}
      <div className="grid gap-4 lg:grid-cols-3">
        <BentoCard className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Upcoming</p>
              <h3 className="font-display text-lg font-semibold">Your next events</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate("/app/events")}>
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No events scheduled. Create one to populate this stream.</p>
              <Button size="sm" className="mt-4" onClick={() => navigate("/app/events/new")}>Create event</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((e) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/app/events/${e.id}`)}
                  className="dense-row w-full text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-sunset/10 text-primary">
                    <span className="font-mono text-[9px] uppercase tracking-wider">
                      {e.event_date ? format(parseISO(e.event_date), "MMM") : "TBD"}
                    </span>
                    <span className="font-display text-sm font-semibold leading-none">
                      {e.event_date ? format(parseISO(e.event_date), "d") : "—"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{e.title}</span>
                      <Badge variant="outline" className="capitalize text-[10px]">{e.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {e.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.city}</span>}
                      {e.guest_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{e.guest_count}</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </BentoCard>

        <BentoCard gradient="aurora" className="overflow-hidden p-5">
          <GradientOrb color="primary" className="-top-10 -right-10 h-40 w-40" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <span className="chip"><Sparkles className="h-3 w-3 text-primary" /> AI nudges</span>
            </div>
            <h3 className="font-display text-lg font-semibold leading-tight">Your next best action</h3>
            <p className="text-sm text-muted-foreground">
              {pendingReplies > 0
                ? `${pendingReplies} vendor${pendingReplies > 1 ? "s have" : " has"} not replied yet — nudge them or expand your shortlist.`
                : "Create your first event to unlock matches, capacity intelligence, and AI outreach."}
            </p>
            <div className="space-y-2">
              <Button size="sm" className="w-full" onClick={() => navigate(pendingReplies > 0 ? "/app/crm/inquiries" : "/app/events/new")}>
                {pendingReplies > 0 ? "Review inquiries" : "Create event"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/marketplace")}>
                <Store className="h-3.5 w-3.5" /> Browse marketplace
              </Button>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Discovery row */}
      <div className="grid gap-4 md:grid-cols-2">
        <BentoCard interactive onClick={() => navigate("/app/marketplace")} className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="chip"><Store className="h-3 w-3" /> Discover</span>
              <h3 className="font-display text-lg font-semibold">Find your perfect match</h3>
              <p className="text-sm text-muted-foreground">Venues and pros ranked by Fit Score against your active brief.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </BentoCard>
        <BentoCard interactive onClick={() => navigate("/app/marketplace/saved")} className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="chip"><Heart className="h-3 w-3 text-primary" /> Shortlist</span>
              <h3 className="font-display text-lg font-semibold">Compare your saved options</h3>
              <p className="text-sm text-muted-foreground">Pin candidates and stack them side-by-side before you book.</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </BentoCard>
      </div>
    </PageLayout>
  );
};
