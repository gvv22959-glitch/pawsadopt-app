import { Pet, Shelter, ChatSession, Listing } from './types';
import { supabase } from './lib/supabase';

// 开发环境走本地 Express（端口 4000），生产环境走 Vercel Serverless（同源 /api）
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : '/api';

// 获取当前用户的 Supabase access_token，用于后端认证
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch {
    // 未登录或获取 token 失败时，不传 Authorization header
  }
  return headers;
}

// 统一的响应解析：后端返回 { data: ... } 格式
async function unwrap<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  const json = await response.json();
  return json.data as T;
}

export const api = {
  // ===== 宠物 / 救助站 / 聊天 =====

  async getPets(): Promise<Pet[]> {
    const response = await fetch(`${API_BASE_URL}/pets`);
    return unwrap<Pet[]>(response);
  },

  async getShelters(): Promise<Shelter[]> {
    const response = await fetch(`${API_BASE_URL}/shelters`);
    return unwrap<Shelter[]>(response);
  },

  async getChats(): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE_URL}/chats`);
    return unwrap<ChatSession[]>(response);
  },

  // ===== 放养区 =====

  async getListings(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      headers: await getAuthHeaders(),
    });
    return unwrap<Listing[]>(response);
  },

  async createListing(listing: {
    name: string;
    breed: string;
    age: string;
    gender: 'male' | 'female';
    description: string;
    image?: string;
    contact: string;
  }): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(listing),
    });
    return unwrap<Listing>(response);
  },

  async updateListingStatus(id: string, status: 'available' | 'adopted'): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return unwrap<Listing>(response);
  },

  async deleteListing(id: string): Promise<{ ok: boolean }> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return unwrap<{ ok: boolean }>(response);
  },
};
