import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { submitClaim, type ClaimKind } from "@/services/claims";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  contactName: z.string().trim().min(2, "Enter your name").max(100),
  contactEmail: z.string().trim().email("Enter a valid email").max(255),
  contactPhone: z.string().trim().max(30).optional(),
  roleAtBusiness: z.string().trim().max(80).optional(),
  proofNote: z.string().trim().max(1000).optional(),
});
type Values = z.infer<typeof schema>;

export const ClaimListingDialog = ({ listingId, listingKind, name }: { listingId: string; listingKind: ClaimKind; name: string }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { contactName: profile?.full_name ?? "", contactEmail: profile?.email ?? "", contactPhone: "", roleAtBusiness: "", proofNote: "" },
  });

  const onSubmit = async (v: Values) => {
    if (!user) return;
    try {
      await submitClaim({ listingId, listingKind, contactName: v.contactName, contactEmail: v.contactEmail, contactPhone: v.contactPhone, roleAtBusiness: v.roleAtBusiness, proofNote: v.proofNote }, user.id);
      setSent(true);
      toast.success("Claim sent — we'll verify and hand the listing over to you");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send claim");
    }
  };

  if (!user) {
    return (
      <Button size="sm" onClick={() => navigate(`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`)}>
        <BadgeCheck className="mr-1 h-4 w-4" /> Claim this listing
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><BadgeCheck className="mr-1 h-4 w-4" /> Claim this listing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim {name}</DialogTitle>
          <DialogDescription>Free to claim. Add photos and prices, get booking requests, and get paid directly — we only take 10% when a booking is paid.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <p className="text-sm">Thanks! Our team will check your details, usually within 2 business days, and email you when the listing is yours.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField control={form.control} name="contactName" render={({ field }) => (
                <FormItem><FormLabel>Your name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem><FormLabel>Work email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="roleAtBusiness" render={({ field }) => (
                  <FormItem><FormLabel>Your role</FormLabel><FormControl><Input placeholder="Owner, manager…" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="proofNote" render={({ field }) => (
                <FormItem><FormLabel>How can we verify you?</FormLabel><FormControl><Textarea rows={3} placeholder="E.g. my email matches our website domain" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Send claim"}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
