import apiClient from './apiClient';

export type PulseType = 'GOVT' | 'PRIVATE' | 'EXAM' | 'DEADLINE' | 'UPDATE';

export interface PulseUpdate {
  id: string;
  title: string;
  type: PulseType;
  date: string;
  breaking?: boolean;
  createdAt?: string;
}

// AI assisted development
export async function fetchPulseUpdates(): Promise<PulseUpdate[]> {
  try {
    const res = await apiClient.get('/news/pulse');
    const data = res.data;
    if (Array.isArray(data) && data.length > 0) return data;
    return [];
  } catch {
    return [];
  }
}

// Admin: Get all news updates
export async function fetchAllNews(): Promise<PulseUpdate[]> {
  try {
    const res = await apiClient.get('/news');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

// Admin: Create news
export interface NewsPayload {
  title: string;
  type: PulseType;
  date: string; // yyyy-MM-dd
  breaking?: boolean;
}

export async function createNews(payload: NewsPayload): Promise<PulseUpdate> {
  const res = await apiClient.post('/news', payload);
  return res.data;
}

// Admin: Update news
export async function updateNews(id: string, payload: Partial<NewsPayload>): Promise<PulseUpdate> {
  const res = await apiClient.put(`/news/${id}`, payload);
  return res.data;
}

// Admin: Delete news
export async function deleteNews(id: string): Promise<void> {
  await apiClient.delete(`/news/${id}`);
}