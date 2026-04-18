import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { listTasks, createTask, updateTaskStatus, deleteTask } from "@/services/tasks";
import { taskFormSchema, taskStatusValues, type TaskFormInput, type TaskStatus } from "@/types/crm";

const statusVariant: Record<TaskStatus, "default" | "secondary" | "outline" | "destructive"> = {
  todo: "outline", in_progress: "secondary", done: "default", blocked: "destructive",
};

export default function Tasks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const tasksQ = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => listTasks(user!.id),
    enabled: !!user,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", due_date: "", status: "todo" },
  });

  const createMut = useMutation({
    mutationFn: (v: TaskFormInput) => createTask(v, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task added"); reset(); setOpen(false); },
    onError: (e: Error) => toast.error(e.message ?? "Could not add task"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Task removed"); },
  });

  return (
    <PageLayout>
      <PageHeader
        title="Tasks"
        subtitle="Track tasks across events, vendors, and bookings."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Add task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit((v) => createMut.mutate(v))} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} {...register("description")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="due_date">Due date</Label>
                  <Input id="due_date" type="date" {...register("due_date")} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Adding…" : "Add task"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card><CardContent className="space-y-2 p-4">
        {tasksQ.isLoading ? <Skeleton className="h-20 w-full" /> :
          (tasksQ.data ?? []).length === 0 ? (
            <EmptyState icon={<ListChecks className="h-5 w-5 text-primary" />}
              title="No tasks yet" description="Add a task above. Tasks from event run-of-show and bookings will also appear here." />
          ) : (tasksQ.data ?? []).map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{t.title}</span>
                  <Badge variant={statusVariant[t.status]} className="capitalize text-[10px]">{t.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground tabular-nums">
                  {t.due_date && <span>Due {format(parseISO(t.due_date), "MMM d")}</span>}
                  {t.description && <span className="line-clamp-1">{t.description}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={t.status} onValueChange={(v) => updateMut.mutate({ id: t.id, status: v as TaskStatus })}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {taskStatusValues.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
      </CardContent></Card>
    </PageLayout>
  );
}
