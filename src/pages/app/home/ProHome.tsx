import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarCheck, Wallet, ShieldCheck, ArrowRight, Sparkles, FileText, TrendingUp } from "lucide-react";

const kpis = [
  { label: "New leads", value: "0", hint: "Unread or unresponded", icon: MessageSquare, to: "/app/crm/inquiries" },
  { label: "Upcoming jobs", value: "0", hint: "Confirmed in next 30 days", icon: CalendarCheck, to: "/app/crm/bookings" },
  { label: "This month's earnings", value: "$0", hint: "Confirmed revenue", icon: Wallet, to: "/app/finance/overview" },
  { label: "Insurance status", value: "Missing", hint: "Add to unlock more leads", icon: ShieldCheck, to: "/app/trust/insurance" },
];

export const ProHome = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const hasLeads = false; // wire to real data later

  return (
    <PageLayout
      rightRail={
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Trust nudges
            </CardTitle>
            <CardDescription className="text-xs">Boost your visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Add insurance and verify your identity to unlock high-intent leads.</p>
            <Button size="sm" className="w-full" onClick={() => navigate("/app/trust/insurance")}>
              Get covered <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/trust/verification")}>
              Verify identity
            </Button>
          </CardContent>
        </Card>
      }
    >
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your leads, bookings, and earnings — all in one place."
        status="PRO"
        primaryCta={
          hasLeads ? (
            <Button size="sm" onClick={() => navigate("/app/crm/inquiries")}>Respond to leads</Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/app/calendar/availability")}>Update availability</Button>
          )
        }
        secondaryCta={<Button size="sm" variant="outline" onClick={() => navigate("/app/calendar")}>View calendar</Button>}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">New leads</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => navigate("/app/crm/inquiries")}>View all<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No new leads right now. When hosts inquire, you'll see quote, decline, and message actions here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming jobs</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Confirmed bookings will appear here with date, host, location, service type, and payment status.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Open quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sent quotes awaiting acceptance will show their status and value here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Earnings snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last 30 days vs previous 30 days — chart appears once you have confirmed revenue.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
