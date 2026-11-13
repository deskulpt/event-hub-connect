DROP POLICY IF EXISTS "Signed-in users can read reviews" ON public.reviews;
CREATE POLICY "Read reviews of published listings or own" ON public.reviews
FOR SELECT TO authenticated
USING (
  author_id = auth.uid()
  OR public.is_staff(auth.uid())
  OR (subject_kind = 'venue' AND EXISTS (SELECT 1 FROM public.venues v WHERE v.id = reviews.subject_id AND (v.published OR v.owner_id = auth.uid())))
  OR (subject_kind = 'vendor' AND EXISTS (SELECT 1 FROM public.vendors d WHERE d.id = reviews.subject_id AND (d.published OR d.owner_id = auth.uid())))
);
DROP POLICY IF EXISTS "flags read" ON public.feature_flags;
CREATE POLICY "Staff can read flags" ON public.feature_flags
FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));