DROP POLICY IF EXISTS "mod settings staff" ON public.content_moderation_settings;
CREATE POLICY "mod settings staff" ON public.content_moderation_settings
FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "creds own insert" ON public.professional_credentials;
CREATE POLICY "creds own insert" ON public.professional_credentials
FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_id AND v.owner_id = auth.uid()
  )
);