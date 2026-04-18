import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createBooking } from "@/services/bookings";
import { bookingFormSchema, type BookingFormInput } from "@/types/booking";
import { recipientKindValues } from "@/types/inquiry";

interface Props {
  defaults?: Partial<BookingFormInput>;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
}

export const NewBookingDialog = ({ defaults, triggerLabel = "New booking", triggerVariant = "default" }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: defaults?.title ?? "",
      provider_id: defaults?.provider_id ?? "",
      provider_kind: defaults?.provider_kind ?? "venue",
      event_id: defaults?.event_id ?? null,
      inquiry_id: defaults?.inquiry_id ?? null,
      event_date: defaults?.event_date ?? "",
      deposit: "" as unknown as number,
      total: "" as unknown as number,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (v: BookingFormInput) => createBooking(v, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings-upcoming"] });
      toast.success("Booking created");
      reset(); setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not create booking"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant={triggerVariant}>{triggerLabel}</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create booking</DialogTitle>
          <DialogDescription>Confirm a reservation with deposit and total. Provider sees it in their CRM.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Booking title</Label>
            <Input id="title" {...register("title")} placeholder="Sat 14 Jun — Loft venue hold" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Provider type</Label>
              <Select value={watch("provider_kind")} onValueChange={(v) => setValue("provider_kind", v as BookingFormInput["provider_kind"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {recipientKindValues.map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="provider_id">Provider user ID</Label>
              <Input id="provider_id" {...register("provider_id")} />
              {errors.provider_id && <p className="text-xs text-destructive">{errors.provider_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Date</Label>
              <Input id="event_date" type="date" {...register("event_date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deposit">Deposit ($)</Label>
              <Input id="deposit" type="number" min={0} {...register("deposit")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="total">Total ($)</Label>
              <Input id="total" type="number" min={0} {...register("total")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating…" : "Create booking"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
