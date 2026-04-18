CREATE TYPE public.inquiry_status AS ENUM ('new','sent','replied','declined','expired');
CREATE TYPE public.recipient_kind AS ENUM ('venue','pro','business');

CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  recipient_kind public.recipient_kind NOT NULL,
  subject text NOT NULL,
  message text,
  requested_date date,
  guest_count integer,
  budget_min_cents integer,
  budget_max_cents integer,
  status public.inquiry_status NOT NULL DEFAULT 'sent',
  reply_note text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_sender ON public.inquiries(sender_id);
CREATE INDEX idx_inquiries_recipient ON public.inquiries(recipient_id);
CREATE INDEX idx_inquiries_event ON public.inquiries(event_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Senders view own inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Recipients view inquiries to them"
  ON public.inquiries FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Senders create inquiries"
  ON public.inquiries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders update own inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Recipients update status of inquiries to them"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Senders delete own inquiries"
  ON public.inquiries FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

CREATE TRIGGER inquiries_set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();