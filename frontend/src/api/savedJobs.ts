// AI assisted development
import apiClient from './apiClient';

export interface SavedJobsResponse {
  content: any[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Save a job
export async function saveJob(jobId: string, token: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/saved-jobs/${jobId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to save job');
  }
}

// Unsave a job
export async function unsaveJob(jobId: string, token: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/saved-jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to unsave job');
  }
}

// Get all saved jobs
export async function getSavedJobs(token: string, page: number = 0, size: number = 20): Promise<SavedJobsResponse> {
  const apiUrl = `${import.meta.env.VITE_API_BASE || '/api'}/saved-jobs?page=${page}&size=${size}`;
  console.log('🌐 Fetching saved jobs from:', apiUrl);
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  console.log('📡 Saved jobs response status:', response.status);
  console.log('✅ Response ok:', response.ok);

  if (!response.ok) {
    let errorData;
    try {
      const responseText = await response.text();
      console.error('❌ Error response text:', responseText);
      errorData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      errorData = { message: `Server error: ${response.status} ${response.statusText}` };
    }
    console.error('❌ Error data:', errorData);
    throw new Error(errorData.error || errorData.message || `Failed to fetch saved jobs (${response.status})`);
  }

  const data = await response.json();
  console.log('📦 Saved jobs data received:', data);
  return data;
}

// Check if job is saved
export async function checkIfJobIsSaved(jobId: string, token: string): Promise<boolean> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/saved-jobs/check/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.isSaved || false;
}

