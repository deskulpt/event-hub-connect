import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarDays, MessageSquare, Wallet, ShieldCheck, ArrowRight, ListChecks, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cardsByRole = {
  host: [
    { t: "Upcoming events", d: "0 events in the next 30 days", icon: CalendarDays, to: "/app/events" },
    { t: "Shortlist progress", d: "Find venues and pros", icon: MessageSquare, to: "/app/marketplace" },
    { t: "Pending confirmations", d: "Awaiting vendor replies", icon: ListChecks, to: "/app/crm/inquiries" },
    { t: "Budget snapshot", d: "Track event spend", icon: Wallet, to: "/app/finance" },
  ],
  pro: [
    { t: "New inquiries", d: "Respond to leads", icon: MessageSquare, to: "/app/crm/inquiries" },
    { t: "Today's jobs", d: "What's on your plate", icon: CalendarDays, to: "/app/calendar" },
    { t: "Open invoices", d: "Get paid faster", icon: Wallet, to: "/app/finance/invoices" },
    { t: "Insurance status", d: "Stay bookable", icon: ShieldCheck, to: "/app/trust/insurance" },
  ],
  business: [
    { t: "Occupancy", d: "Bookings this month", icon: CalendarDays, to: "/app/calendar" },
    { t: "Outstanding quotes", d: "Win more business", icon: MessageSquare, to: "/app/crm/pipeline" },
    { t: "Payouts", d: "Track cash flow", icon: Wallet, to: "/app/finance/payouts" },
    { t: "Compliance", d: "Verification & insurance", icon: ShieldCheck, to: "/app/trust" },
  ],
  admin: [
    { t: "Moderation queue", d: "Pending reviews", icon: ShieldCheck, to: "/app/trust" },
    { t: "Disputes", d: "Open cases", icon: Bell, to: "/app/trust/disputes" },
    { t: "Payouts", d: "Platform reconciliation", icon: Wallet, to: "/app/finance/payouts" },
    { t: "Insights", d: "Platform analytics", icon: CalendarDays, to: "/app/insights" },
  ],
} as const;

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const role = (profile?.active_role ?? "host") as keyof typeof cardsByRole;
  const cards = cardsByRole[role];

  return (
    <PageLayout
      rightRail={
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> What should I do next?</CardTitle>
            <CardDescription className="text-xs">Vibely AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Create your first event to unlock personalized recommendations, capacity intelligence, and AI-powered vendor outreach.</p>
            <Button size="sm" className="w-full" onClick={() => navigate("/app/events/new")}>Create event<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
          </CardContent>
        </Card>
      }
    >
      <PageHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        subtitle="Your personalized launchpad — today's priorities, upcoming events, and what needs your attention."
        status={role.toUpperCase()}
        primaryCta={<Button size="sm" onClick={() => navigate("/app/events/new")}>Create event</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.t} className="cursor-pointer transition-all hover:shadow-md" onClick={() => navigate(c.to)}>
            <CardHeader className="pb-3">
              <c.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{c.t}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Today's priorities</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nothing urgent yet. As you create events and add bookings, action items will appear here.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
