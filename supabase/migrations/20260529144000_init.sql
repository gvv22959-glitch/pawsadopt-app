-- supabase_setup.sql
-- Create tables for PawsAdopt App

-- 1. Create Pets Table
CREATE TABLE IF NOT EXISTS public.pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    weight TEXT NOT NULL,
    location TEXT NOT NULL,
    distance TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL,
    "isFavorite" BOOLEAN DEFAULT false,
    "isAdopted" BOOLEAN DEFAULT false,
    health JSONB NOT NULL DEFAULT '{"vaccination": "","neutering": "","deworming": ""}'::jsonb
);

-- 2. Create Shelters Table
CREATE TABLE IF NOT EXISTS public.shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    image TEXT NOT NULL
);

-- 3. Create Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "lastMessage" TEXT NOT NULL,
    time TEXT NOT NULL,
    image TEXT NOT NULL,
    "unreadCount" INTEGER DEFAULT 0,
    online BOOLEAN DEFAULT false
);

-- Insert Initial Mock Data
-- Pets
INSERT INTO public.pets (id, name, breed, age, gender, weight, location, distance, description, image, tags, status, "isFavorite", "isAdopted", health) VALUES
('290134', '布丁', '金毛', '2岁', 'male', '25kg', '上海市 · 静安区', '2.5km', '布丁是一只非常温顺的金毛寻回犬，他有着如阳光般灿烂的性格。他是在一个雨夜被志愿者发现的，当时他正缩在公园的长椅下。经过三个月的精心照料，布丁已经恢复了健康，正期待着一个永远的家。他非常聪明，已经学会了坐下、握手等基本指令。', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1000', '["成年", "活泼好动", "亲人友善"]', '待领养', true, false, '{"vaccination": "已完成", "neutering": "已完成", "deworming": "进行中"}'),
('290135', '麻薯', '英短', '1岁', 'female', '4kg', '上海市 · 静安区', '2.4km', '文静的小公举，喜欢安静地呆在阳台上晒太阳。', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000', '["新人推荐"]', '已防疫', false, true, '{"vaccination": "已完成", "neutering": "已完成", "deworming": "已完成"}'),
('290136', '阿柴', '柴犬', '2岁', 'male', '10kg', '上海市 · 静安区', '5.8km', '永远带着笑容的治愈系柴犬，性格非常稳重。', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1000', '["治愈系"]', '新人推荐', true, false, '{"vaccination": "已完成", "neutering": "未绝育", "deworming": "已完成"}'),
('290137', '白糖', '垂耳兔', '8月', 'female', '1.5kg', '上海市 · 静安区', '3.1km', '超级可爱的长耳兔，毛茸茸的触感让人欲罢不能。', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=1000', '["软萌"]', '待领养', false, false, '{"vaccination": "不需", "neutering": "不需", "deworming": "已完成"}'),
('290138', '糯米', '比熊', '2岁', 'female', '5kg', '上海市 · 普陀区', '4.2km', '像棉花糖一样软糯的小狗，非常粘人。', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1000', '["粘人", "不掉毛"]', '领养成功', false, true, '{"vaccination": "已完成", "neutering": "已完成", "deworming": "已完成"}')
ON CONFLICT (id) DO NOTHING;

-- Shelters
INSERT INTO public.shelters (id, name, type, image) VALUES
('s1', '萌宠守护站', '认证救助机构', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200')
ON CONFLICT (id) DO NOTHING;

-- Chats
INSERT INTO public.chats (id, name, "lastMessage", time, image, "unreadCount", online) VALUES
('c1', '暖心流浪狗救助站', '您申请领养的“糯米”目前状态良好，您可以预约本周六...', '10:45', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200', 2, true),
('c2', '送养人：陈女士', '非常感谢您的关注，我会把它的生活习惯文档发给您。', '昨天', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', 0, false),
('c3', '喵呜流浪猫领养中心', '领养前需要准备猫砂盆、猫抓板以及符合标准的猫粮...', '星期三', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200', 0, false),
('c4', '宠医在线专家', '既然情况已经稳定，我们可以开始进行第一针疫苗。', '星期一', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200', 0, false)
ON CONFLICT (id) DO NOTHING;
