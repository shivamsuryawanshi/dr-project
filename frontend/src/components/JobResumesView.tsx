// AI assisted development
import { useState, useEffect } from 'react';
import { FileText, Download, User, Mail, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { getResumes, ResumeResponse } from '../api/resumes';
import { useAuth } from '../contexts/AuthContext';
import { openFileInViewer } from '../utils/fileUtils';

interface JobResumesViewProps {
  jobId: string;
}

export function JobResumesView({ jobId }: JobResumesViewProps) {
  const { token } = useAuth();
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, [jobId, token]);

  const loadResumes = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getResumes(jobId, token);
      setResumes(response.resumes || []);
    } catch (err: any) {
      console.error('Error loading resumes:', err);
      setError(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resume: ResumeResponse) => {
    openFileInViewer(resume.fileUrl);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Candidate Resumes
        </h3>
        <p className="text-sm text-gray-500">No resumes uploaded for this job yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Candidate Resumes ({resumes.length})
        </h3>
      </div>
      <div className="space-y-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{resume.candidateName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{resume.candidateEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{resume.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {resume.applicationStatus && (
                    <Badge className={getStatusColor(resume.applicationStatus)}>
                      {resume.applicationStatus}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(resume)}
                className="ml-4"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

