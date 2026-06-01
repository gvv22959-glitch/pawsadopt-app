export interface Listing {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  description: string;
  image: string;
  contact: string;
  owner_id: string;
  owner_email: string;
  status: 'available' | 'adopted';
  created_at: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female';
  weight: string;
  location: string;
  distance: string;
  description: string;
  image: string;
  tags: string[];
  status: string;
  isFavorite?: boolean;
  isAdopted?: boolean;
  health: {
    vaccination: string;
    neutering: string;
    deworming: string;
  };
  // 数据来源：'official' = 官方/救助站, 'user' = 放养区用户发布
  sourceType?: string;
  sourceListingId?: string;
}

export interface Shelter {
  id: string;
  name: string;
  type: string;
  image: string;
}

export interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  image: string;
  unreadCount?: number;
  online?: boolean;
  // 业务关联
  petId?: string;
  listingId?: string;
  participantIds?: string[];
}

// 聊天消息（持久化到 messages 表）
export interface Message {
  id: number;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

// 领养申请
export interface Application {
  id: string;
  pet_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_phone: string;
  housing_type: string;
  note: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
