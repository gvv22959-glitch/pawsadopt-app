-- ============================================
-- PawsAdopt - 功能闭环核心表
-- 创建于 2026-06-01
-- ============================================

-- 1. 消息表（支持聊天持久化）
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 领养申请表
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    applicant_id TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    housing_type TEXT DEFAULT '',
    note TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 收藏表
CREATE TABLE IF NOT EXISTS public.favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    pet_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- 4. 搜索历史表
CREATE TABLE IF NOT EXISTS public.search_history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. pets 表增加来源字段（区分官方宠物 vs 用户发布）
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'official';
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS source_listing_id TEXT;

-- 6. chats 表增加业务关联字段
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS pet_id TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS listing_id TEXT;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS participant_ids JSONB DEFAULT '[]'::jsonb;

-- ===== RLS 策略 =====

-- messages: 所有人可查看，认证用户可创建
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "所有人可查看消息" ON public.messages;
CREATE POLICY "所有人可查看消息" ON public.messages
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "认证用户可发送消息" ON public.messages;
CREATE POLICY "认证用户可发送消息" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- applications: 认证用户可创建，本人可查看/修改
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "认证用户可提交申请" ON public.applications;
CREATE POLICY "认证用户可提交申请" ON public.applications
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "用户可查看自己的申请" ON public.applications;
CREATE POLICY "用户可查看自己的申请" ON public.applications
    FOR SELECT TO authenticated
    USING (applicant_id = auth.uid()::text);

DROP POLICY IF EXISTS "用户可修改自己的申请" ON public.applications;
CREATE POLICY "用户可修改自己的申请" ON public.applications
    FOR UPDATE TO authenticated
    USING (applicant_id = auth.uid()::text);

-- favorites: 认证用户完整管理自己的收藏
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "认证用户可管理收藏" ON public.favorites;
CREATE POLICY "认证用户可管理收藏" ON public.favorites
    FOR ALL TO authenticated
    USING (user_id = auth.uid()::text);

-- search_history: 认证用户管理自己的搜索历史
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "认证用户可管理搜索历史" ON public.search_history;
CREATE POLICY "认证用户可管理搜索历史" ON public.search_history
    FOR ALL TO authenticated
    USING (user_id = auth.uid()::text);
