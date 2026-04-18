import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createInquiry } from "@/services/inquiries";
import { inquiryFormSchema, recipientKindValues, type InquiryFormInput } from "@/types/inquiry";

interface Props {
  eventId?: string | null;
  defaultSubject?: string;
  triggerLabel?: string;
}

export const SendInquiryDialog = ({ eventId = null, defaultSubject = "", triggerLabel = "Send inquiry" }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<InquiryFormInput>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      subject: defaultSubject,
      message: "",
      recipient_id: "",
      recipient_kind: "venue",
      event_id: eventId,
      requested_date: "",
      guest_count: "" as unknown as number,
      budget_min: "" as unknown as number,
      budget_max: "" as unknown as number,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: InquiryFormInput) => createInquiry(values, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["inquiries-pending"] });
      toast.success("Inquiry sent");
      setOpen(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not send inquiry"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Send className="mr-1 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send inquiry</DialogTitle>
          <DialogDescription>
            Send a structured availability and pricing request. The recipient sees it in their CRM inbox.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register("subject")} placeholder="Sat 14 Jun, 80-guest brunch" />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="recipient_kind">Recipient type</Label>
              <Select
                value={watch("recipient_kind")}
                onValueChange={(v) => setValue("recipient_kind", v as InquiryFormInput["recipient_kind"])}
              >
                <SelectTrigger id="recipient_kind"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {recipientKindValues.map((k) => (
                    <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient_id">Recipient user ID</Label>
              <Input id="recipient_id" {...register("recipient_id")} placeholder="uuid" />
              {errors.recipient_id && <p className="text-xs text-destructive">{errors.recipient_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="requested_date">Requested date</Label>
              <Input id="requested_date" type="date" {...register("requested_date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guest_count">Guests</Label>
              <Input id="guest_count" type="number" min={1} {...register("guest_count")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="budget_min">Budget min ($)</Label>
              <Input id="budget_min" type="number" min={0} {...register("budget_min")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_max">Budget max ($)</Label>
              <Input id="budget_max" type="number" min={0} {...register("budget_max")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={4} {...register("message")} placeholder="Brief context, vibe, must-haves." />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending…" : "Send inquiry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
