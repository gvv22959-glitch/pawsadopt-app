-- ============================================
-- PawsAdopt - 放养区表（宠物版闲鱼）
-- ============================================

-- 创建放养记录表
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    description TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL DEFAULT '',
    owner_id TEXT NOT NULL DEFAULT '',
    owner_email TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'adopted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 开启行级安全
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 1. 所有人可查看（包括未登录）
DROP POLICY IF EXISTS "所有人可查看放养记录" ON public.listings;
CREATE POLICY "所有人可查看放养记录" ON public.listings
    FOR SELECT
    USING (true);

-- 2. 已登录用户可发布
DROP POLICY IF EXISTS "已登录用户可发布放养" ON public.listings;
CREATE POLICY "已登录用户可发布放养" ON public.listings
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 3. 用户可更新自己的放养
DROP POLICY IF EXISTS "用户可更新自己的放养" ON public.listings;
CREATE POLICY "用户可更新自己的放养" ON public.listings
    FOR UPDATE TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- 4. 用户可删除自己的放养
DROP POLICY IF EXISTS "用户可删除自己的放养" ON public.listings;
CREATE POLICY "用户可删除自己的放养" ON public.listings
    FOR DELETE TO authenticated
    USING (owner_id = auth.uid());
