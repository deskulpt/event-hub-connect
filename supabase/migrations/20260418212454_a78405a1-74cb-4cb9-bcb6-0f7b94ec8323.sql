-- Event status enum
CREATE TYPE public.event_status AS ENUM ('draft', 'planning', 'booked', 'completed', 'cancelled');

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT,
  event_date DATE,
  city TEXT,
  guest_count INTEGER,
  budget_cents BIGINT,
  vibe TEXT,
  dietary_notes TEXT,
  accessibility_notes TEXT,
  status public.event_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_events_owner ON public.events(owner_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Updated_at trigger
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();