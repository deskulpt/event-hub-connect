import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus, MapPin, Users, Languages, TreePine } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/services/events";
import type { EventStatus } from "@/types/event";
import { ACCESSIBILITY_ATTRIBUTES } from "@/types/community";

const statusVariant: Record<EventStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  planning: "secondary",
  booked: "default",
  completed: "secondary",
  cancelled: "outline",
};

const formatBudget = (cents: number | null) =>
  cents == null ? "—" : `$${(cents / 100).toLocaleString()}`;

const formatDate = (date: string | null) => {
  if (!date) return "Date TBD";
  try { return format(parseISO(date), "MMM d, yyyy"); } catch { return date; }
};

export default function AllEvents() {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = useQuery({ queryKey: ["events"], queryFn: listEvents });
  const [language, setLanguage] = useState("all");
  const [indoorOutdoor, setIndoorOutdoor] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");

  const languages = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => {
      if (e.language) set.add(e.language);
    });
    return Array.from(set).sort();
  }, [events]);

  const filtered = (events ?? []).filter((e) => {
    if (language !== "all" && (e.language ?? "en") !== language) return false;
    if (indoorOutdoor !== "all" && (e.indoor_outdoor ?? "") !== indoorOutdoor) return false;
    if (
      accessFilter !== "all" &&
      !(e.accessibility_attributes ?? []).includes(accessFilter)
    ) {
      return false;
    }
    return true;
  });

  return (
    <PageLayout>
      <PageHeader
        title="Activities"
        subtitle="Find, prioritise and manage every activity across your workspace."
        primaryCta={
          <Button size="sm" className="rounded-full" onClick={() => navigate("/app/events/new")}>
            <Plus className="mr-1 h-4 w-4" /> New activity
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setLanguage("all")}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            language === "all" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
          }`}
        >
          All languages
        </button>
        {languages.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className={`rounded-full border px-3 py-1 text-xs uppercase transition-colors ${
              language === code ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
            }`}
          >
            {code}
          </button>
        ))}
        {["all", "indoor", "outdoor"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setIndoorOutdoor(option)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              indoorOutdoor === option
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {option === "all" ? "Any setting" : option}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAccessFilter("all")}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            accessFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
          }`}
        >
          Any access
        </button>
        {ACCESSIBILITY_ATTRIBUTES.slice(0, 4).map((attr) => (
          <button
            key={attr}
            type="button"
            onClick={() => setAccessFilter(attr)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              accessFilter === attr
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {attr}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {error && (
        <Card><CardContent className="p-6 text-sm text-destructive">Failed to load activities. Please refresh.</CardContent></Card>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5 text-primary" />}
          title="No activities yet"
          description="Create your first activity or claim a proposal that reached its vote threshold."
          action={<Button className="rounded-full" onClick={() => navigate("/app/events/new")}><Plus className="mr-1 h-4 w-4" /> Create activity</Button>}
        />
      )}

      {filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((e) => (
            <Card
              key={e.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => navigate(`/app/events/${e.id}`)}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{e.title}</h3>
                    <Badge variant={statusVariant[e.status]} className="capitalize">{e.status}</Badge>
                    {e.event_type && <Badge variant="outline" className="capitalize">{e.event_type}</Badge>}
                    {e.origin === "proposal" && <Badge variant="secondary" className="rounded-full text-[10px]">From proposal</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(e.event_date)}</span>
                    {e.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.city}</span>}
                    {e.guest_count != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{e.guest_count} guests</span>}
                    {e.language && <span className="inline-flex items-center gap-1 uppercase"><Languages className="h-3.5 w-3.5" />{e.language}</span>}
                    {e.indoor_outdoor && <span className="inline-flex items-center gap-1 capitalize"><TreePine className="h-3.5 w-3.5" />{e.indoor_outdoor}</span>}
                  </div>
                  {(e.accessibility_attributes?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {e.accessibility_attributes!.slice(0, 3).map((attr) => (
                        <Badge key={attr} variant="outline" className="rounded-full text-[10px]">{attr}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold tabular-nums">{formatBudget(e.budget_cents)}</div>
                  <div className="text-xs text-muted-foreground">Budget</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
