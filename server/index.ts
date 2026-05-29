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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
