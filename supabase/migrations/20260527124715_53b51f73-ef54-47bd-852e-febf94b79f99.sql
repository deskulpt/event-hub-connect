
-- Reviews
CREATE TYPE public.review_subject AS ENUM ('venue','vendor');

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  subject_kind public.review_subject NOT NULL,
  subject_id uuid NOT NULL,
  booking_id uuid,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, subject_kind, subject_id, booking_id)
);
CREATE INDEX idx_reviews_subject ON public.reviews(subject_kind, subject_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authors insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Voice calls (AI caller stub)
CREATE TYPE public.voice_call_status AS ENUM ('queued','in_progress','completed','failed');
CREATE TYPE public.voice_call_outcome AS ENUM ('available','unavailable','callback','no_answer','voicemail');

CREATE TABLE public.voice_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  event_id uuid,
  inquiry_id uuid,
  target_kind public.review_subject,
  target_id uuid,
  target_name text,
  phone text,
  status public.voice_call_status NOT NULL DEFAULT 'queued',
  outcome public.voice_call_outcome,
  transcript text,
  summary text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_voice_calls_owner ON public.voice_calls(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_calls TO authenticated;
GRANT ALL ON public.voice_calls TO service_role;

ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own calls" ON public.voice_calls FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners create own calls" ON public.voice_calls FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own calls" ON public.voice_calls FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own calls" ON public.voice_calls FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER voice_calls_set_updated_at BEFORE UPDATE ON public.voice_calls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Event plans (AI generated)
CREATE TABLE public.event_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  summary text,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  shortlist jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_event_plans_event ON public.event_plans(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_plans TO authenticated;
GRANT ALL ON public.event_plans TO service_role;

ALTER TABLE public.event_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own plans" ON public.event_plans FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert own plans" ON public.event_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own plans" ON public.event_plans FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own plans" ON public.event_plans FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER event_plans_set_updated_at BEFORE UPDATE ON public.event_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Event invites (shareable invitation assets)
CREATE TABLE public.event_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  headline text,
  copy text,
  image_url text,
  source text NOT NULL DEFAULT 'ai',
  rsvp_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_event_invites_event ON public.event_invites(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_invites TO authenticated;
GRANT SELECT ON public.event_invites TO anon;
GRANT ALL ON public.event_invites TO service_role;

ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view invites by slug" ON public.event_invites FOR SELECT USING (true);
CREATE POLICY "Owners insert own invites" ON public.event_invites FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own invites" ON public.event_invites FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own invites" ON public.event_invites FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER event_invites_set_updated_at BEFORE UPDATE ON public.event_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public storage bucket for invite assets
INSERT INTO storage.buckets (id, name, public) VALUES ('invites','invites', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read invites" ON storage.objects FOR SELECT USING (bucket_id = 'invites');
CREATE POLICY "Auth users upload invites" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invites' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update own invite files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'invites' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners delete own invite files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'invites' AND auth.uid()::text = (storage.foldername(name))[1]);
