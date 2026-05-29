/**
 * Vercel Serverless Function — PawsAdopt API
 *
 * 所有 /api/* 请求由该函数统一处理。
 * 本地开发请使用 server/index.ts（tsx watch server/index.ts）。
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Supabase 客户端 — 环境变量由 Vercel 注入
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing — API will return 500');
  }
} catch (err) {
  console.error('⚠️ Failed to create Supabase client:', err.message);
}

// ===== 健康检查 =====
app.get('/api', (_req, res) => {
  res.json({
    status: supabase ? 'healthy' : 'degraded',
    hasSupabase: !!supabase,
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
    nodeVersion: process.version,
  });
});

// ===== Auth 中间件 =====
app.use(async (req, _res, next) => {
  if (!supabase) return next();
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = { id: user.id, email: user.email };
      }
    } catch {
      // token 无效，忽略（公开接口仍可访问）
    }
  }
  next();
});

// 如果 Supabase 不可用，所有数据接口返回 500
function requireSupabase(_req, res, next) {
  if (!supabase) return res.status(500).json({ error: 'Database not configured' });
  next();
}

// ===== 公开只读 =====

app.get('/api/pets', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase.from('pets').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get('/api/shelters', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase.from('shelters').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get('/api/chats', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase.from('chats').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// ===== 放养区 =====

app.get('/api/listings', requireSupabase, async (_req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.post('/api/listings', requireSupabase, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录再发布放养' });
  }

  const { name, breed, age, gender, description, image, contact } = req.body;

  const missing = [];
  if (!name?.trim()) missing.push('name');
  if (!breed?.trim()) missing.push('breed');
  if (!age?.trim()) missing.push('age');
  if (!description?.trim()) missing.push('description');
  if (!contact?.trim()) missing.push('contact');
  if (missing.length > 0) {
    return res.status(400).json({ error: `缺少必填字段: ${missing.join(', ')}` });
  }

  const id = 'list_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
  const newListing = {
    id,
    name: name.trim(),
    breed: breed.trim(),
    age: age.trim(),
    gender: gender || 'male',
    description: description.trim(),
    image: image || 'https://images.unsplash.com/photo-1543852786-1cf6534b8b4d?auto=format&fit=crop&q=80&w=1000',
    contact: contact.trim(),
    owner_id: req.user.id,
    owner_email: req.user.email,
    status: 'available',
    // created_at 由数据库 DEFAULT NOW() 自动生成
  };

  const { data, error } = await supabase.from('listings').insert([newListing]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data: data[0] });
});

app.put('/api/listings/:id', requireSupabase, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  const { status } = req.body;
  if (!['available', 'adopted'].includes(status)) {
    return res.status(400).json({ error: 'status 必须是 available 或 adopted' });
  }

  // 验证所有权
  const { data: existing } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: '放养记录不存在' });
  if (existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: '只能修改自己发布的放养' });
  }

  const { data, error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', req.params.id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data[0] });
});

app.delete('/api/listings/:id', requireSupabase, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  // 验证所有权
  const { data: existing } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) return res.status(404).json({ error: '放养记录不存在' });
  if (existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: '只能删除自己发布的放养' });
  }

  const { error } = await supabase.from('listings').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: { ok: true } });
});

export default app;
