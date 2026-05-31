-- Migration: 003_add_email_to_profiles
-- Description: Add email column to user_profiles and backfill existing rows

ALTER TABLE user_profiles ADD COLUMN email TEXT;

UPDATE user_profiles
SET email = au.email
FROM auth.users au
WHERE user_profiles.id = au.id;

ALTER TABLE user_profiles ALTER COLUMN email SET NOT NULL;

-- Update the auto-create trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true
  );
  INSERT INTO public.user_preferences (user_id, theme, currency, refresh_interval)
  VALUES (NEW.id, 'dark', 'USD', 60);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
