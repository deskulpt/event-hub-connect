import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listEvents } from "@/services/events";
import {
  getVendor,
  getVenue,
  isListingSaved,
  saveListing,
  unsaveListing,
} from "@/services/listings";
import { SendInquiryDialog } from "@/components/crm/SendInquiryDialog";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";

export default function ListingDetail() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { type, id } = useParams<{ type: string; id: string }>();
  const kind = type === "venue" ? "venue" : "pro";
  const [busy, setBusy] = useState(false);

  const eventsQ = useQuery({ queryKey: ["events", user?.id], queryFn: listEvents, enabled: !!user });
  const activeEvent = useMemo(() => {
    const list = eventsQ.data ?? [];
    return list.find((e) => e.status === "planning") ?? list.find((e) => e.status === "draft") ?? list[0] ?? null;
  }, [eventsQ.data]);

  const venueQ = useQuery({
    queryKey: ["venue", id],
    queryFn: () => getVenue(id!),
    enabled: !!id && kind === "venue",
  });
  const vendorQ = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendor(id!),
    enabled: !!id && kind === "pro",
  });

  const savedQ = useQuery({
    queryKey: ["saved-status", user?.id, id, kind],
    queryFn: () => isListingSaved(user!.id, id!, kind),
    enabled: !!user && !!id,
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      setBusy(true);
      if (savedQ.data) await unsaveListing(user!.id, id!, kind);
      else await saveListing(user!.id, id!, kind);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-status", user?.id, id, kind] });
      qc.invalidateQueries({ queryKey: ["saved", user?.id] });
      toast.success(savedQ.data ? "Removed from shortlist" : "Saved to shortlist");
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not update shortlist"),
    onSettled: () => setBusy(false),
  });

  const isLoading = (kind === "venue" && venueQ.isLoading) || (kind === "pro" && vendorQ.isLoading);
  const venue = venueQ.data;
  const vendor = vendorQ.data;
  const found = kind === "venue" ? !!venue : !!vendor;
  const fit = kind === "venue" && venue
    ? scoreVenueFit(activeEvent, venue)
    : kind === "pro" && vendor
      ? scoreVendorFit(activeEvent, vendor)
      : { total: 0, city: 0, capacity: 0, vibe: 0, budget: 0 };

  const ownerId = kind === "venue" ? venue?.owner_id : vendor?.owner_id;
  const name = kind === "venue" ? venue?.name : vendor?.name;
  const city = kind === "venue" ? venue?.city : vendor?.city;
  const description = kind === "venue" ? venue?.description : vendor?.description;
  const tags = kind === "venue" ? venue?.vibe_tags : vendor?.vibe_tags;
  const price = kind === "venue" ? venue?.base_price_cents : vendor?.base_price_cents;

  return (
    <PageLayout>
      <PageHeader
        title={name ?? "Listing"}
        subtitle={
          activeEvent
            ? `Validate fit against "${activeEvent.title}" — capacity, vibe, budget, and bookability.`
            : "Validate fit, capacity, pricing, policies, and bookability."
        }
        primaryCta={
          ownerId && user ? (
            <SendInquiryDialog
              eventId={activeEvent?.id ?? null}
              defaultSubject={name ? `Inquiry: ${name}` : ""}
              triggerLabel="Send inquiry"
            />
          ) : undefined
        }
        secondaryCta={
          user && id ? (
            <Button
              size="sm"
              variant={savedQ.data ? "secondary" : "outline"}
              onClick={() => saveMut.mutate()}
              disabled={busy}
            >
              {savedQ.data ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <BookmarkPlus className="mr-1 h-4 w-4" />}
              {savedQ.data ? "Saved" : "Save"}
            </Button>
          ) : undefined
        }
      />

      <Button asChild size="sm" variant="ghost" className="w-fit -mt-2">
        <Link to="/app/marketplace"><ArrowLeft className="mr-1 h-4 w-4" /> Back to discover</Link>
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      ) : !found ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5 text-primary" />}
          title="Listing not found"
          description="It may have been unpublished. Pick another from Discover."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">About</CardTitle>
                  <Badge variant="secondary">Fit {fit.total}</Badge>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  {kind === "pro" && vendor && <span className="capitalize">{vendor.category}</span>}
                  {kind === "pro" && vendor && <span>·</span>}
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {city ?? "—"}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="leading-relaxed text-foreground/90">
                  {description || "No description yet."}
                </p>
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pricing</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div className="flex justify-between tabular-nums">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{formatCents(price)}</span>
                </div>
                {kind === "venue" && venue && (
                  <div className="mt-1 flex justify-between tabular-nums">
                    <span className="text-muted-foreground">Capacity</span>
                    <span>{venue.capacity_min ?? 0}–{venue.capacity_max ?? 0}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-1 text-sm"><Sparkles className="h-3.5 w-3.5" /> Fit breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>City</span><span>{Math.round(fit.city * 100)}</span></div>
                {kind === "venue" && <div className="flex justify-between"><span>Capacity</span><span>{Math.round(fit.capacity * 100)}</span></div>}
                <div className="flex justify-between"><span>Vibe</span><span>{Math.round(fit.vibe * 100)}</span></div>
                <div className="flex justify-between"><span>Budget</span><span>{Math.round(fit.budget * 100)}</span></div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </PageLayout>
  );
}
