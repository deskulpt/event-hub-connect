CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','refunded');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE SET NULL,
  host_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  provider_kind public.recipient_kind NOT NULL,
  title text NOT NULL,
  event_date date,
  deposit_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_host ON public.bookings(host_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_event ON public.bookings(event_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Providers view bookings against them"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = provider_id);

CREATE POLICY "Hosts create bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts update own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Providers update bookings against them"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = provider_id);

CREATE POLICY "Hosts delete own bookings"
  ON public.bookings FOR DELETE TO authenticated
  USING (auth.uid() = host_id);

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Wave 3 Epic 4: tasks + contacts
CREATE TYPE public.task_status AS ENUM ('todo','in_progress','done','blocked');

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date date,
  status public.task_status NOT NULL DEFAULT 'todo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_owner ON public.tasks(owner_id);
CREATE INDEX idx_tasks_event ON public.tasks(event_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own tasks - select"
  ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own tasks - insert"
  ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners manage own tasks - update"
  ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own tasks - delete"
  ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  company text,
  role text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_owner ON public.contacts(owner_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own contacts - select"
  ON public.contacts FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own contacts - insert"
  ON public.contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners manage own contacts - update"
  ON public.contacts FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners manage own contacts - delete"
  ON public.contacts FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER contacts_set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Wave 3 Epic 3: messages on inquiries (threads = the inquiry itself)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_inquiry ON public.messages(inquiry_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants of the inquiry (sender or recipient) can read/write messages
CREATE POLICY "Inquiry participants view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.inquiries i
    WHERE i.id = inquiry_id AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
  ));

CREATE POLICY "Inquiry participants send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.inquiries i
      WHERE i.id = inquiry_id AND (i.sender_id = auth.uid() OR i.recipient_id = auth.uid())
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;