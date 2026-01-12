import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Building2, User, Mail, FileText, Eye, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { fetchEmployers, updateEmployerVerificationStatus, uploadEmployerDocument } from '../api/employers';

interface EmployerVerificationPageProps {
  onNavigate: (page: string) => void;
}

interface EmployerRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  companyType: 'private' | 'government' | 'ngo';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  documents: string[];
  notes?: string;
}

export function EmployerVerificationPage({ onNavigate }: EmployerVerificationPageProps) {
  const { user, token } = useAuth();
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState<any | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetchEmployers({}, token);
      setEmployers(response.employers || []);
    } catch (error) {
      console.error('Failed to load employers:', error);
      // Fallback to mock data if API fails
      setEmployers([
        {
          id: '1',
          companyName: 'TechCorp Solutions',
          userName: 'Sarah Johnson',
          userEmail: 'sarah.johnson@techcorp.com',
          companyType: 'hospital',
          verificationStatus: 'pending',
          createdAt: '2024-10-20T10:00:00',
          verificationNotes: 'New tech company seeking to post software engineering positions.'
        },
        {
          id: '2',
          companyName: 'Green Energy Ltd',
          userName: 'Mike Chen',
          userEmail: 'mike.chen@greenenergy.com',
          companyType: 'consultancy',
          verificationStatus: 'pending',
          createdAt: '2024-10-18T14:30:00',
          verificationNotes: 'Renewable energy company expanding their team.'
        },
        {
          id: '3',
          companyName: 'City Hospital',
          userName: 'Dr. Emily Davis',
          userEmail: 'emily.davis@cityhospital.gov',
          companyType: 'hospital',
          verificationStatus: 'approved',
          createdAt: '2024-09-15T09:15:00',
          verificationNotes: 'Government hospital verified for medical positions.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (employer: any, action: 'approved' | 'rejected') => {
    setSelectedEmployer(employer);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedEmployer || !token) return;

    try {
      await updateEmployerVerificationStatus(
        selectedEmployer.id,
        reviewAction,
        token,
        reviewNotes
      );

      // Reload employers to get updated status
      await loadEmployers();

      setIsReviewDialogOpen(false);
      setSelectedEmployer(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to update verification status:', error);
      // For now, just close the dialog
      setIsReviewDialogOpen(false);
      setSelectedEmployer(null);
      setReviewNotes('');
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEmployer || !token) return;

    try {
      setUploadingDocument(true);
      await uploadEmployerDocument(selectedEmployer.id, file, token);
      // Could show success message here
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploadingDocument(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCompanyTypeBadge = (type: string) => {
    switch (type) {
      case 'private':
        return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
      case 'government':
        return <Badge className="bg-purple-100 text-purple-800">Government</Badge>;
      case 'ngo':
        return <Badge className="bg-green-100 text-green-800">NGO</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const pendingEmployers = employers.filter(emp => emp.verificationStatus === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Employer Verification</h1>
            <p className="text-gray-600">Review and approve employer verification requests</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingEmployers.length}</p>
                <p className="text-gray-600">Pending Reviews</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {employers.filter(emp => emp.verificationStatus === 'approved').length}
                </p>
                <p className="text-gray-600">Approved</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {employers.filter(emp => emp.verificationStatus === 'rejected').length}
                </p>
                <p className="text-gray-600">Rejected</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Employers Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Requests</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employers.map((employer) => (
                  <TableRow key={employer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employer.companyName}</p>
                        <p className="text-sm text-gray-500">{employer.website}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employer.userName}</p>
                        <p className="text-sm text-gray-500">{employer.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCompanyTypeBadge(employer.companyType)}</TableCell>
                    <TableCell>{getStatusBadge(employer.verificationStatus)}</TableCell>
                    <TableCell>{new Date(employer.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployer(employer)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {employer.verificationStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(employer, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(employer, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approved' ? 'Approve' : 'Reject'} Verification Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={`Add any notes about this ${reviewAction} decision...`}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={submitReview} className="flex-1">
                  {reviewAction === 'approved' ? 'Approve' : 'Reject'} Request
                </Button>
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
