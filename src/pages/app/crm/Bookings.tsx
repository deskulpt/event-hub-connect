import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { CalendarCheck, Inbox, ArrowUpRight } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { NewBookingDialog } from "@/components/crm/NewBookingDialog";
import { listBookingsAsHost, listBookingsAsProvider, updateBookingStatus } from "@/services/bookings";
import { splitBookingTotal } from "@/lib/platform-fee";
import type { BookingRecord, BookingStatus } from "@/types/booking";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "outline"> = {
  pending: "secondary", confirmed: "default", in_progress: "default",
  completed: "outline", cancelled: "outline", refunded: "outline",
};

const Row = ({ b, side, onUpdate }: { b: BookingRecord; side: "host" | "provider"; onUpdate: (id: string, s: BookingStatus) => void }) => {
  const dep = b.deposit_cents ? `$${(b.deposit_cents / 100).toLocaleString()}` : "—";
  const tot = b.total_cents ? `$${(b.total_cents / 100).toLocaleString()}` : "—";
  const split = splitBookingTotal(b.total_cents ?? 0);
  const money = (c: number) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{b.title}</span>
          <Badge variant={statusVariant[b.status]} className="capitalize text-[10px]">{b.status.replace("_", " ")}</Badge>
          <Badge variant="outline" className="capitalize text-[10px]">{b.provider_kind}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tabular-nums">
          {b.event_date && <span>{format(parseISO(b.event_date), "MMM d, yyyy")}</span>}
          <span>Deposit {dep}</span>
          <span>Total {tot}</span>
          {b.total_cents > 0 && (
            side === "provider"
              ? <span>You receive {money(split.payoutCents)} (after 10% platform fee)</span>
              : <span>Includes {money(split.feeCents)} platform fee</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {side === "provider" && b.status === "pending" && (
          <Button size="sm" variant="outline" onClick={() => onUpdate(b.id, "confirmed")}>Confirm</Button>
        )}
        {b.status !== "completed" && b.status !== "cancelled" && (
          <Button size="sm" variant="ghost" onClick={() => onUpdate(b.id, "cancelled")}>Cancel</Button>
        )}
      </div>
    </div>
  );
};

export default function Bookings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const hostQ = useQuery({
    queryKey: ["bookings", "host", user?.id],
    queryFn: () => listBookingsAsHost(user!.id),
    enabled: !!user,
  });
  const provQ = useQuery({
    queryKey: ["bookings", "provider", user?.id],
    queryFn: () => listBookingsAsProvider(user!.id),
    enabled: !!user,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Booking updated"); },
    onError: (e: Error) => toast.error(e.message ?? "Update failed"),
  });

  return (
    <PageLayout>
      <PageHeader
        title="Bookings"
        subtitle="Confirmed reservations with deposits, totals, and lifecycle status."
        primaryCta={<NewBookingDialog />}
      />

      <Tabs defaultValue="host">
        <TabsList>
          <TabsTrigger value="host" className="gap-2"><ArrowUpRight className="h-3.5 w-3.5" />As host</TabsTrigger>
          <TabsTrigger value="provider" className="gap-2"><Inbox className="h-3.5 w-3.5" />As provider</TabsTrigger>
        </TabsList>

        <TabsContent value="host" className="space-y-2">
          <Card><CardContent className="space-y-2 p-4">
            {hostQ.isLoading ? <Skeleton className="h-20 w-full" /> :
              (hostQ.data ?? []).length === 0 ? (
                <EmptyState icon={<CalendarCheck className="h-5 w-5 text-primary" />}
                  title="No bookings yet" description="Create a booking from a replied inquiry or use New booking above."
                  action={<NewBookingDialog />} />
              ) : (hostQ.data ?? []).map((b) => (
                <Row key={b.id} b={b} side="host" onUpdate={(id, status) => updateMut.mutate({ id, status })} />
              ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-2">
          <Card><CardContent className="space-y-2 p-4">
            {provQ.isLoading ? <Skeleton className="h-20 w-full" /> :
              (provQ.data ?? []).length === 0 ? (
                <EmptyState icon={<Inbox className="h-5 w-5 text-primary" />}
                  title="No bookings against you" description="When hosts confirm bookings, they appear here." />
              ) : (provQ.data ?? []).map((b) => (
                <Row key={b.id} b={b} side="provider" onUpdate={(id, status) => updateMut.mutate({ id, status })} />
              ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
