/**
 * PawsAdopt API 层
 *
 * 所有数据操作通过 Supabase 客户端进行，安全由 RLS 策略保障。
 * 本地开发可用 Express 后端（server/index.ts），但生产环境直连 Supabase。
 */

import { Pet, Shelter, ChatSession, Listing } from './types';
import { supabase } from './lib/supabase';

export const api = {
  // ===== 宠物 / 救助站 / 聊天 =====

  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase.from('pets').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getShelters(): Promise<Shelter[]> {
    const { data, error } = await supabase.from('shelters').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getChats(): Promise<ChatSession[]> {
    const { data, error } = await supabase.from('chats').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  },

  // ===== 放养区 =====

  async getListings(): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
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
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('请先登录再发布放养');

    const id = 'list_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
    const newListing = {
      id,
      name: listing.name.trim(),
      breed: listing.breed.trim(),
      age: listing.age.trim(),
      gender: listing.gender,
      description: listing.description.trim(),
      image: listing.image?.trim() || 'https://images.unsplash.com/photo-1543852786-1cf6534b8b4d?auto=format&fit=crop&q=80&w=1000',
      contact: listing.contact.trim(),
      owner_id: session.user.id,
      owner_email: session.user.email || '',
      status: 'available' as const,
    };

    const { data, error } = await supabase.from('listings').insert([newListing]).select();
    if (error) throw new Error(error.message);
    return data![0] as Listing;
  },

  async updateListingStatus(id: string, status: 'available' | 'adopted'): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('放养记录不存在');
    return data[0] as Listing;
  },

  async deleteListing(id: string): Promise<{ ok: boolean }> {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { ok: true };
  },
};
