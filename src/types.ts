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
}
