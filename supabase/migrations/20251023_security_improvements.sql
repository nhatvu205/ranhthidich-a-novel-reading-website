-- =====================================================
-- SECURITY IMPROVEMENTS & ADMIN BOOTSTRAP
-- =====================================================
-- This migration improves security and adds admin bootstrap mechanism
-- Run this AFTER the initial migration

-- =====================================================
-- 1. CREATE ADMIN BOOTSTRAP FUNCTION
-- =====================================================
-- This function allows setting the FIRST admin user
-- It can only be called if no admin exists yet
-- Should be called from Supabase Dashboard SQL Editor ONLY

CREATE OR REPLACE FUNCTION public.bootstrap_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
  admin_count INTEGER;
BEGIN
  -- Check if any admin already exists
  SELECT COUNT(*) INTO admin_count
  FROM user_roles
  WHERE role = 'admin';
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Admin already exists. Cannot bootstrap.';
  END IF;
  
  -- Find user by email
  SELECT id INTO user_id
  FROM profiles
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Create admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, 'admin');
  
  RETURN 'Successfully set ' || user_email || ' as admin';
END;
$$;

-- Grant execute permission only to authenticated users (will be called from dashboard)
GRANT EXECUTE ON FUNCTION public.bootstrap_admin(TEXT) TO authenticated;

-- =====================================================
-- 2. IMPROVE RLS POLICIES FOR PROFILES
-- =====================================================

-- Drop old policy if exists and recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 3. IMPROVE USER_ROLES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Users can view own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can assign roles (but NOT to themselves)
CREATE POLICY "Admins can assign roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    AND user_id != auth.uid()
  );

-- Admins can revoke roles (but NOT their own admin role)
CREATE POLICY "Admins can revoke roles"
  ON public.user_roles FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    AND NOT (user_id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- 4. ADD AUDIT LOGGING
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 5. ADD TRIGGER FOR AUDIT LOGGING ON NOVELS
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_novel_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, 'novels', OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, 'novels', NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, 'novels', NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER novels_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.novels
  FOR EACH ROW EXECUTE FUNCTION public.log_novel_changes();

-- =====================================================
-- 6. ADD RATE LIMITING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, action, window_start)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System manages rate limits"
  ON public.rate_limits FOR ALL
  USING (false);

-- =====================================================
-- 7. IMPROVE NOVELS & CHAPTERS POLICIES
-- =====================================================

-- Add policy for authenticated users to view novels (more specific)
DROP POLICY IF EXISTS "Anyone can view novels" ON public.novels;
CREATE POLICY "Public can view published novels"
  ON public.novels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can view chapters" ON public.chapters;
CREATE POLICY "Public can view published chapters"
  ON public.chapters FOR SELECT
  USING (true);

-- =====================================================
-- 8. ADD STORAGE POLICIES PREPARATION
-- =====================================================
-- Note: Storage buckets need to be created in Supabase Dashboard
-- But we prepare the helper function

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- =====================================================
-- 9. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON public.chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON public.chapters(chapter_number);
CREATE INDEX IF NOT EXISTS idx_novels_created_at ON public.novels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- =====================================================
-- DEPLOYMENT NOTES
-- =====================================================
-- After running this migration:
-- 1. Create first admin user by running in SQL Editor:
--    SELECT public.bootstrap_admin('your-email@example.com');
-- 2. Create storage buckets:
--    - novel-covers (public)
--    - user-avatars (public)
-- 3. Set up storage policies in Dashboard
-- 4. Verify RLS is enabled on all tables
-- =====================================================

