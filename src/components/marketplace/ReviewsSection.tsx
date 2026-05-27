import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BentoCard } from "@/components/shell/Bento";
import { listReviews, createReview, averageRating } from "@/services/reviews";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props { kind: "venue" | "vendor"; subjectId: string }

export const ReviewsSection = ({ kind, subjectId }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const q = useQuery({
    queryKey: ["reviews", kind, subjectId],
    queryFn: () => listReviews(kind, subjectId),
    enabled: !!subjectId,
  });
  const mut = useMutation({
    mutationFn: () => createReview({ subject_kind: kind, subject_id: subjectId, rating, title: title || undefined, body: body || undefined }, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", kind, subjectId] });
      qc.invalidateQueries({ queryKey: ["venues"] });
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Review posted");
      setTitle(""); setBody(""); setRating(5);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not post review"),
  });

  const reviews = q.data ?? [];
  const stats = averageRating(reviews);

  return (
    <BentoCard className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Reviews</h3>
        {stats.count > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold tabular-nums">{stats.avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({stats.count})</span>
            {stats.count >= 5 && stats.avg >= 4.5 && (
              <Badge variant="default" className="ml-2 gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
            )}
          </div>
        )}
      </div>

      {user && (
        <form
          onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
          className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3"
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={cn("h-5 w-5", n <= rating ? "fill-primary text-primary" : "text-muted-foreground")} />
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-title" className="text-xs">Title (optional)</Label>
            <Input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Great experience" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rv-body" className="text-xs">Your review</Label>
            <Textarea id="rv-body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience…" />
          </div>
          <Button type="submit" size="sm" disabled={mut.isPending}>
            {mut.isPending ? "Posting…" : "Post review"}
          </Button>
        </form>
      )}

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" /> No reviews yet — be the first.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-border/50 p-3">
              <div className="mb-1 flex items-center gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              {r.title && <div className="text-sm font-semibold">{r.title}</div>}
              {r.body && <p className="mt-1 text-sm text-foreground/90">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  );
};
