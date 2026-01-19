// AI assisted development
import apiClient from './apiClient';

export interface JobDocResponse {
  id: string;
  jobId: string;
  employeeId: string;
  employeeName: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface JobDocsListResponse {
  jobId: string;
  documents: JobDocResponse[];
  count: number;
}

export async function uploadJobDoc(jobId: string, file: File, token: string): Promise<JobDocResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post(`/jobs/${jobId}/docs`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getJobDocs(jobId: string, token: string): Promise<JobDocsListResponse> {
  const res = await apiClient.get(`/jobs/${jobId}/docs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deleteJobDoc(jobId: string, docId: string, token: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}/docs/${docId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

