import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users, Plus, Mail, Phone, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { listContacts, createContact, deleteContact } from "@/services/contacts";
import { contactFormSchema, type ContactFormInput } from "@/types/crm";

export default function Contacts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const contactsQ = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => listContacts(user!.id),
    enabled: !!user,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { full_name: "", email: "", phone: "", company: "", role: "", notes: "" },
  });

  const createMut = useMutation({
    mutationFn: (v: ContactFormInput) => createContact(v, user!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact added"); reset(); setOpen(false); },
    onError: (e: Error) => toast.error(e.message ?? "Could not add contact"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact removed"); },
  });

  return (
    <PageLayout>
      <PageHeader
        title="Contacts"
        subtitle="People you work with — clients, vendors, venue managers, and team."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Add contact</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add contact</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit((v) => createMut.mutate(v))} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" {...register("full_name")} />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register("email")} /></div>
                  <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" {...register("phone")} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label htmlFor="company">Company</Label><Input id="company" {...register("company")} /></div>
                  <div className="space-y-1.5"><Label htmlFor="role">Role</Label><Input id="role" {...register("role")} /></div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="notes">Notes</Label><Textarea id="notes" rows={3} {...register("notes")} /></div>
                <DialogFooter>
                  <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Adding…" : "Add contact"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card><CardContent className="space-y-2 p-4">
        {contactsQ.isLoading ? <Skeleton className="h-20 w-full" /> :
          (contactsQ.data ?? []).length === 0 ? (
            <EmptyState icon={<Users className="h-5 w-5 text-primary" />}
              title="No contacts yet" description="Add clients, vendors, and venue managers to keep them one click away." />
          ) : (contactsQ.data ?? []).map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">{c.full_name}{c.role && <span className="text-muted-foreground"> · {c.role}</span>}</div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {c.company && <span>{c.company}</span>}
                  {c.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
      </CardContent></Card>
    </PageLayout>
  );
}
