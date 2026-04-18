import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EventBriefForm } from "@/components/events/EventBriefForm";
import { createEvent } from "@/services/events";
import { useAuth } from "@/contexts/AuthContext";
import type { EventBriefInput } from "@/types/event";

export default function EventNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (values: EventBriefInput) => {
      if (!user) throw new Error("You must be signed in");
      return createEvent(values, user.id);
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event brief saved");
      navigate(`/app/events/${event.id}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not save event"),
  });

  return (
    <PageLayout>
      <PageHeader
        title="Event brief"
        subtitle="Turn your idea into a complete planning brief Vibely AI can match against."
        status="New"
      />
      <Card>
        <CardContent className="p-6">
          <EventBriefForm
            submitLabel="Save brief"
            submitting={mutation.isPending}
            onSubmit={(v) => mutation.mutateAsync(v)}
            onCancel={() => navigate("/app/events")}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
