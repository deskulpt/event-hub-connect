import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { BentoCard, BentoGrid, GradientOrb, StatTile } from "@/components/shell/Bento";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Wallet, ShieldCheck, ArrowRight, Sparkles, TrendingUp, Users, Building2 } from "lucide-react";
import { countNewLeadsForRecipient } from "@/services/inquiries";
import { countUpcomingBookingsForProvider } from "@/services/bookings";

export const BusinessHome = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const { data: newLeads = 0 } = useQuery({
    queryKey: ["leads-new", user?.id], queryFn: () => countNewLeadsForRecipient(user!.id), enabled: !!user,
  });
  const { data: upcomingJobs = 0 } = useQuery({
    queryKey: ["bookings-upcoming", user?.id], queryFn: () => countUpcomingBookingsForProvider(user!.id), enabled: !!user,
  });

  return (
    <PageLayout>
      <PageHeader
        eyebrow="BUSINESS WORKSPACE"
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your operations, bookings, and revenue — at a glance."
        primaryCta={<Button size="sm" onClick={() => navigate("/app/crm/bookings")}><CalendarDays className="h-4 w-4" /> Create booking</Button>}
        secondaryCta={<Button size="sm" variant="outline" onClick={() => navigate("/app/crm/pipeline")}>Review quotes</Button>}
      />

      <BentoGrid className="grid-cols-1 md:grid-cols-6">
        <BentoCard gradient="aurora" className="md:col-span-4 md:row-span-2 overflow-hidden p-7">
          <GradientOrb color="secondary" className="-top-20 -left-10 h-72 w-72" />
          <GradientOrb color="primary" className="-bottom-20 right-0 h-64 w-64" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="chip"><Building2 className="h-3 w-3" /> Operations</span>
              <h2 className="font-display text-[1.6rem] font-semibold leading-tight tracking-tight md:text-3xl">
                {newLeads > 0 ? (
                  <><span className="text-gradient-aurora">{newLeads}</span> open quote{newLeads > 1 ? "s" : ""} need attention</>
                ) : (
                  <>Run your venue like a <span className="text-gradient-aurora">modern operating system</span>.</>
                )}
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Centralize bookings, payouts, compliance, and team operations in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="glass" onClick={() => navigate("/app/crm/pipeline")}>
                Open pipeline <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("/app/marketplace/venues")}>
                Manage listings
              </Button>
            </div>
          </div>
        </BentoCard>

        <StatTile className="md:col-span-2" label="Open quotes" value={newLeads} hint="Inquiries awaiting reply" icon={FileText} onClick={() => navigate("/app/crm/inquiries")} gradient="ocean" />
        <StatTile className="md:col-span-2" label="Upcoming bookings" value={upcomingJobs} hint="Confirmed reservations" icon={CalendarDays} onClick={() => navigate("/app/crm/bookings")} gradient="mint" />
        <StatTile className="md:col-span-3" label="Payouts" value="$0" hint="Upcoming or pending" icon={Wallet} onClick={() => navigate("/app/finance/payouts")} gradient="sunset" />
        <StatTile className="md:col-span-3" label="Compliance" value="Action needed" hint="Verification & insurance" icon={ShieldCheck} onClick={() => navigate("/app/trust")} gradient="aurora" />
      </BentoGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <BentoCard className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Today</p>
              <h3 className="font-display text-lg font-semibold">Priorities</h3>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">Expiring quotes, overdue invoices, compliance alerts, and disputes will land here.</p>
          </div>
        </BentoCard>

        <BentoCard gradient="aurora" className="overflow-hidden p-5">
          <GradientOrb color="primary" className="-top-10 -right-10 h-40 w-40" />
          <div className="relative space-y-4">
            <span className="chip"><Sparkles className="h-3 w-3 text-primary" /> AI signal</span>
            <h3 className="font-display text-lg font-semibold">Operational copilot</h3>
            <p className="text-sm text-muted-foreground">As inquiries arrive, we'll surface high-fit opportunities and conflicts here.</p>
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/crm/inquiries")}>
              Review inquiries <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BentoCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BentoCard className="p-5">
          <div className="space-y-1.5">
            <span className="chip"><FileText className="h-3 w-3" /> Pipeline</span>
            <h3 className="font-display text-base font-semibold">Quotes pipeline</h3>
            <p className="text-xs text-muted-foreground">Send-to-acceptance conversion tracked here.</p>
          </div>
        </BentoCard>
        <BentoCard className="p-5">
          <div className="space-y-1.5">
            <span className="chip"><TrendingUp className="h-3 w-3" /> Trends</span>
            <h3 className="font-display text-base font-semibold">Revenue snapshot</h3>
            <p className="text-xs text-muted-foreground">This month vs last — chart populates with bookings.</p>
          </div>
        </BentoCard>
        <BentoCard className="p-5">
          <div className="space-y-1.5">
            <span className="chip"><Users className="h-3 w-3" /> Resources</span>
            <h3 className="font-display text-base font-semibold">Staff alerts</h3>
            <p className="text-xs text-muted-foreground">Conflicts, unassigned roles, and capacity warnings.</p>
          </div>
        </BentoCard>
      </div>
    </PageLayout>
  );
};
