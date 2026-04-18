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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createVendor, updateVendor } from "@/services/listings";
import { VENDOR_CATEGORIES, vendorFormSchema, type VendorCategory, type VendorFormInput, type VendorRecord } from "@/types/listing";

interface Props {
  initial?: VendorRecord | null;
  triggerLabel?: string;
}

export const VendorFormDialog = ({ initial = null, triggerLabel }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<VendorFormInput>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      category: (initial?.category ?? "other") as VendorCategory,
      city: initial?.city ?? "",
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
    mutationFn: (v: VendorFormInput) => (initial ? updateVendor(initial.id, v) : createVendor(v, user!.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["own-vendors", user?.id] });
      qc.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(initial ? "Listing updated" : "Listing created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save listing"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={initial ? "outline" : "default"}>
          {!initial && <Plus className="mr-1 h-4 w-4" />}
          {triggerLabel ?? (initial ? "Edit" : "New listing")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit listing" : "New listing"}</DialogTitle>
          <DialogDescription>Publish to make it discoverable in the marketplace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Anna Yu Photography" />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v as VendorCategory)}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} placeholder="Brooklyn" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="base_price">Base price ($)</Label>
            <Input id="base_price" type="number" min={0} {...form.register("base_price")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vibe_tags_csv">Vibe tags (comma separated)</Label>
            <Input id="vibe_tags_csv" {...form.register("vibe_tags_csv")} placeholder="modern, candid, editorial" />
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
              {mutation.isPending ? "Saving…" : initial ? "Save changes" : "Create listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
