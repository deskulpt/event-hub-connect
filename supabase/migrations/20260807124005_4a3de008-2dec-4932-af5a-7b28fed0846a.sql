CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members m
    WHERE m.circle_id = _circle_id AND m.user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.circles c
    WHERE c.id = _circle_id AND c.owner_id = _user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_circle_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_circle_member(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "circle members read" ON public.circle_members;
CREATE POLICY "circle members read scoped"
ON public.circle_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_circle_member(circle_id, auth.uid())
  OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "overrides read" ON public.feature_toggle_overrides;
CREATE POLICY "overrides staff read"
ON public.feature_toggle_overrides FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "proposals read" ON public.generated_activity_proposals;
CREATE POLICY "proposals read scoped"
ON public.generated_activity_proposals FOR SELECT TO authenticated
USING (
  public.is_staff(auth.uid())
  OR claimed_by = auth.uid()
  OR (circle_id IS NULL)
  OR public.is_circle_member(circle_id, auth.uid())
);

DROP POLICY IF EXISTS "votes read" ON public.proposal_votes;
CREATE POLICY "votes read own"
ON public.proposal_votes FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Signed-in users can read reviews"
ON public.reviews FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public read invites" ON storage.objects;
CREATE POLICY "Owners read own invite files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'invites' AND (auth.uid())::text = (storage.foldername(name))[1]);