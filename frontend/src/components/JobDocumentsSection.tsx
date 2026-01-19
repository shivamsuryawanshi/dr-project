// AI assisted development
import { useState, useEffect } from 'react';
import { FileText, Download, Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { getJobDocs, JobDocResponse } from '../api/jobDocs';
import { useAuth } from '../contexts/AuthContext';

interface JobDocumentsSectionProps {
  jobId: string;
}

export function JobDocumentsSection({ jobId }: JobDocumentsSectionProps) {
  const { token } = useAuth();
  const [docs, setDocs] = useState<JobDocResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [jobId, token]);

  const loadDocuments = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getJobDocs(jobId, token);
      setDocs(response.documents || []);
    } catch (err: any) {
      console.error('Error loading job documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: JobDocResponse) => {
    window.open(doc.fileUrl, '_blank');
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

  if (docs.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Job Documents
        </h3>
        <p className="text-sm text-gray-500">No documents available for this job.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Job Documents ({docs.length})
      </h3>
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                <p className="text-xs text-gray-500">
                  Uploaded by {doc.employeeName} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(doc)}
              className="ml-3 flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

