-- Marital status captured on the public home preference flow
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marital_status text;

COMMENT ON COLUMN public.profiles.marital_status IS
  'Optional: single | married | partnered | widowed | prefer_not';
