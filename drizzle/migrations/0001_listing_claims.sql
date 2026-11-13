ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS claim_status text NOT NULL DEFAULT 'claimed', ADD COLUMN IF NOT EXISTS source text, ADD COLUMN IF NOT EXISTS website text, ADD COLUMN IF NOT EXISTS phone text, ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS claim_status text NOT NULL DEFAULT 'claimed', ADD COLUMN IF NOT EXISTS source text, ADD COLUMN IF NOT EXISTS website text, ADD COLUMN IF NOT EXISTS phone text, ADD COLUMN IF NOT EXISTS address text;

CREATE TABLE public.listing_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  listing_kind text NOT NULL CHECK (listing_kind IN ('venue','vendor')),
  claimant_id uuid NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  role_at_business text,
  proof_note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, claimant_id)
);
GRANT SELECT, INSERT ON public.listing_claims TO authenticated;
GRANT ALL ON public.listing_claims TO service_role;
ALTER TABLE public.listing_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claimant inserts own claim" ON public.listing_claims FOR INSERT TO authenticated WITH CHECK (claimant_id = auth.uid());
CREATE POLICY "claimant or staff reads" ON public.listing_claims FOR SELECT TO authenticated USING (claimant_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff updates claims" ON public.listing_claims FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER listing_claims_updated BEFORE UPDATE ON public.listing_claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.approve_listing_claim(_claim_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.listing_claims;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'not allowed'; END IF;
  SELECT * INTO c FROM public.listing_claims WHERE id = _claim_id FOR UPDATE;
  IF c.id IS NULL OR c.status <> 'pending' THEN RAISE EXCEPTION 'claim not pending'; END IF;
  IF c.listing_kind = 'venue' THEN
    UPDATE public.venues SET owner_id = c.claimant_id, claim_status = 'claimed' WHERE id = c.listing_id;
  ELSE
    UPDATE public.vendors SET owner_id = c.claimant_id, claim_status = 'claimed' WHERE id = c.listing_id;
  END IF;
  UPDATE public.listing_claims SET status = 'approved' WHERE id = _claim_id;
  UPDATE public.listing_claims SET status = 'rejected' WHERE listing_id = c.listing_id AND id <> _claim_id AND status = 'pending';
END $$;
REVOKE EXECUTE ON FUNCTION public.approve_listing_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_listing_claim(uuid) TO authenticated;