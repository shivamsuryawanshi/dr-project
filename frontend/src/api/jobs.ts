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
    // Sanitize search parameter - trim whitespace and normalize
    const sanitizedSearch = params.search?.trim();
    const sanitizedLocation = params.location?.trim();
    
    const requestParams = {
      ...params,
      // Only include search if it has content after trimming
      search: sanitizedSearch || undefined,
      location: sanitizedLocation || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort || 'createdAt,desc',
    };
    
    // Remove undefined values to keep URL clean
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key as keyof typeof requestParams] === undefined) {
        delete requestParams[key as keyof typeof requestParams];
      }
    });
    
    // DEBUG: Log the exact parameters being sent
    console.log('=== FETCH JOBS DEBUG ===');
    console.log('Request params:', JSON.stringify(requestParams, null, 2));
    if (sanitizedSearch) {
      console.log('Search value:', `"${sanitizedSearch}"`);
      console.log('Search length:', sanitizedSearch.length);
      console.log('Search char codes:', Array.from(sanitizedSearch).map(c => c.charCodeAt(0)));
    }
    if (sanitizedLocation) {
      console.log('Location value:', `"${sanitizedLocation}"`);
      console.log('Location length:', sanitizedLocation.length);
    }
    
    const res = await apiClient.get('/jobs', { params: requestParams });
    const data = res.data;

    console.log('Response totalElements:', data?.totalElements);
    console.log('Response content length:', data?.content?.length);
    console.log('=== END FETCH JOBS DEBUG ===');

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
    console.error('Fetch jobs error:', err);
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

// Job options for dropdown (titles + companies)
export interface JobOptions {
  titles: string[];
  companies: string[];
}

// Fetch job options for dropdown (all distinct titles and company names)
export async function fetchJobOptions(): Promise<JobOptions> {
  try {
    const res = await apiClient.get('/jobs/options');
    
    // Debug logging
    console.log('=== FETCH JOB OPTIONS DEBUG ===');
    console.log('Response data:', res.data);
    console.log('Titles count:', res.data?.titles?.length || 0);
    console.log('Companies count:', res.data?.companies?.length || 0);
    console.log('Active jobs count:', res.data?._debug_activeJobsCount);
    
    if (res.data?.titles?.length > 0) {
      console.log('Sample titles:', res.data.titles.slice(0, 5));
    }
    if (res.data?.companies?.length > 0) {
      console.log('Sample companies:', res.data.companies.slice(0, 5));
    }
    console.log('=== END FETCH JOB OPTIONS DEBUG ===');
    
    return {
      titles: Array.isArray(res.data?.titles) ? res.data.titles : [],
      companies: Array.isArray(res.data?.companies) ? res.data.companies : [],
    };
  } catch (err) {
    console.error('Error fetching job options:', err);
    return { titles: [], companies: [] };
  }
}

// Debug endpoint to diagnose search issues
export async function debugSearch(query: string, location?: string): Promise<any> {
  try {
    const params: any = { q: query };
    if (location) params.location = location;
    
    const res = await apiClient.get('/jobs/debug-search', { params });
    console.log('=== DEBUG SEARCH RESULTS ===');
    console.log(JSON.stringify(res.data, null, 2));
    console.log('=== END DEBUG SEARCH ===');
    return res.data;
  } catch (err) {
    console.error('Debug search error:', err);
    return null;
  }
}
