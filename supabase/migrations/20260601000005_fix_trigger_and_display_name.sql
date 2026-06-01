-- Migration 005: Security — hardcode role='user' in trigger, add full_name fallback
-- 
-- 1. The trigger now forces role='user' regardless of user_metadata.
--    Only an admin POST /users can assign a different role (via the profile UPDATE).
-- 2. Adds full_name as a fallback for display_name (Google OAuth provides full_name, not display_name).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'user',
    true
  );
  INSERT INTO public.user_preferences (user_id, theme, currency, refresh_interval)
  VALUES (NEW.id, 'dark', 'USD', 60);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;