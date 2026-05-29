import { createClient } from '@supabase/supabase-js';

// Supabase 公开配置 — 硬编码以避免 Vercel 构建时 env 读取失败
const supabaseUrl = 'https://mbhobdxttemgeajzxtuo.supabase.co';
const supabaseAnonKey = 'sb_publishable_toGpiWCCVs-7kiWJH-nVZA_ZE8yHAyK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string | undefined;
};
