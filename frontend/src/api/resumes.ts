// AI assisted development
import apiClient from './apiClient';

export interface ResumeResponse {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  applicationId?: string;
  applicationStatus?: string;
  appliedDate?: string;
}

export interface ResumesListResponse {
  jobId: string;
  resumes: ResumeResponse[];
  count: number;
}

export interface MyResumeResponse {
  jobId: string;
  resume: ResumeResponse | null;
  hasResume: boolean;
}

export async function uploadResume(jobId: string, file: File, token: string): Promise<ResumeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post(`/jobs/${jobId}/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getResumes(jobId: string, token: string): Promise<ResumesListResponse> {
  const res = await apiClient.get(`/jobs/${jobId}/resumes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getMyResume(jobId: string, token: string): Promise<MyResumeResponse> {
  const res = await apiClient.get(`/jobs/${jobId}/resume/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deleteResume(jobId: string, resumeId: string, token: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}/resume/${resumeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

