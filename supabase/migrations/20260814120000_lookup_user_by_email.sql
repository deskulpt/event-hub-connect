-- Allow org owners to resolve a member invite by email
CREATE OR REPLACE FUNCTION public.lookup_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.profiles p
  WHERE lower(p.email) = lower(trim(_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_user_id_by_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_user_id_by_email(text) TO authenticated;

COMMENT ON FUNCTION public.lookup_user_id_by_email(text) IS
  'Resolve a profile id from email for org invites; does not expose other PII.';
