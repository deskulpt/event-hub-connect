import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { BentoCard, BentoGrid, GradientOrb, StatTile } from "@/components/shell/Bento";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarCheck, Wallet, ShieldCheck, ArrowRight, Sparkles, FileText, TrendingUp, Briefcase } from "lucide-react";
import { countNewLeadsForRecipient } from "@/services/inquiries";
import { countUpcomingBookingsForProvider } from "@/services/bookings";

export const ProHome = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const { data: newLeads = 0 } = useQuery({
    queryKey: ["leads-new", user?.id], queryFn: () => countNewLeadsForRecipient(user!.id), enabled: !!user,
  });
  const { data: upcomingJobs = 0 } = useQuery({
    queryKey: ["bookings-upcoming", user?.id], queryFn: () => countUpcomingBookingsForProvider(user!.id), enabled: !!user,
  });

  const hasLeads = newLeads > 0;

  return (
    <PageLayout>
      <PageHeader
        eyebrow="PRO WORKSPACE"
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your leads, bookings, and earnings — all in one place."
        primaryCta={
          hasLeads ? (
            <Button size="sm" onClick={() => navigate("/app/crm/inquiries")}><MessageSquare className="h-4 w-4" /> Respond to leads</Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/app/calendar/availability")}><CalendarCheck className="h-4 w-4" /> Update availability</Button>
          )
        }
        secondaryCta={<Button size="sm" variant="outline" onClick={() => navigate("/app/calendar")}>View calendar</Button>}
      />

      <BentoGrid className="grid-cols-1 md:grid-cols-6">
        <BentoCard gradient="sunset" className="md:col-span-4 md:row-span-2 overflow-hidden p-7">
          <GradientOrb color="primary" className="-top-20 -left-10 h-72 w-72" />
          <GradientOrb color="accent" className="-bottom-20 right-0 h-64 w-64" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="chip"><Briefcase className="h-3 w-3" /> Pipeline</span>
              <h2 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight md:text-3xl">
                {hasLeads ? (
                  <>
                    <span className="text-gradient">{newLeads}</span> new lead{newLeads > 1 ? "s" : ""} waiting
                  </>
                ) : (
                  <>Stay <span className="text-gradient">bookable</span> and <span className="text-gradient">discoverable</span>.</>
                )}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {hasLeads
                  ? "Respond fast to win more jobs — average reply time under 4 hours doubles conversion."
                  : "Update availability and add insurance to surface higher in Fit Score rankings."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="glass" onClick={() => navigate(hasLeads ? "/app/crm/inquiries" : "/app/calendar/availability")}>
                {hasLeads ? "Open inquiries" : "Set availability"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("/app/marketplace/pros")}>
                Edit listings
              </Button>
            </div>
          </div>
        </BentoCard>

        <StatTile className="md:col-span-2" label="New leads" value={newLeads} hint="Unread or unresponded" icon={MessageSquare} onClick={() => navigate("/app/crm/inquiries")} gradient="ocean" />
        <StatTile className="md:col-span-2" label="Upcoming jobs" value={upcomingJobs} hint="Confirmed in next 30 days" icon={CalendarCheck} onClick={() => navigate("/app/crm/bookings")} gradient="mint" />
        <StatTile className="md:col-span-3" label="This month's earnings" value="$0" hint="Confirmed revenue" icon={Wallet} onClick={() => navigate("/app/finance")} gradient="sunset" />
        <StatTile className="md:col-span-3" label="Insurance status" value="Missing" hint="Add to unlock more leads" icon={ShieldCheck} onClick={() => navigate("/app/trust/insurance")} gradient="aurora" />
      </BentoGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <BentoCard className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pipeline</p>
              <h3 className="font-display text-lg font-semibold">New leads</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate("/app/crm/inquiries")}>View all <ArrowRight className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">No new leads right now. Quote, decline, and message actions will appear here.</p>
          </div>
        </BentoCard>

        <BentoCard gradient="aurora" className="overflow-hidden p-5">
          <GradientOrb color="primary" className="-top-10 -right-10 h-40 w-40" />
          <div className="relative space-y-4">
            <span className="chip"><Sparkles className="h-3 w-3 text-primary" /> Trust nudges</span>
            <h3 className="font-display text-lg font-semibold">Boost your visibility</h3>
            <p className="text-sm text-muted-foreground">Verified Pros get up to 2.4× more high-intent inquiries.</p>
            <div className="space-y-2">
              <Button size="sm" className="w-full" onClick={() => navigate("/app/trust/insurance")}>
                Get covered <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/trust/verification")}>
                Verify identity
              </Button>
            </div>
          </div>
        </BentoCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BentoCard className="p-5">
          <div className="space-y-1.5">
            <span className="chip"><FileText className="h-3 w-3" /> Quotes</span>
            <h3 className="font-display text-lg font-semibold">Open quotes</h3>
            <p className="text-sm text-muted-foreground">Sent quotes awaiting acceptance will show their status and value here.</p>
          </div>
        </BentoCard>
        <BentoCard className="p-5">
          <div className="space-y-1.5">
            <span className="chip"><TrendingUp className="h-3 w-3" /> Trends</span>
            <h3 className="font-display text-lg font-semibold">Earnings snapshot</h3>
            <p className="text-sm text-muted-foreground">Last 30 days vs previous — chart appears once you have confirmed revenue.</p>
          </div>
        </BentoCard>
      </div>
    </PageLayout>
  );
};
