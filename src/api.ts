import { Pet, Shelter, ChatSession } from './types';

const API_BASE_URL = 'http://localhost:4000/api';

export const api = {
  async getPets(): Promise<Pet[]> {
    const response = await fetch(`${API_BASE_URL}/pets`);
    if (!response.ok) throw new Error('Failed to fetch pets');
    return response.json();
  },

  async getShelters(): Promise<Shelter[]> {
    const response = await fetch(`${API_BASE_URL}/shelters`);
    if (!response.ok) throw new Error('Failed to fetch shelters');
    return response.json();
  },

  async getChats(): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE_URL}/chats`);
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  }
};
