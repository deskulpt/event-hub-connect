import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Inbox, ArrowUpRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { SendInquiryDialog } from "@/components/crm/SendInquiryDialog";
import {
  listInquiriesSent,
  listInquiriesReceived,
  updateInquiryStatus,
} from "@/services/inquiries";
import { acceptInquiryAsBooking } from "@/services/bookings";
import type { InquiryRecord, InquiryStatus } from "@/types/inquiry";

const statusVariant: Record<InquiryStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary", sent: "secondary", replied: "default", declined: "outline", expired: "outline",
};

const formatBudget = (min: number | null, max: number | null) => {
  if (min == null && max == null) return null;
  const fmt = (c: number) => `$${(c / 100).toLocaleString()}`;
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max) as number);
};

const InquiryRow = ({
  inquiry,
  side,
  onUpdate,
  onAccept,
}: {
  inquiry: InquiryRecord;
  side: "sent" | "received";
  onUpdate: (id: string, status: InquiryStatus) => void;
  onAccept: (inquiry: InquiryRecord) => void;
}) => {
  const budget = formatBudget(inquiry.budget_min_cents, inquiry.budget_max_cents);
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{inquiry.subject}</span>
          <Badge variant={statusVariant[inquiry.status]} className="capitalize text-[10px]">{inquiry.status}</Badge>
          <Badge variant="outline" className="capitalize text-[10px]">{inquiry.recipient_kind}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tabular-nums">
          {inquiry.requested_date && <span>{format(parseISO(inquiry.requested_date), "MMM d, yyyy")}</span>}
          {inquiry.guest_count != null && <span>{inquiry.guest_count} guests</span>}
          {budget && <span>{budget}</span>}
          <span>Sent {format(parseISO(inquiry.created_at), "MMM d")}</span>
        </div>
        {inquiry.message && <p className="line-clamp-2 text-xs text-muted-foreground">{inquiry.message}</p>}
      </div>
      {side === "received" && inquiry.status !== "replied" && inquiry.status !== "declined" && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onAccept(inquiry)}>Accept & book</Button>
          <Button size="sm" variant="outline" onClick={() => onUpdate(inquiry.id, "replied")}>Mark replied</Button>
          <Button size="sm" variant="ghost" onClick={() => onUpdate(inquiry.id, "declined")}>Decline</Button>
        </div>
      )}
    </div>
  );
};

export default function Inquiries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [acceptTarget, setAcceptTarget] = useState<InquiryRecord | null>(null);
  const [deposit, setDeposit] = useState("");
  const [total, setTotal] = useState("");

  const sentQ = useQuery({
    queryKey: ["inquiries", "sent", user?.id],
    queryFn: () => listInquiriesSent(user!.id),
    enabled: !!user,
  });

  const receivedQ = useQuery({
    queryKey: ["inquiries", "received", user?.id],
    queryFn: () => listInquiriesReceived(user!.id),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) => updateInquiryStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Inquiry updated");
    },
    onError: (e: Error) => toast.error(e.message ?? "Update failed"),
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      acceptInquiryAsBooking(acceptTarget!, user!.id, {
        deposit: deposit ? Number(deposit) : 0,
        total: total ? Number(total) : undefined,
      }),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      setAcceptTarget(null);
      setDeposit("");
      setTotal("");
      toast.success("Booking created — deposit pending");
      navigate("/app/crm/bookings");
      return booking;
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not create booking"),
  });

  const apply = (rows: InquiryRecord[]) => filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <PageLayout>
      <PageHeader
        title="Inquiries"
        subtitle="Structured availability and pricing requests across hosts, pros, and businesses."
        primaryCta={<SendInquiryDialog triggerLabel="New inquiry" />}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="sent">
        <TabsList>
          <TabsTrigger value="sent" className="gap-2"><ArrowUpRight className="h-3.5 w-3.5" />Sent</TabsTrigger>
          <TabsTrigger value="received" className="gap-2"><Inbox className="h-3.5 w-3.5" />Received</TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="space-y-2">
          <Card><CardContent className="space-y-2 p-4">
            {sentQ.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : apply(sentQ.data ?? []).length === 0 ? (
              <EmptyState
                icon={<Send className="h-5 w-5 text-primary" />}
                title="No inquiries sent yet"
                description="Send your first inquiry from an event or use the New inquiry button above."
                action={<SendInquiryDialog triggerLabel="New inquiry" />}
              />
            ) : (
              apply(sentQ.data ?? []).map((i) => (
                <InquiryRow
                  key={i.id}
                  inquiry={i}
                  side="sent"
                  onUpdate={(id, status) => updateMutation.mutate({ id, status })}
                  onAccept={setAcceptTarget}
                />
              ))
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-2">
          <Card><CardContent className="space-y-2 p-4">
            {receivedQ.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : apply(receivedQ.data ?? []).length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-5 w-5 text-primary" />}
                title="No inquiries received"
                description="When hosts send you availability requests, they appear here for triage."
              />
            ) : (
              apply(receivedQ.data ?? []).map((i) => (
                <InquiryRow
                  key={i.id}
                  inquiry={i}
                  side="received"
                  onUpdate={(id, status) => updateMutation.mutate({ id, status })}
                  onAccept={setAcceptTarget}
                />
              ))
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(acceptTarget)} onOpenChange={(open) => !open && setAcceptTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept inquiry as booking</DialogTitle>
            <DialogDescription>
              Creates a pending booking for the host. Deposit stays in cents in the ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">{acceptTarget?.subject}</p>
            <Input
              type="number"
              min="0"
              placeholder="Deposit (currency units)"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              aria-label="Deposit"
            />
            <Input
              type="number"
              min="0"
              placeholder="Total (currency units)"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              aria-label="Total"
            />
          </div>
          <DialogFooter>
            <Button
              className="rounded-full"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              {acceptMutation.isPending ? "Creating…" : "Create booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
