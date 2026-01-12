const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export interface ApplicationPayload {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  token: string;
  resume?: File;
  notes?: string;
}

export interface ApplicationQuery {
  jobId?: string;
  candidateId?: string;
  status?: 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  jobOrganization: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resumeUrl?: string;
  status: 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  notes?: string;
  interviewDate?: string;
  appliedDate: string;
}

export async function applyForJob(payload: ApplicationPayload): Promise<ApplicationResponse> {
  const formData = new FormData();
  formData.append('jobId', payload.jobId);
  formData.append('candidateName', payload.candidateName);
  formData.append('candidateEmail', payload.candidateEmail);
  formData.append('candidatePhone', payload.candidatePhone);
  if (payload.resume) {
    formData.append('resume', payload.resume);
  }
  if (payload.notes) {
    formData.append('notes', payload.notes);
  }

  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${payload.token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to apply for job (${res.status})`);
  return res.json();
}

export async function fetchApplications(params: ApplicationQuery = {}, token: string) {
  const qs = new URLSearchParams();
  if (params.jobId) qs.set('jobId', params.jobId);
  if (params.candidateId) qs.set('candidateId', params.candidateId);
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 20));
  qs.set('sort', params.sort || 'appliedDate,desc');

  const res = await fetch(`${API_BASE}/applications?${qs.toString()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch applications (${res.status})`);
  return res.json();
}

export async function updateApplicationStatus(id: string, status: string, token: string, notes?: string, interviewDate?: string | null) {
  const payload: any = { status };
  if (notes) payload.notes = notes;
  if (interviewDate) payload.interviewDate = interviewDate;

  const res = await fetch(`${API_BASE}/applications/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update application status (${res.status})`);
  return res.json();
}

export async function deleteApplication(id: string) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete application (${res.status})`);
}
