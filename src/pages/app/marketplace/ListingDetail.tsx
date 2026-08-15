import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, MapPin, PhoneCall, Sparkles, Wallet, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PageLayout } from "@/components/shell/PageLayout";
import { EmptyState } from "@/components/shell/EmptyState";
import { BentoCard, GradientOrb } from "@/components/shell/Bento";
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
import { startAiCall } from "@/services/invites";
import { formatCents, scoreVendorFit, scoreVenueFit } from "@/lib/fitScore";
import { FitRing } from "@/components/marketplace/FitRing";
import { ListingCover } from "@/components/marketplace/ListingCover";
import { ReviewsSection } from "@/components/marketplace/ReviewsSection";
import { TrustBadge } from "@/components/trust/TrustBadge";

const initials = (s: string) => s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const FitBar = ({ label, value }: { label: string; value: number }) => {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{pct}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-sunset transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default function ListingDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { type, id } = useParams<{ type: string; id: string }>();
  // Venues use venue records; pros and businesses use vendor records today.
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
  const photo = kind === "venue" ? venue?.photo_url : vendor?.photo_url;

  const aiCallMut = useMutation({
    mutationFn: () =>
      startAiCall({
        event_id: activeEvent?.id,
        target_kind: kind === "venue" ? "venue" : "vendor",
        target_id: id!,
        target_name: name ?? undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-calls"] });
      toast.success("AI call queued");
      navigate("/app/crm/calls");
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not start AI call"),
  });

  return (
    <PageLayout>
      <Button asChild size="sm" variant="ghost" className="w-fit">
        <Link to="/app/marketplace"><ArrowLeft className="mr-1 h-4 w-4" /> Back to discover</Link>
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      ) : !found ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5 text-primary-foreground" />}
          title="Listing not found"
          description="It may have been unpublished. Pick another from Discover."
        />
      ) : (
        <>
          <BentoCard className="relative overflow-hidden p-0">
            <GradientOrb color="accent" className="-top-20 -right-10 h-64 w-64" />
            <ListingCover seed={id ?? ""} initials={name ? initials(name) : "—"} photoUrl={photo} className="h-40" />
            <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{kind === "venue" ? "Venue" : "Pro"}</span>
                  {kind === "pro" && vendor && (
                    <Badge variant="outline" className="rounded-full text-[10px] capitalize">{vendor.category}</Badge>
                  )}
                  {kind === "pro" && vendor && (
                    <TrustBadge state={vendor.verification_state ?? "unverified"} />
                  )}
                </div>
                <h1 className="font-display text-2xl font-semibold leading-tight">{name}</h1>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {city ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <FitRing score={fit.total} size={64} />
                {user && id && (
                  <Button
                    size="sm"
                    variant={savedQ.data ? "secondary" : "outline"}
                    onClick={() => saveMut.mutate()}
                    disabled={busy}
                  >
                    {savedQ.data ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <BookmarkPlus className="mr-1 h-4 w-4" />}
                    {savedQ.data ? "Saved" : "Save"}
                  </Button>
                )}
                {ownerId && user && (
                  <>
                    <SendInquiryDialog
                      eventId={activeEvent?.id ?? null}
                      defaultSubject={name ? `Inquiry: ${name}` : ""}
                      triggerLabel="Send inquiry"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aiCallMut.isPending}
                      onClick={() => aiCallMut.mutate()}
                    >
                      <PhoneCall className="mr-1 h-4 w-4" />
                      AI call
                    </Button>
                  </>
                )}
              </div>
            </div>
          </BentoCard>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <BentoCard className="p-5">
                <h2 className="mb-2 font-display text-base font-semibold">About</h2>
                <p className="leading-relaxed text-sm text-foreground/90">
                  {description || "No description yet."}
                </p>
                {tags && tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((t) => <Badge key={t} variant="outline" className="capitalize text-[10px]">{t}</Badge>)}
                  </div>
                )}
              </BentoCard>

              <div className="grid gap-3 sm:grid-cols-3">
                <BentoCard className="p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Wallet className="h-3 w-3" /> Starting at
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold tabular-nums">{formatCents(price)}</div>
                </BentoCard>
                {kind === "venue" && venue && (
                  <BentoCard className="p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Users className="h-3 w-3" /> Capacity
                    </div>
                    <div className="mt-1 font-display text-xl font-semibold tabular-nums">
                      {venue.capacity_min ?? 0}–{venue.capacity_max ?? 0}
                    </div>
                  </BentoCard>
                )}
                <BentoCard className="p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Location
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">{city ?? "—"}</div>
                </BentoCard>
              </div>

              {id && <ReviewsSection kind={kind === "pro" ? "vendor" : "venue"} subjectId={id} />}
            </div>

            <aside className="space-y-3">
              <BentoCard className="p-5" gradient="sunset">
                <div className="mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold">Fit breakdown</h3>
                </div>
                <div className="mb-4 flex items-center justify-center">
                  <FitRing score={fit.total} size={84} />
                </div>
                <div className="space-y-2.5">
                  <FitBar label="City match" value={fit.city} />
                  {kind === "venue" && <FitBar label="Capacity" value={fit.capacity} />}
                  <FitBar label="Vibe overlap" value={fit.vibe} />
                  <FitBar label="Budget" value={fit.budget} />
                </div>
                {activeEvent && (
                  <p className="mt-4 text-[10px] text-muted-foreground">
                    Scored against <span className="font-medium text-foreground">{activeEvent.title}</span>
                  </p>
                )}
              </BentoCard>
            </aside>
          </div>
        </>
      )}
    </PageLayout>
  );
}
