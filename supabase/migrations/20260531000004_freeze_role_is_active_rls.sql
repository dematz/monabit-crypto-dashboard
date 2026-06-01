-- Freeze role and is_active columns in the user update RLS policy.
-- Without WITH CHECK, a user could escalate their own privileges via direct
-- Supabase REST API calls. The backend uses service_role (bypasses RLS) for
-- admin operations, so this only affects direct client access which should be
-- blocked for these sensitive columns.
-- Uses subqueries instead of OLD because OLD is not accessible in WITH CHECK.

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM user_profiles WHERE id = auth.uid())
  );