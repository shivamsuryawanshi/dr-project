// AI assisted development
import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Check, X, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { uploadResume, getMyResume, deleteResume, ResumeResponse } from '../api/resumes';
import { updateApplicationResume } from '../api/applications';
import { useAuth } from '../contexts/AuthContext';

interface ResumeUploadSectionProps {
  jobId: string;
  applicationResumeUrl?: string; // Resume URL from application
  applicationId?: string; // Application ID for updating resume
}

export function ResumeUploadSection({ jobId, applicationResumeUrl, applicationId }: ResumeUploadSectionProps) {
  const { token, user } = useAuth();
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If applicationResumeUrl is provided, use it directly
    if (applicationResumeUrl) {
      const fileName = applicationResumeUrl.split('/').pop() || 'resume';
      setResume({
        id: 'application-resume',
        jobId: jobId,
        candidateId: user?.id || '',
        candidateName: user?.name || '',
        candidateEmail: user?.email || '',
        fileUrl: applicationResumeUrl,
        fileName: fileName,
        fileType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword',
        uploadedAt: new Date().toISOString()
      });
      setLoading(false);
      return;
    }
    
    if (token && user?.role === 'candidate') {
      loadMyResume();
    } else {
      setLoading(false);
    }
  }, [jobId, token, user, applicationResumeUrl]);

  const loadMyResume = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getMyResume(jobId, token);
      console.log('Resume response:', response);
      if (response && response.resume) {
        setResume(response.resume);
      } else {
        setResume(null);
      }
    } catch (err: any) {
      console.error('Error loading resume:', err);
      // If it's a 404 or the resume doesn't exist, that's okay - just set resume to null
      if (err?.response?.status === 404 || err?.message?.includes('404')) {
        setResume(null);
        setError(null); // Don't show error if resume just doesn't exist
      } else if (err?.response?.status === 500 || err?.message?.includes('500')) {
        // For 500 errors, show a user-friendly message
        const errorMsg = err?.response?.data?.error || 'Unable to load resume. Please try again later.';
        setError(errorMsg);
        setResume(null);
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        // Authentication/authorization errors
        setError('Please login to view your resume');
        setResume(null);
      } else {
        // Other errors
        const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to load resume';
        setError(errorMsg);
        setResume(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!token) {
      setError('Please login to upload resume');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // If applicationId is provided, update the application resume
      if (applicationId) {
        const result = await updateApplicationResume(applicationId, file, token);
        const fileName = file.name;
        setResume({
          id: 'application-resume',
          jobId: jobId,
          candidateId: user?.id || '',
          candidateName: user?.name || '',
          candidateEmail: user?.email || '',
          fileUrl: result.resumeUrl,
          fileName: fileName,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        });
        setSuccess('Resume updated successfully!');
      } else {
        // Use the old resume API
        const uploadedResume = await uploadResume(jobId, file, token);
        setResume(uploadedResume);
        setSuccess('Resume uploaded successfully!');
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      
      // Handle different types of errors with specific messages
      if (err?.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 400) {
          setError(errorData?.error || 'Invalid file. Please check file size (max 10MB) and format (PDF, DOC, DOCX).');
        } else if (status === 401) {
          setError('Please login to upload resume');
        } else if (status === 403) {
          setError('Only candidates can upload resumes');
        } else if (status === 404) {
          setError('Job not found');
        } else if (status === 413) {
          setError('File too large. Maximum size is 10MB');
        } else if (status === 500) {
          setError(errorData?.error || 'Server error. Please try again later.');
        } else {
          setError(errorData?.error || errorData?.message || 'Failed to upload resume. Please try again.');
        }
      } else if (err?.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Failed to upload resume. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !resume) return;

    if (!confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      setError(null);
      await deleteResume(jobId, resume.id, token);
      setResume(null);
      setSuccess('Resume deleted successfully');
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to delete resume';
      setError(errorMsg);
    }
  };

  if (!user || user.role !== 'candidate') {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Your Applied Resume
      </h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {resume ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{resume.fileName}</p>
                <p className="text-xs text-gray-500">
                  Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resume.fileUrl, '_blank')}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Upload a new resume to replace the current one:</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Replace Resume
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            No resume found for this application. Upload one now.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Accepted formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      )}
    </Card>
  );
}

