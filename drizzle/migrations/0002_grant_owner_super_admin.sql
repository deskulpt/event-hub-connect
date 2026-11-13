CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_role_uidx ON public.user_roles (user_id, role);
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, r.role::public.app_role FROM public.profiles p
CROSS JOIN (VALUES ('super_admin'), ('admin')) AS r(role)
WHERE lower(p.email) = 'anand2064@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;