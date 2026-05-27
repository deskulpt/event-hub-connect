import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Share2, Sparkles, Upload, Copy, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BentoCard } from "@/components/shell/Bento";
import { generateInvite, listInvitesForEvent, uploadInviteImage, type EventInvite } from "@/services/invites";
import { useAuth } from "@/contexts/AuthContext";

interface Props { eventId: string; eventTitle: string }

const buildShareLink = (slug: string) => `${window.location.origin}/i/${slug}`;

export const ShareInviteDialog = ({ eventId, eventTitle }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [styleHint, setStyleHint] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const invitesQ = useQuery({
    queryKey: ["invites", eventId],
    queryFn: () => listInvitesForEvent(eventId),
    enabled: open,
  });

  const genMut = useMutation({
    mutationFn: (opts?: { image_url?: string }) => generateInvite(eventId, { style_hint: styleHint || undefined, image_url: opts?.image_url }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invites", eventId] }); toast.success("Invite generated"); },
    onError: (e: Error) => toast.error(e.message ?? "Could not generate invite"),
  });

  const onUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const url = await uploadInviteImage(user.id, eventId, file);
      setImageUrl(url);
      toast.success("Image uploaded — generating invite copy…");
      await genMut.mutateAsync({ image_url: url });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const latest = invitesQ.data?.[0];
  const link = latest ? buildShareLink(latest.slug) : "";
  const shareText = latest ? `${latest.headline ?? eventTitle}\n${latest.copy ?? ""}\n${link}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };
  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 className="mr-1 h-4 w-4" /> Share invite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share invite for {eventTitle}</DialogTitle>
          <DialogDescription>Generate an AI invite or upload your own image (Canva, Figma, photo). Share on WhatsApp or any social channel.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai"><Sparkles className="mr-1 h-3.5 w-3.5" /> AI generate</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="mr-1 h-3.5 w-3.5" /> Upload or link</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="style">Style hint (optional)</Label>
              <Input id="style" placeholder="e.g. retro neon, garden party, minimal black-and-white"
                value={styleHint} onChange={(e) => setStyleHint(e.target.value)} />
            </div>
            <Button onClick={() => genMut.mutate(undefined)} disabled={genMut.isPending} className="w-full">
              {genMut.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-1 h-4 w-4" /> Generate invite</>}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="file">Upload an image</Label>
              <Input id="file" type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0]; if (f) onUpload(f);
              }} disabled={uploading || genMut.isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Or paste an image URL (Canva share, Drive, etc.)</Label>
              <div className="flex gap-2">
                <Input id="link" placeholder="https://…" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <Button onClick={() => genMut.mutate({ image_url: imageUrl })} disabled={!imageUrl || genMut.isPending}>
                  Use this image
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Tip: in Canva, click Share → Public link → copy image URL.</p>
            </div>
          </TabsContent>
        </Tabs>

        {latest && (
          <BentoCard className="space-y-3 p-4">
            <InvitePreview invite={latest} />
            <Textarea readOnly value={shareText} rows={4} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={whatsapp}><MessageCircle className="mr-1 h-4 w-4" /> Share on WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={copyLink}><Copy className="mr-1 h-4 w-4" /> Copy link</Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={link} target="_blank" rel="noreferrer">Open invite page</a>
              </Button>
            </div>
          </BentoCard>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InvitePreview = ({ invite }: { invite: EventInvite }) => (
  <div className="flex gap-3">
    {invite.image_url && (
      <img src={invite.image_url} alt="" className="h-24 w-24 rounded-lg object-cover" />
    )}
    <div className="min-w-0 flex-1">
      <h3 className="font-display text-sm font-semibold leading-tight">{invite.headline}</h3>
      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{invite.copy}</p>
    </div>
  </div>
);
