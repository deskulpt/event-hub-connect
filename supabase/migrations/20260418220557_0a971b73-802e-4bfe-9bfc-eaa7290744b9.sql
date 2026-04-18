-- Vendor category enum
CREATE TYPE public.vendor_category AS ENUM ('chef','dj','photographer','planner','artist','caterer','florist','other');

-- Venues
CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  city text,
  capacity_min integer DEFAULT 0,
  capacity_max integer DEFAULT 0,
  base_price_cents integer DEFAULT 0,
  vibe_tags text[] DEFAULT '{}',
  description text,
  photo_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published venues" ON public.venues
  FOR SELECT TO authenticated USING (published = true OR owner_id = auth.uid());
CREATE POLICY "Owners insert own venues" ON public.venues
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own venues" ON public.venues
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own venues" ON public.venues
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER venues_set_updated_at BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Vendors (pros + business services)
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  category public.vendor_category NOT NULL DEFAULT 'other',
  city text,
  base_price_cents integer DEFAULT 0,
  vibe_tags text[] DEFAULT '{}',
  description text,
  photo_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published vendors" ON public.vendors
  FOR SELECT TO authenticated USING (published = true OR owner_id = auth.uid());
CREATE POLICY "Owners insert own vendors" ON public.vendors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own vendors" ON public.vendors
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete own vendors" ON public.vendors
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER vendors_set_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Saved listings
CREATE TABLE public.saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  listing_kind public.recipient_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id, listing_kind)
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saved" ON public.saved_listings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved" ON public.saved_listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved" ON public.saved_listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_published ON public.venues(published);
CREATE INDEX idx_vendors_category ON public.vendors(category);
CREATE INDEX idx_vendors_city ON public.vendors(city);
CREATE INDEX idx_vendors_published ON public.vendors(published);
CREATE INDEX idx_saved_user ON public.saved_listings(user_id);