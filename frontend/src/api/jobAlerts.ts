// AI assisted development
const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export interface JobAlertResponse {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  locations: string[];
  categories: string[];
  sectors: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  experience?: string;
  frequency: 'instant' | 'daily' | 'weekly';
  active: boolean;
  lastSent?: string;
  matches: number;
  createdAt: string;
  updatedAt?: string;
}

export interface JobAlertPayload {
  name: string;
  keywords?: string[];
  locations?: string[];
  categories?: string[];
  sectors?: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  experience?: string;
  frequency?: 'instant' | 'daily' | 'weekly';
  active?: boolean;
}

export interface JobAlertQuery {
  page?: number;
  size?: number;
}

export async function fetchJobAlerts(params: JobAlertQuery = {}, token: string): Promise<{
  content: JobAlertResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.size !== undefined) qs.set('size', String(params.size));

  const res = await fetch(`${API_BASE}/job-alerts?${qs.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job alerts (${res.status})`);
  }

  return res.json();
}

export async function getJobAlert(id: string, token: string): Promise<JobAlertResponse> {
  const res = await fetch(`${API_BASE}/job-alerts/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job alert (${res.status})`);
  }

  return res.json();
}

export async function createJobAlert(payload: JobAlertPayload, token: string): Promise<JobAlertResponse> {
  const res = await fetch(`${API_BASE}/job-alerts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create job alert (${res.status})`);
  }

  return res.json();
}

export async function updateJobAlert(
  id: string,
  payload: Partial<JobAlertPayload>,
  token: string
): Promise<JobAlertResponse> {
  const res = await fetch(`${API_BASE}/job-alerts/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update job alert (${res.status})`);
  }

  return res.json();
}

export async function deleteJobAlert(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/job-alerts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete job alert (${res.status})`);
  }
}

export async function getMatchingJobs(
  alertId: string,
  params: JobAlertQuery = {},
  token: string
): Promise<{
  content: any[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.size !== undefined) qs.set('size', String(params.size));

  const res = await fetch(`${API_BASE}/job-alerts/${alertId}/matches?${qs.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch matching jobs (${res.status})`);
  }

  return res.json();
}

