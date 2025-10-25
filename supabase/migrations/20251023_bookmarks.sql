-- =====================================================
-- BOOKMARKS/YÊU THÍCH FEATURE
-- =====================================================

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  novel_id UUID REFERENCES public.novels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, novel_id)
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho bookmarks
-- Users can view own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create own bookmarks
CREATE POLICY "Users can create own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all bookmarks
CREATE POLICY "Admins can view all bookmarks"
  ON public.bookmarks FOR SELECT
  USING (public.is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_novel_id ON public.bookmarks(novel_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- =====================================================
-- HELPER FUNCTION: Check if novel is bookmarked
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_bookmarked(
  _user_id UUID,
  _novel_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookmarks
    WHERE user_id = _user_id
      AND novel_id = _novel_id
  )
$$;

-- =====================================================
-- DEPLOYMENT NOTES
-- =====================================================
-- Sau khi chạy migration này:
-- 1. Verify table bookmarks đã tạo
-- 2. Verify RLS enabled
-- 3. Test bookmark/unbookmark từ UI
-- =====================================================

