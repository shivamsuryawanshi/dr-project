// AI assisted development
import apiClient from './apiClient';

export interface JobsQuery {
  search?: string;
  sector?: 'government' | 'private';
  category?: string;
  location?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  speciality?: string;
  dutyType?: 'full_time' | 'part_time' | 'contract';
  featured?: boolean;
  page?: number;
  size?: number;
  sort?: string; // e.g. 'createdAt,desc'
  status?: 'active' | 'closed' | 'pending' | 'draft';
}

export async function fetchJobs(params: JobsQuery = {}) {
  try {
    const res = await apiClient.get('/jobs', {
      params: {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort || 'createdAt,desc',
      },
    });
    const data = res.data;

    // Return empty array if no content, no mock data fallback
    if (!Array.isArray(data?.content) || data.content.length === 0) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: params.page ?? 0,
        size: params.size ?? 20,
      };
    }

    return data;
  } catch (err) {
    // Return empty data on error, no mock data fallback
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: params.page ?? 0,
      size: params.size ?? 20,
    };
  }
}

export async function fetchJobsByEmployer(employerId: string, params: { status?: string; page?: number; size?: number } = {}) {
  try {
    const res = await apiClient.get(`/jobs/employer/${employerId}`, {
      params: {
        status: params.status || 'all',
        page: params.page ?? 0,
        size: params.size ?? 1000,
      },
    });
    const data = res.data;

    // Return empty array if no content
    if (!Array.isArray(data?.content) || data.content.length === 0) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: params.page ?? 0,
        size: params.size ?? 1000,
      };
    }

    return data;
  } catch (err) {
    console.error('Error fetching jobs by employer:', err);
    // Return empty data on error
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: params.page ?? 0,
      size: params.size ?? 1000,
    };
  }
}

export async function fetchJob(id: string) {
  try {
    const res = await apiClient.get(`/jobs/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function incrementJobView(id: string) {
  try {
    const res = await apiClient.post(`/jobs/${id}/view`);
    return res.data;
  } catch (error) {
    console.error('Error incrementing job view:', error);
    // Don't throw error, just log it - view increment is not critical
    return null;
  }
}

export async function fetchJobsMeta() {
  try {
    const res = await apiClient.get('/jobs/meta');
    const data = res.data;
    const categoriesArr = Array.isArray(data?.categories) ? data.categories : [];
    const locationsArr = Array.isArray(data?.locations) ? data.locations : [];
    return { categories: categoriesArr, locations: locationsArr };
  } catch {
    return { categories: [], locations: [] };
  }
}

export interface JobPayload {
  title: string;
  organization: string;
  sector: 'government' | 'private';
  category: string;
  location: string;
  qualification: string;
  experience: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  speciality?: string;
  dutyType?: 'full_time' | 'part_time' | 'contract';
  numberOfPosts?: number;
  salary?: string;
  description: string;
  lastDate: string; // yyyy-MM-dd
  pdfUrl?: string;
  applyLink?: string;
  status?: 'active' | 'closed' | 'pending' | 'draft';
  featured?: boolean;
  views?: number;
  applications?: number;
  contactEmail?: string;
  contactPhone?: string;
  type?: 'hospital' | 'consultancy' | 'hr' | string;
}

export async function createJob(payload: JobPayload) {
  // The token is now added automatically by the interceptor
  const res = await apiClient.post('/jobs', payload);
  return res.data;
}

export async function updateJob(id: string, payload: Partial<JobPayload>) {
  const res = await apiClient.put(`/jobs/${id}`, payload);
  return res.data;
}

export async function deleteJob(id: string) {
  await apiClient.delete(`/jobs/${id}`);
}
