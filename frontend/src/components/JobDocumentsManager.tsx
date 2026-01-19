// AI assisted development
import { useState, useRef } from 'react';
import { FileText, Upload, X, Download, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { uploadJobDoc, getJobDocs, deleteJobDoc, JobDocResponse } from '../api/jobDocs';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface JobDocumentsManagerProps {
  jobId: string;
}

export function JobDocumentsManager({ jobId }: JobDocumentsManagerProps) {
  const { token } = useAuth();
  const [docs, setDocs] = useState<JobDocResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload PDF, DOC, DOCX, PNG, or JPG files only.');
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
      setError('Please login to upload documents');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const uploadedDoc = await uploadJobDoc(jobId, file, token);
      setDocs([...docs, uploadedDoc]);
      setSuccess('Document uploaded successfully!');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setError(null);
      await deleteJobDoc(jobId, docId, token);
      setDocs(docs.filter(doc => doc.id !== docId));
      setSuccess('Document deleted successfully');
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Job Documents ({docs.length})
        </h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          id="doc-upload"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </div>

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

      {docs.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet.</p>
      ) : (
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
              <div className="flex items-center gap-2 ml-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

