/**
 * PawsAdopt API 层
 *
 * 所有数据操作通过 Supabase 客户端进行，安全由 RLS 策略保障。
 */

import { Pet, Shelter, ChatSession, Listing, Message, Application } from './types';
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

  // ===== 图片上传 =====

  /**
   * 上传图片到 Supabase Storage，返回公开访问 URL
   * @param file 用户选择的图片文件
   * @returns 图片的公开 URL
   */
  async uploadImage(file: File): Promise<string> {
    // 文件校验
    if (file.size > 5 * 1024 * 1024) throw new Error('图片大小不能超过 5MB');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) throw new Error('仅支持 JPG、PNG、WebP、GIF 格式');

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('listings-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error(error.message);

    // 获取公开 URL
    const publicUrl = `https://mbhobdxttemgeajzxtuo.supabase.co/storage/v1/object/public/listings-images/${data.path}`;
    return publicUrl;
  },

  // ===== 数据源统一：listing ↔ pet 同步 =====

  /**
   * 发布放养后，自动在 pets 表创建一条关联记录，
   * 使放养区的宠物出现在首页列表中。
   */
  async createPetFromListing(listing: Listing): Promise<Pet> {
    const petId = 'pet_' + listing.id;
    const newPet = {
      id: petId,
      name: listing.name,
      breed: listing.breed,
      age: listing.age,
      gender: listing.gender,
      weight: '未知',
      location: '上海市',
      distance: '未知',
      description: listing.description,
      image: listing.image,
      tags: ['用户发布'],
      status: listing.status === 'available' ? '待领养' : '已领养',
      isFavorite: false,
      isAdopted: listing.status === 'adopted',
      health: { vaccination: '未知', neutering: '未知', deworming: '未知' },
      source_type: 'user',
      source_listing_id: listing.id,
    };
    const { error } = await supabase.from('pets').insert([newPet]);
    if (error) throw new Error(error.message);
    return newPet as Pet;
  },

  /**
   * 标记已领养 / 恢复待领养时，同步状态到 pets 表。
   */
  async syncListingToPet(listingId: string, status: 'available' | 'adopted'): Promise<void> {
    const petId = 'pet_' + listingId;
    const { error } = await supabase
      .from('pets')
      .update({
        status: status === 'available' ? '待领养' : '已领养',
        isAdopted: status === 'adopted',
      })
      .eq('id', petId);
    if (error) throw new Error(error.message);
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
    // 同步删除 pets 表中的关联记录
    const petId = 'pet_' + id;
    await supabase.from('pets').delete().eq('id', petId);
    return { ok: true };
  },

  // ===== 消息持久化 =====

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async sendMessage(chatId: string, text: string): Promise<Message> {
    const { data: { session } } = await supabase.auth.getSession();
    const senderId = session?.user?.id || 'guest';
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id: chatId, sender_id: senderId, text }])
      .select();
    if (error) throw new Error(error.message);
    return data![0] as Message;
  },

  // ===== 聊天会话管理 =====

  async createChat(chat: Partial<ChatSession>): Promise<ChatSession> {
    const id = chat.id || 'chat_' + Date.now();
    const { data, error } = await supabase
      .from('chats')
      .insert([{ ...chat, id }])
      .select();
    if (error) throw new Error(error.message);
    return data![0] as ChatSession;
  },

  async getOrCreateChatForListing(listing: Listing, currentUserId: string): Promise<ChatSession> {
    // 查找是否已有 chat 关联此 listing 且包含当前用户
    const { data: existing } = await supabase
      .from('chats')
      .select('*')
      .eq('listing_id', listing.id)
      .single();
    if (existing) return existing as ChatSession;

    // 创建新 chat
    const newChat = {
      id: 'chat_' + Date.now(),
      name: `${listing.name} · 与发布者的对话`,
      lastMessage: '开始聊天吧',
      time: '刚刚',
      image: listing.image,
      unreadCount: 0,
      online: true,
      listingId: listing.id,
      participantIds: [currentUserId, listing.owner_id],
    };
    return api.createChat(newChat);
  },

  async getOrCreateChatForPet(pet: Pet, currentUserId: string): Promise<ChatSession> {
    // 如果是用户发布的宠物，查找关联的 listing owner
    const { data: existing } = await supabase
      .from('chats')
      .select('*')
      .eq('pet_id', pet.id)
      .single();
    if (existing) return existing as ChatSession;

    // 确定对方 ID：如果 pet 来自 listing，则是 listing 的 owner
    let otherUserId = '';
    if (pet.sourceListingId) {
      const { data: listing } = await supabase
        .from('listings')
        .select('owner_id')
        .eq('id', pet.sourceListingId)
        .single();
      if (listing) otherUserId = listing.owner_id;
    }

    const newChat = {
      id: 'chat_' + Date.now(),
      name: `关于 ${pet.name} 的咨询`,
      lastMessage: '开始聊天吧',
      time: '刚刚',
      image: pet.image,
      unreadCount: 0,
      online: true,
      petId: pet.id,
      participantIds: otherUserId ? [currentUserId, otherUserId] : [currentUserId],
    };
    return api.createChat(newChat);
  },

  // ===== 领养申请 =====

  async submitApplication(app: {
    pet_id: string;
    applicant_name: string;
    applicant_phone: string;
    housing_type?: string;
    note?: string;
  }): Promise<Application> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('请先登录再提交申请');

    const id = 'app_' + Date.now();
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        id,
        pet_id: app.pet_id,
        applicant_id: session.user.id,
        applicant_name: app.applicant_name,
        applicant_phone: app.applicant_phone,
        housing_type: app.housing_type || '',
        note: app.note || '',
        status: 'pending',
      }])
      .select();
    if (error) throw new Error(error.message);
    return data![0] as Application;
  },

  async getApplications(): Promise<Application[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('applicant_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // ===== 收藏 =====

  async getFavorites(): Promise<Pet[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    const { data: favs } = await supabase
      .from('favorites')
      .select('pet_id')
      .eq('user_id', session.user.id);
    if (!favs?.length) return [];
    const petIds = favs.map((f: { pet_id: string }) => f.pet_id);
    const { data: pets } = await supabase.from('pets').select('*').in('id', petIds);
    return pets || [];
  },

  async toggleFavorite(petId: string, add: boolean): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    if (add) {
      await supabase.from('favorites').insert([{ user_id: session.user.id, pet_id: petId }]);
    } else {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('pet_id', petId);
    }
  },

  async isFavorite(petId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('pet_id', petId)
      .single();
    return !!data;
  },

  // ===== 搜索历史 =====

  async saveSearch(query: string): Promise<void> {
    const q = query.trim();
    if (!q) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('search_history').insert([{ user_id: session.user.id, query: q }]);
  },

  async getSearchHistory(): Promise<{ query: string }[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];
    const { data } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    return data || [];
  },

  // ===== AI 领养顾问 =====

  async askAI(petInfo: { name: string; breed: string; age: string; description: string }, question: string): Promise<string> {
    try {
      const res = await fetch('http://localhost:4000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet: petInfo, question }),
      });
      if (!res.ok) throw new Error('AI 服务暂不可用');
      const json = await res.json();
      return json.data?.answer || '暂时无法回答，请稍后再试。';
    } catch {
      return 'AI 顾问暂时离线，请稍后再试。';
    }
  },

  // ===== 文件上传 =====

  async uploadImage(file: File, bucket: string = 'listings-images'): Promise<string> {
    // 检查文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('图片大小不能超过 5MB');
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('仅支持 JPG、PNG、WebP、GIF 格式');
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // 使用 Supabase SDK 自带的 upload，自动处理鉴权和上传格式
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      // 给出更友好的错误提示
      if (error.message.includes('Bucket') || error.message.includes('not found')) {
        throw new Error('存储桶不存在，请联系管理员创建 listings-images 存储桶');
      }
      if (error.message.includes('security') || error.message.includes('permission') || error.message.includes('policy')) {
        throw new Error('没有上传权限，请检查 Storage RLS 策略');
      }
      throw new Error(error.message || '上传失败，请重试');
    }

    // 获取公开访问 URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};
