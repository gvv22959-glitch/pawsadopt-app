import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing. Make sure to set them in .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== Auth Middleware =====
// 从 Authorization header 提取用户身份，附加到 req.user
app.use(async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.user = { id: user.id, email: user.email };
    }
  }
  // 不阻断请求 — 公开接口不需要强制登录
  next();
});

// ===== 公开只读接口 =====

app.get('/api/pets', async (_req, res) => {
  const { data, error } = await supabase.from('pets').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get('/api/shelters', async (_req, res) => {
  const { data, error } = await supabase.from('shelters').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

app.get('/api/chats', async (_req, res) => {
  const { data, error } = await supabase.from('chats').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// ===== 放养区 API =====

// 所有人可查看放养列表（不需要登录）
app.get('/api/listings', async (_req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// 发布放养（需要登录，用户身份由 token 决定，不信任客户端 owner_id）
app.post('/api/listings', async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录再发布放养' });
  }

  const { name, breed, age, gender, description, image, contact } = req.body;

  // 基础字段校验
  const missing = [];
  if (!name?.trim()) missing.push('name');
  if (!breed?.trim()) missing.push('breed');
  if (!age?.trim()) missing.push('age');
  if (!description?.trim()) missing.push('description');
  if (!contact?.trim()) missing.push('contact');
  if (missing.length > 0) {
    return res.status(400).json({ error: `缺少必填字段: ${missing.join(', ')}` });
  }

  const id = 'list_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  const { data, error } = await supabase
    .from('listings')
    .insert([{
      id,
      name: name.trim(),
      breed: breed.trim(),
      age: age.trim(),
      gender: gender || 'male',
      description: description.trim(),
      image: image || 'https://images.unsplash.com/photo-1543852786-1cf6534b8b4d?auto=format&fit=crop&q=80&w=1000',
      contact: contact.trim(),
      owner_id: req.user.id,       // ← 由服务端从 token 提取
      owner_email: req.user.email, // ← 由服务端从 token 提取
      status: 'available',
      // created_at 由数据库 DEFAULT NOW() 自动生成，不需要客户端传
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data: data[0] });
});

// 更新放养状态（需要登录，且只能改自己的）
app.put('/api/listings/:id', async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  const { status } = req.body;
  if (!['available', 'adopted'].includes(status)) {
    return res.status(400).json({ error: 'status 必须是 available 或 adopted' });
  }

  // 先查出这条记录，确认是本人的
  const { data: existing } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) {
    return res.status(404).json({ error: '放养记录不存在' });
  }
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

// 删除放养（需要登录，且只能删自己的）
app.delete('/api/listings/:id', async (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '请先登录' });
  }

  // 先查出这条记录，确认是本人的
  const { data: existing } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', req.params.id)
    .single();

  if (!existing) {
    return res.status(404).json({ error: '放养记录不存在' });
  }
  if (existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: '只能删除自己发布的放养' });
  }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: { ok: true } });
});

// ===== AI 领养顾问（Gemini） =====
app.post('/api/ai/ask', async (req: any, res) => {
  const { pet, question } = req.body;
  if (!pet || !question) {
    return res.status(400).json({ error: '缺少 pet 或 question 参数' });
  }

  try {
    // 使用 Google Gemini API
    const { GoogleGenAI } = await import('@google/genai');
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const prompt = `你是一位专业的宠物领养顾问。请你根据以下宠物信息，用中文回答用户的问题。

宠物信息：
- 名字：${pet.name}
- 品种：${pet.breed}
- 年龄：${pet.age}
- 描述：${pet.description || '无'}

用户问题：${question}

请用亲切、专业的语气回答，控制在 150 字以内。如果问题是关于领养流程、养宠建议等的通用问题，也请尽力回答。`;

    const result = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const answer = result.text || '抱歉，我暂时无法回答这个问题，请稍后再试。';
    res.json({ data: { answer } });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    res.json({ data: { answer: 'AI 顾问暂时离线，请稍后重试。您也可以直接联系救助站咨询。' } });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
