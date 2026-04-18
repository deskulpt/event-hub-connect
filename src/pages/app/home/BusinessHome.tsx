import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Wallet, ShieldCheck, ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";

const kpis = [
  { label: "Occupancy", value: "0%", hint: "Confirmed vs capacity", icon: CalendarDays, to: "/app/calendar" },
  { label: "Outstanding quotes", value: "0", hint: "Awaiting acceptance", icon: FileText, to: "/app/crm/pipeline" },
  { label: "Payouts", value: "$0", hint: "Upcoming or pending", icon: Wallet, to: "/app/finance/payouts" },
  { label: "Compliance", value: "Action needed", hint: "Verification & insurance", icon: ShieldCheck, to: "/app/trust" },
];

export const BusinessHome = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <PageLayout
      rightRail={
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> AI suggestions
            </CardTitle>
            <CardDescription className="text-xs">Operational signal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">No matches yet. As inquiries arrive, we'll surface high-fit opportunities and scheduling conflicts here.</p>
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/crm/inquiries")}>
              Review inquiries <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      }
    >
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your operations, bookings, and revenue — at a glance."
        status="BUSINESS"
        primaryCta={<Button size="sm" onClick={() => navigate("/app/crm/bookings")}>Create booking</Button>}
        secondaryCta={<Button size="sm" variant="outline" onClick={() => navigate("/app/crm/pipeline")}>Review open quotes</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="cursor-pointer transition-all hover:shadow-md" onClick={() => navigate(k.to)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl font-semibold tabular-nums">{k.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Today's priorities</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Expiring quotes, overdue invoices, compliance alerts, and open disputes will land here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming bookings</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => navigate("/app/crm/bookings")}>View all<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Confirmed bookings will appear here with event name, host, space/service, and revenue.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Quotes pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Send-to-acceptance conversion will be tracked here as quotes flow through.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Revenue snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This month vs last month — chart populates with your first confirmed bookings.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Staff & resource alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Scheduling conflicts, unassigned roles, and low-capacity warnings will surface here.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
