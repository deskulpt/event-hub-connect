import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createVenue, updateVenue } from "@/services/listings";
import { venueFormSchema, type VenueFormInput, type VenueRecord } from "@/types/listing";

interface Props {
  initial?: VenueRecord | null;
  triggerLabel?: string;
}

export const VenueFormDialog = ({ initial = null, triggerLabel }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<VenueFormInput>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      city: initial?.city ?? "",
      capacity_min: (initial?.capacity_min ?? "") as unknown as number,
      capacity_max: (initial?.capacity_max ?? "") as unknown as number,
      base_price: (initial?.base_price_cents ? initial.base_price_cents / 100 : "") as unknown as number,
      vibe_tags_csv: (initial?.vibe_tags ?? []).join(", "),
      description: initial?.description ?? "",
      photo_url: initial?.photo_url ?? "",
      published: initial?.published ?? false,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (v: VenueFormInput) => (initial ? updateVenue(initial.id, v) : createVenue(v, user!.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-venues", user?.id] });
      qc.invalidateQueries({ queryKey: ["venues"] });
      toast.success(initial ? "Venue updated" : "Venue created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save venue"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={initial ? "outline" : "default"}>
          {!initial && <Plus className="mr-1 h-4 w-4" />}
          {triggerLabel ?? (initial ? "Edit" : "New venue")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit venue" : "New venue"}</DialogTitle>
          <DialogDescription>Publish to make it discoverable in the marketplace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Sunset Loft" />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} placeholder="Brooklyn" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base_price">Base price ($)</Label>
              <Input id="base_price" type="number" min={0} {...form.register("base_price")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="capacity_min">Capacity min</Label>
              <Input id="capacity_min" type="number" min={0} {...form.register("capacity_min")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity_max">Capacity max</Label>
              <Input id="capacity_max" type="number" min={0} {...form.register("capacity_max")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vibe_tags_csv">Vibe tags (comma separated)</Label>
            <Input id="vibe_tags_csv" {...form.register("vibe_tags_csv")} placeholder="modern, industrial, rooftop" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input id="photo_url" {...form.register("photo_url")} placeholder="https://…" />
            {form.formState.errors.photo_url && <p className="text-xs text-destructive">{form.formState.errors.photo_url.message}</p>}
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="published" className="text-sm">Published</Label>
              <p className="text-xs text-muted-foreground">Visible in Discover</p>
            </div>
            <Switch
              id="published"
              checked={!!form.watch("published")}
              onCheckedChange={(v) => form.setValue("published", v)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : initial ? "Save changes" : "Create venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
