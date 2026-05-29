import { Pet, Shelter, ChatSession, Listing } from './types';

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
  },

  // 放养区
  async getListings(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/listings`);
    if (!response.ok) throw new Error('Failed to fetch listings');
    return response.json();
  },

  async createListing(listing: Omit<Listing, 'id' | 'created_at'>): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });
    if (!response.ok) throw new Error('Failed to create listing');
    return response.json();
  },

  async updateListingStatus(id: string, status: 'available' | 'adopted'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update listing');
  },

  async deleteListing(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete listing');
  }
};
