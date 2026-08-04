-- 1. user_roles: block self-assignment / self-deletion
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own roles" ON public.user_roles;

CREATE POLICY "Admins manage roles insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.claim_self_service_role(_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _role::text NOT IN ('host','pro','business','member','volunteer_host','professional','sponsor') THEN
    RAISE EXCEPTION 'role not self-assignable';
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_self_service_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_self_service_role(public.app_role) TO authenticated;

-- 2. event_invites: no blanket public read
DROP POLICY IF EXISTS "Anyone can view invites by slug" ON public.event_invites;
CREATE POLICY "Owners view own invites" ON public.event_invites
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.get_invite_by_slug(_slug text)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  slug text,
  headline text,
  copy text,
  image_url text,
  rsvp_enabled boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.event_id, i.slug, i.headline, i.copy, i.image_url, i.rsvp_enabled, i.created_at
  FROM public.event_invites i
  WHERE i.slug = _slug
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_invite_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_by_slug(text) TO anon, authenticated;

-- 3. profiles: safe non-PII public lookup (no email)
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE (id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = _user_id
    AND (
      EXISTS (SELECT 1 FROM public.vendors v WHERE v.owner_id = p.id AND v.published)
      OR EXISTS (SELECT 1 FROM public.venues v WHERE v.owner_id = p.id AND v.published)
    );
$$;
REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

-- 4. lock down internal SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_proposal_vote_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_moderator(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator(uuid) TO authenticated;