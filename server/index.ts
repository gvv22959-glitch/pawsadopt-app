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

app.get('/api/pets', async (req, res) => {
  const { data, error } = await supabase.from('pets').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.get('/api/shelters', async (req, res) => {
  const { data, error } = await supabase.from('shelters').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.get('/api/chats', async (req, res) => {
  const { data, error } = await supabase.from('chats').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// --- 放养区 API ---

app.get('/api/listings', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post('/api/listings', async (req, res) => {
  const { id, name, breed, age, gender, description, image, contact, owner_id, owner_email } = req.body;
  const { data, error } = await supabase
    .from('listings')
    .insert([{
      id, name, breed, age, gender, description,
      image: image || '',
      contact: contact || '',
      owner_id: owner_id || '',
      owner_email: owner_email || '',
      status: 'available',
    }])
    .select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data[0]);
});

app.put('/api/listings/:id', async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', req.params.id)
    .select();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data[0]);
});

app.delete('/api/listings/:id', async (req, res) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', req.params.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
