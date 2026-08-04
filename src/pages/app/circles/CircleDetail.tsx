import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCircle,
  joinCircle,
  leaveCircle,
  listCircleMembers,
  updateCircle,
} from "@/services/circles";
import { useState } from "react";

export const CircleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const circleQuery = useQuery({
    queryKey: ["circle", id],
    queryFn: () => getCircle(id!),
    enabled: Boolean(id),
  });
  const membersQuery = useQuery({
    queryKey: ["circle-members", id],
    queryFn: () => listCircleMembers(id!),
    enabled: Boolean(id),
  });

  const circle = circleQuery.data;
  const members = membersQuery.data ?? [];
  const joined = Boolean(user && members.some((m) => m.user_id === user.id));
  const isOrganizer = Boolean(
    user && (circle?.owner_id === user.id || members.some((m) => m.user_id === user.id && m.is_organizer)),
  );

  const membership = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Not signed in");
      if (joined) await leaveCircle(id, user.id);
      else await joinCircle(id, user.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["circle", id] });
      void queryClient.invalidateQueries({ queryKey: ["circle-members", id] });
      void queryClient.invalidateQueries({ queryKey: ["circles"] });
      void queryClient.invalidateQueries({ queryKey: ["my-circles"] });
      toast.success(joined ? "You left the circle" : "You joined the circle");
    },
    onError: () => toast.error("Could not update membership"),
  });

  const save = useMutation({
    mutationFn: () =>
      updateCircle(id!, {
        name: name.trim() || circle!.name,
        description: description.trim() || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["circle", id] });
      void queryClient.invalidateQueries({ queryKey: ["circles"] });
      setEditing(false);
      toast.success("Circle updated");
    },
    onError: () => toast.error("Could not save circle"),
  });

  if (circleQuery.isLoading) {
    return (
      <PageLayout>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageLayout>
    );
  }

  if (!circle) {
    return (
      <PageLayout>
        <EmptyState
          icon={<Users className="h-6 w-6 text-primary-foreground" />}
          title="Circle not found"
          description="It may have been unpublished."
          action={
            <Button className="rounded-full" onClick={() => navigate("/app/circles")}>
              Back to circles
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/app/circles">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to circles
        </Link>
      </Button>
      <PageHeader
        eyebrow={circle.language.toUpperCase()}
        title={circle.name}
        subtitle={circle.description ?? "A local group for neighbours with a shared interest."}
        primaryCta={
          <Button
            className="rounded-full"
            variant={joined ? "outline" : "default"}
            disabled={!user || membership.isPending}
            onClick={() => membership.mutate()}
          >
            {joined ? "Leave circle" : "Join circle"}
          </Button>
        }
        secondaryCta={
          isOrganizer ? (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setName(circle.name);
                setDescription(circle.description ?? "");
                setEditing((v) => !v);
              }}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {circle.interest_tags.map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full text-[10px]">
            {tag}
          </Badge>
        ))}
        <Badge variant="secondary" className="rounded-full text-[10px] tab-num">
          {circle.member_count} members
        </Badge>
      </div>

      {editing && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Edit circle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Circle name" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Circle description"
            />
            <Button className="rounded-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {membersQuery.isLoading && <Skeleton className="h-16 w-full" />}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">No members yet — be the first to join.</p>
          )}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {member.user_id.slice(0, 8)}…
              </span>
              {member.is_organizer && (
                <Badge className="rounded-full text-[10px]">Organiser</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageLayout>
  );
};
