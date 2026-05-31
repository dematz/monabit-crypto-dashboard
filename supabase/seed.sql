-- Seed: create admin user profile (auth.users created via GoTrue API)
-- The trigger handle_new_user creates user_profiles + user_preferences automatically.
-- This script only upgrades the role for the admin user.
UPDATE public.user_profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@monabit.io'
);