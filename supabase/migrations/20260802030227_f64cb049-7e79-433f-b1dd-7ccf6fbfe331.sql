-- 1. New role values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'member';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'volunteer_host';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'professional';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sponsor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ops_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. New enums
DO $$ BEGIN CREATE TYPE public.proposal_status AS ENUM ('draft','voting','threshold_met','scheduled','published','expired','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.org_status AS ENUM ('pending','verified','suspended','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.verification_state AS ENUM ('unverified','pending','verified','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.report_status AS ENUM ('open','triaged','actioned','dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.perk_status AS ENUM ('draft','pending','approved','paused','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.listing_status AS ENUM ('active','sold','withdrawn','removed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Helper: is staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('admin','ops_admin','super_admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('admin','moderator','ops_admin','super_admin'))
$$;

-- 4. Localities
CREATE TABLE public.localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  country text NOT NULL DEFAULT 'IN',
  center_lat double precision,
  center_lng double precision,
  radius_miles numeric NOT NULL DEFAULT 1,
  default_language text NOT NULL DEFAULT 'en',
  member_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.localities TO anon, authenticated;
GRANT ALL ON public.localities TO service_role;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "localities readable" ON public.localities FOR SELECT USING (true);
CREATE POLICY "localities staff write" ON public.localities FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 5. Circles
CREATE TABLE public.circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid REFERENCES public.localities(id) ON DELETE SET NULL,
  organization_id uuid,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  interest_tags text[] NOT NULL DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  photo_url text,
  member_count integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circles TO authenticated;
GRANT ALL ON public.circles TO service_role;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circles read" ON public.circles FOR SELECT TO authenticated USING (published OR owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "circles insert" ON public.circles FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "circles update" ON public.circles FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "circles delete" ON public.circles FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_organizer boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_members TO authenticated;
GRANT ALL ON public.circle_members TO service_role;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circle members read" ON public.circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "circle members join" ON public.circle_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "circle members leave" ON public.circle_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- 6. Proposal engine
CREATE TABLE public.proposal_generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid REFERENCES public.localities(id) ON DELETE CASCADE,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  model text,
  proposals_created integer NOT NULL DEFAULT 0,
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proposal_generation_runs TO authenticated;
GRANT ALL ON public.proposal_generation_runs TO service_role;
ALTER TABLE public.proposal_generation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runs staff read" ON public.proposal_generation_runs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.generated_activity_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.proposal_generation_runs(id) ON DELETE SET NULL,
  locality_id uuid REFERENCES public.localities(id) ON DELETE CASCADE,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  category text,
  language text NOT NULL DEFAULT 'en',
  suggested_date date,
  suggested_time text,
  indoor_outdoor text,
  accessibility_attributes text[] NOT NULL DEFAULT '{}',
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  vote_threshold integer NOT NULL DEFAULT 5,
  vote_count integer NOT NULL DEFAULT 0,
  voting_opens_on date,
  voting_closes_on date,
  status public.proposal_status NOT NULL DEFAULT 'voting',
  claimed_by uuid,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_activity_proposals TO authenticated;
GRANT ALL ON public.generated_activity_proposals TO service_role;
ALTER TABLE public.generated_activity_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals read" ON public.generated_activity_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "proposals staff insert" ON public.generated_activity_proposals FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "proposals update" ON public.generated_activity_proposals FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()) OR claimed_by = auth.uid()) WITH CHECK (public.is_staff(auth.uid()) OR claimed_by = auth.uid());
CREATE POLICY "proposals staff delete" ON public.generated_activity_proposals FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.proposal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.generated_activity_proposals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_votes TO authenticated;
GRANT ALL ON public.proposal_votes TO service_role;
ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes read" ON public.proposal_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "votes insert own" ON public.proposal_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "votes update own" ON public.proposal_votes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "votes delete own" ON public.proposal_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_proposal_vote_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid;
BEGIN
  pid := COALESCE(NEW.proposal_id, OLD.proposal_id);
  UPDATE public.generated_activity_proposals p
  SET vote_count = (SELECT COUNT(*) FROM public.proposal_votes v WHERE v.proposal_id = pid AND v.vote > 0),
      status = CASE WHEN p.status = 'voting' AND (SELECT COUNT(*) FROM public.proposal_votes v WHERE v.proposal_id = pid AND v.vote > 0) >= p.vote_threshold THEN 'threshold_met'::public.proposal_status ELSE p.status END,
      updated_at = now()
  WHERE p.id = pid;
  RETURN NULL;
END; $$;
CREATE TRIGGER proposal_votes_sync AFTER INSERT OR UPDATE OR DELETE ON public.proposal_votes
FOR EACH ROW EXECUTE FUNCTION public.sync_proposal_vote_count();

-- 7. Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'ngo',
  description text,
  locality_id uuid REFERENCES public.localities(id) ON DELETE SET NULL,
  city text,
  website text,
  contact_email text,
  contact_phone text,
  logo_url text,
  registration_number text,
  status public.org_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs read" ON public.organizations FOR SELECT TO authenticated USING (status = 'verified' OR owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "orgs insert" ON public.organizations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "orgs update" ON public.organizations FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "orgs delete" ON public.organizations FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  org_role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read" ON public.organization_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "org members write" ON public.organization_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.is_staff(auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.is_staff(auth.uid()));

-- 8. Professional credentials
CREATE TABLE public.professional_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  document_url text,
  issued_on date,
  expires_on date,
  state public.verification_state NOT NULL DEFAULT 'pending',
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_credentials TO authenticated;
GRANT ALL ON public.professional_credentials TO service_role;
ALTER TABLE public.professional_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "creds own read" ON public.professional_credentials FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "creds own insert" ON public.professional_credentials FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "creds update" ON public.professional_credentials FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "creds delete" ON public.professional_credentials FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));

-- 9. Perks
CREATE TABLE public.perks_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  locality_id uuid REFERENCES public.localities(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  discount_label text,
  code text,
  image_url text,
  terms text,
  starts_on date,
  ends_on date,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  status public.perk_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perks_offers TO authenticated;
GRANT ALL ON public.perks_offers TO service_role;
ALTER TABLE public.perks_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perks read" ON public.perks_offers FOR SELECT TO authenticated USING (status = 'approved' OR owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "perks insert" ON public.perks_offers FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "perks update" ON public.perks_offers FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "perks delete" ON public.perks_offers FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.perk_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perk_id uuid NOT NULL REFERENCES public.perks_offers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (perk_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.perk_redemptions TO authenticated;
GRANT ALL ON public.perk_redemptions TO service_role;
ALTER TABLE public.perk_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redemptions own read" ON public.perk_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.perks_offers p WHERE p.id = perk_id AND p.owner_id = auth.uid()));
CREATE POLICY "redemptions own insert" ON public.perk_redemptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "redemptions own delete" ON public.perk_redemptions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 10. Memorabilia
CREATE TABLE public.memorabilia_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  locality_id uuid REFERENCES public.localities(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  image_url text,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memorabilia_listings TO authenticated;
GRANT ALL ON public.memorabilia_listings TO service_role;
ALTER TABLE public.memorabilia_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memorabilia read" ON public.memorabilia_listings FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid() OR public.is_moderator(auth.uid()));
CREATE POLICY "memorabilia insert" ON public.memorabilia_listings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "memorabilia update" ON public.memorabilia_listings FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_moderator(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_moderator(auth.uid()));
CREATE POLICY "memorabilia delete" ON public.memorabilia_listings FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_moderator(auth.uid()));

-- 11. Reports / moderation
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  subject_table text NOT NULL,
  subject_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status public.report_status NOT NULL DEFAULT 'open',
  triage_label text,
  triage_confidence numeric,
  decision text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports read" ON public.content_reports FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.is_moderator(auth.uid()));
CREATE POLICY "reports insert" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "reports moderate" ON public.content_reports FOR UPDATE TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_moderator(auth.uid()));

-- 12. Configuration domains
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings staff" ON public.app_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  label text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags read" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "flags staff write" ON public.feature_flags FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.feature_toggle_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text NOT NULL REFERENCES public.feature_flags(key) ON DELETE CASCADE,
  scope_kind text NOT NULL,
  scope_id uuid,
  enabled boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (flag_key, scope_kind, scope_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_toggle_overrides TO authenticated;
GRANT ALL ON public.feature_toggle_overrides TO service_role;
ALTER TABLE public.feature_toggle_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overrides read" ON public.feature_toggle_overrides FOR SELECT TO authenticated USING (true);
CREATE POLICY "overrides staff write" ON public.feature_toggle_overrides FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.ai_provider_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature text NOT NULL UNIQUE,
  primary_provider text NOT NULL DEFAULT 'lovable',
  primary_model text NOT NULL DEFAULT 'openai/gpt-5.6-sol',
  fallback_provider text,
  fallback_model text,
  enabled boolean NOT NULL DEFAULT true,
  rate_limit_per_min integer,
  monthly_spend_cap_cents integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_settings TO authenticated;
GRANT ALL ON public.ai_provider_settings TO service_role;
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai settings staff" ON public.ai_provider_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.localization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL UNIQUE,
  label text NOT NULL,
  native_label text,
  enabled boolean NOT NULL DEFAULT true,
  coverage_percent integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.localization_settings TO anon, authenticated;
GRANT ALL ON public.localization_settings TO service_role;
ALTER TABLE public.localization_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locales read" ON public.localization_settings FOR SELECT USING (true);
CREATE POLICY "locales staff write" ON public.localization_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.event_generation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid REFERENCES public.localities(id) ON DELETE CASCADE,
  radius_bands numeric[] NOT NULL DEFAULT '{1,3,5}',
  threshold_multiplier numeric NOT NULL DEFAULT 0.2,
  min_threshold integer NOT NULL DEFAULT 5,
  voting_window_days integer NOT NULL DEFAULT 14,
  slate_size integer NOT NULL DEFAULT 5,
  auto_publish boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locality_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_generation_rules TO authenticated;
GRANT ALL ON public.event_generation_rules TO service_role;
ALTER TABLE public.event_generation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gen rules staff" ON public.event_generation_rules FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.sponsorship_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  placements text[] NOT NULL DEFAULT '{}',
  duration_days integer NOT NULL DEFAULT 30,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsorship_packages TO authenticated;
GRANT ALL ON public.sponsorship_packages TO service_role;
ALTER TABLE public.sponsorship_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages read" ON public.sponsorship_packages FOR SELECT TO authenticated USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "packages staff write" ON public.sponsorship_packages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rate_percent numeric NOT NULL DEFAULT 10,
  floor_cents integer NOT NULL DEFAULT 0,
  cap_cents integer,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.commission_rules TO authenticated;
GRANT ALL ON public.commission_rules TO service_role;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission staff" ON public.commission_rules FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "commission staff insert" ON public.commission_rules FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.content_moderation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_moderation_settings TO authenticated;
GRANT ALL ON public.content_moderation_settings TO service_role;
ALTER TABLE public.content_moderation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mod settings staff" ON public.content_moderation_settings FOR ALL TO authenticated USING (public.is_moderator(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  domain text NOT NULL,
  action text NOT NULL,
  target_id text,
  before_value jsonb,
  after_value jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit staff read" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "audit staff insert" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 13. Column extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS accessibility_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS locality_id uuid,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS age_band text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS voice_first_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'host',
  ADD COLUMN IF NOT EXISTS proposal_id uuid,
  ADD COLUMN IF NOT EXISTS circle_id uuid,
  ADD COLUMN IF NOT EXISTS organization_id uuid,
  ADD COLUMN IF NOT EXISTS locality_id uuid,
  ADD COLUMN IF NOT EXISTS accessibility_attributes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS indoor_outdoor text,
  ADD COLUMN IF NOT EXISTS min_attendance integer,
  ADD COLUMN IF NOT EXISTS external_source text;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS accessibility_attributes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS organization_id uuid,
  ADD COLUMN IF NOT EXISTS locality_id uuid;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS verification_state public.verification_state NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS background_check_state public.verification_state NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS languages_spoken text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rate_card jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS locality_id uuid;

-- 14. updated_at triggers
CREATE TRIGGER localities_updated BEFORE UPDATE ON public.localities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER circles_updated BEFORE UPDATE ON public.circles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER proposals_updated BEFORE UPDATE ON public.generated_activity_proposals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orgs_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER creds_updated BEFORE UPDATE ON public.professional_credentials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER perks_updated BEFORE UPDATE ON public.perks_offers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER memorabilia_updated BEFORE UPDATE ON public.memorabilia_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reports_updated BEFORE UPDATE ON public.content_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER app_settings_updated BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER flags_updated BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER overrides_updated BEFORE UPDATE ON public.feature_toggle_overrides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ai_settings_updated BEFORE UPDATE ON public.ai_provider_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER locales_updated BEFORE UPDATE ON public.localization_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER gen_rules_updated BEFORE UPDATE ON public.event_generation_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER packages_updated BEFORE UPDATE ON public.sponsorship_packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER mod_settings_updated BEFORE UPDATE ON public.content_moderation_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orgmembers_noop BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();