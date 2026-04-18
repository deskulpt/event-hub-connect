import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { listInquiriesSent, listInquiriesReceived } from "@/services/inquiries";
import { listMessages, sendMessage, type MessageRecord } from "@/services/messages";
import type { InquiryRecord } from "@/types/inquiry";

export default function Conversations() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("inquiry");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const sent = useQuery({
    queryKey: ["inquiries", "sent", user?.id],
    queryFn: () => listInquiriesSent(user!.id),
    enabled: !!user,
  });
  const received = useQuery({
    queryKey: ["inquiries", "received", user?.id],
    queryFn: () => listInquiriesReceived(user!.id),
    enabled: !!user,
  });

  const threads: InquiryRecord[] = useMemo(() => {
    const all = [...(sent.data ?? []), ...(received.data ?? [])];
    return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [sent.data, received.data]);

  useEffect(() => {
    if (!selectedId && threads.length > 0) {
      setParams({ inquiry: threads[0].id }, { replace: true });
    }
  }, [selectedId, threads, setParams]);

  const messagesQ = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => listMessages(selectedId!),
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!selectedId) return;
    const ch = supabase
      .channel(`messages-${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `inquiry_id=eq.${selectedId}` }, () => {
        qc.invalidateQueries({ queryKey: ["messages", selectedId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedId, qc]);

  const onSend = async () => {
    if (!user || !selectedId || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(selectedId, user.id, draft.trim());
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", selectedId] });
    } finally {
      setSending(false);
    }
  };

  const selected = threads.find((t) => t.id === selectedId);

  return (
    <PageLayout>
      <PageHeader title="Conversations" subtitle="Threaded messages on every inquiry, in real time." />

      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5 text-primary" />}
          title="No conversations yet"
          description="Send or receive an inquiry to start a thread."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-[260px_1fr]">
          <Card><CardContent className="space-y-1 p-2">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setParams({ inquiry: t.id })}
                className={`w-full rounded-md p-2 text-left text-xs transition-colors ${selectedId === t.id ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">{t.subject}</span>
                  <Badge variant="outline" className="capitalize text-[9px]">{t.status}</Badge>
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                  {format(parseISO(t.updated_at), "MMM d, HH:mm")}
                </div>
              </button>
            ))}
          </CardContent></Card>

          <Card><CardContent className="flex h-[60vh] flex-col p-0">
            <div className="border-b p-3">
              <div className="text-sm font-medium">{selected?.subject ?? "Select a thread"}</div>
              {selected && <div className="text-xs text-muted-foreground capitalize">{selected.recipient_kind} · {selected.status}</div>}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {messagesQ.isLoading ? <Skeleton className="h-10 w-2/3" /> :
                (messagesQ.data ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No messages yet. Send the first one below.</p>
                ) : (messagesQ.data ?? []).map((m: MessageRecord) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <div>{m.body}</div>
                        <div className={`mt-1 text-[10px] tabular-nums ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {format(parseISO(m.created_at), "HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {selected && (
              <div className="flex gap-2 border-t p-3">
                <Input
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                />
                <Button size="sm" onClick={onSend} disabled={sending || !draft.trim()}>
                  <Send className="mr-1 h-3.5 w-3.5" />Send
                </Button>
              </div>
            )}
          </CardContent></Card>
        </div>
      )}
    </PageLayout>
  );
}
