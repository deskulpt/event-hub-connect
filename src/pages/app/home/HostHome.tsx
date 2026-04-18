import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MessageSquare, Wallet, Clock, Sparkles, ArrowRight, Heart, Store, MapPin, Users } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { listEvents } from "@/services/events";

export const HostHome = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: listEvents });

  const activeEvents = events.filter((e) => ["draft", "planning", "booked"].includes(e.status));
  const upcoming = events
    .filter((e) => e.event_date && new Date(e.event_date) >= new Date(new Date().toDateString()))
    .sort((a, b) => (a.event_date ?? "").localeCompare(b.event_date ?? ""));
  const next = upcoming[0];
  const daysToNext = next?.event_date ? differenceInCalendarDays(parseISO(next.event_date), new Date()) : null;

  const totalBudget = activeEvents.reduce((sum, e) => sum + (e.budget_cents ?? 0), 0);
  const budgetLabel = totalBudget > 0 ? `$${(totalBudget / 100).toLocaleString()}` : "—";

  const kpis = [
    { label: "Active events", value: activeEvents.length.toString(), hint: "In planning or booked", icon: CalendarDays, to: "/app/events" },
    { label: "Pending replies", value: "0", hint: "Awaiting vendor response", icon: MessageSquare, to: "/app/crm/inquiries" },
    { label: "Budget status", value: budgetLabel, hint: "Across active events", icon: Wallet, to: "/app/finance" },
    { label: "Next event", value: daysToNext != null ? `${daysToNext}d` : "—", hint: next?.title ?? "Days until nearest", icon: Clock, to: "/app/events" },
  ];

  return (
    <PageLayout
      rightRail={
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Your next best action
            </CardTitle>
            <CardDescription className="text-xs">Vibely AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Create your first event to unlock personalized vendor matches, capacity intelligence, and AI-powered outreach.
            </p>
            <Button size="sm" className="w-full" onClick={() => navigate("/app/events/new")}>
              Create event <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      }
    >
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Your event planning command center — today's priorities and upcoming events."
        status="HOST"
        primaryCta={<Button size="sm" onClick={() => navigate("/app/events/new")}>Create event</Button>}
        secondaryCta={<Button size="sm" variant="outline" onClick={() => navigate("/app/marketplace/discover")}>Ask AI to plan</Button>}
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
          <p className="text-sm text-muted-foreground">No urgent actions yet. Expiring holds, unanswered replies, and incomplete briefs will appear here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming events</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => navigate("/app/events")}>View all<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No events scheduled. Once you create one, it'll appear here with stage, city, headcount, and budget.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4 text-primary" />Recently viewed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Venues and pros you browse will show up here for quick re-access.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Saved shortlists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pin option sets and revisit them when you're ready to inquire or book.</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
