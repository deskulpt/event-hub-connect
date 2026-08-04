import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { createCircle, joinCircle, leaveCircle, listCircles, listMyCircleIds } from "@/services/circles";
import { INTEREST_OPTIONS } from "@/types/community";

export const Circles = () => {
  const { user } = useAuth();
  const { localityId, language, t } = usePreferences();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const circlesQuery = useQuery({
    queryKey: ["circles", localityId],
    queryFn: () => listCircles(localityId),
  });
  const myCirclesQuery = useQuery({
    queryKey: ["my-circles", user?.id],
    queryFn: () => listMyCircleIds(user!.id),
    enabled: Boolean(user),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["circles"] });
    void queryClient.invalidateQueries({ queryKey: ["my-circles"] });
  };

  const membership = useMutation({
    mutationFn: async ({ circleId, joined }: { circleId: string; joined: boolean }) =>
      joined ? leaveCircle(circleId, user!.id) : joinCircle(circleId, user!.id),
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(variables.joined ? "You left the circle" : "You joined the circle");
    },
    onError: () => toast.error("Could not update your membership. Please try again."),
  });

  const create = useMutation({
    mutationFn: () =>
      createCircle(
        { name, description, interest_tags: tags, language, locality_id: localityId },
        user!.id,
      ),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setName("");
      setDescription("");
      setTags([]);
      toast.success("Circle created");
    },
    onError: () => toast.error("Could not create the circle. Please try again."),
  });

  const circles = (circlesQuery.data ?? []).filter((circle) =>
    circle.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const myIds = myCirclesQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Community"
        title={t("circles.title")}
        subtitle={t("circles.subtitle")}
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4" /> Start a circle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a circle</DialogTitle>
                <DialogDescription>
                  Circles are small local groups built around one shared interest.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Circle name, e.g. Morning walkers"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-label="Circle name"
                />
                <Textarea
                  placeholder="What will this circle do together?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  aria-label="Circle description"
                />
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = tags.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          setTags(selected ? tags.filter((tag) => tag !== interest) : [...tags, interest])
                        }
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => create.mutate()}
                  disabled={!name.trim() || create.isPending}
                  className="rounded-full"
                >
                  {create.isPending ? "Creating…" : "Create circle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search circles"
        aria-label="Search circles"
        className="max-w-sm rounded-full"
      />

      {circlesQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {circlesQuery.isError && (
        <EmptyState
          title="We could not load circles"
          description="Something went wrong while fetching local circles."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => circlesQuery.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      )}

      {circlesQuery.isSuccess && circles.length === 0 && (
        <EmptyState
          icon={<Users className="h-6 w-6 text-primary-foreground" />}
          title="No circles near you yet"
          description="Be the first to start one — neighbours can join in a single tap."
          action={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              Start a circle
            </Button>
          }
        />
      )}

      {circles.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {circles.map((circle) => {
            const joined = myIds.includes(circle.id);
            return (
              <Card key={circle.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
                <CardHeader
                  className="cursor-pointer pb-2"
                  onClick={() => navigate(`/app/circles/${circle.id}`)}
                >
                  <CardTitle className="text-base">{circle.name}</CardTitle>
                  <p className="text-xs text-muted-foreground tab-num">
                    {circle.member_count} members · {circle.language.toUpperCase()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p
                    className="line-clamp-2 cursor-pointer text-sm text-muted-foreground"
                    onClick={() => navigate(`/app/circles/${circle.id}`)}
                  >
                    {circle.description ?? "A local group for neighbours with a shared interest."}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {circle.interest_tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => navigate(`/app/circles/${circle.id}`)}
                    >
                      Open
                    </Button>
                    <Button
                      variant={joined ? "outline" : "default"}
                      className="flex-1 rounded-full"
                      disabled={!user || membership.isPending}
                      onClick={() => membership.mutate({ circleId: circle.id, joined })}
                    >
                      {joined ? t("circles.leave") : t("circles.join")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};
