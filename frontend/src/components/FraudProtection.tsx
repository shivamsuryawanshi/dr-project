import { useState } from 'react';
import { Flag, Shield, AlertTriangle, CheckCircle, XCircle, Eye, User, Building2, FileText, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface FraudReport {
  id: string;
  type: 'fake_job' | 'spam' | 'misleading_info' | 'fraudulent_employer' | 'other';
  jobId?: string;
  employerId?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  evidence?: string[];
}

interface FraudProtectionProps {
  userRole: 'admin' | 'candidate' | 'employer';
  userId: string;
}

const mockFraudReports: FraudReport[] = [
  {
    id: 'report-1',
    type: 'fake_job',
    jobId: 'job-123',
    reporterId: 'user-456',
    reporterName: 'Dr. Priya Sharma',
    reporterEmail: 'priya@email.com',
    reason: 'Job posting appears to be fake',
    description: 'The job posting for Senior Cardiologist at XYZ Hospital seems suspicious. The salary mentioned is unrealistic and the contact information provided is not working.',
    status: 'under_review',
    priority: 'high',
    createdAt: '2025-10-14T10:30:00',
    evidence: ['screenshot-1.png', 'email-thread.pdf']
  },
  {
    id: 'report-2',
    type: 'fraudulent_employer',
    employerId: 'emp-789',
    reporterId: 'user-123',
    reporterName: 'Dr. Amit Kumar',
    reporterEmail: 'amit@email.com',
    reason: 'Suspicious employer behavior',
    description: 'This employer is asking for money upfront before the interview process. They also provided fake company documents.',
    status: 'pending',
    priority: 'critical',
    createdAt: '2025-10-13T15:45:00'
  },
  {
    id: 'report-3',
    type: 'misleading_info',
    jobId: 'job-456',
    reporterId: 'user-789',
    reporterName: 'Dr. Sneha Patel',
    reporterEmail: 'sneha@email.com',
    reason: 'Misleading job information',
    description: 'The job description mentions different qualifications than what was discussed during the interview. The location is also different.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2025-10-12T09:15:00',
    resolvedAt: '2025-10-13T14:20:00',
    adminNotes: 'Verified with employer. Job description has been updated to reflect accurate information.'
  }
];

export function FraudProtection({ userRole, userId }: FraudProtectionProps) {
  const [reports, setReports] = useState<FraudReport[]>(mockFraudReports);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null);

  const isAdmin = userRole === 'admin';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Eye className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'dismissed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fake_job':
        return 'Fake Job Posting';
      case 'spam':
        return 'Spam Content';
      case 'misleading_info':
        return 'Misleading Information';
      case 'fraudulent_employer':
        return 'Fraudulent Employer';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const updateReportStatus = (reportId: string, newStatus: string, adminNotes?: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: newStatus as any,
              adminNotes: adminNotes || report.adminNotes,
              resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : report.resolvedAt
            }
          : report
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const underReviewReports = reports.filter(r => r.status === 'under_review').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const criticalReports = reports.filter(r => r.priority === 'critical').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Fraud Protection</h1>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Monitor and manage fraud reports to maintain platform integrity'
                : 'Report suspicious activities and help keep the platform safe'
              }
            </p>
          </div>
          {!isAdmin && (
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Fraud
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report Suspicious Activity</DialogTitle>
                </DialogHeader>
                <FraudReportForm 
                  onSubmit={(report) => {
                    setReports(prev => [...prev, { ...report, id: `report-${Date.now()}`, createdAt: new Date().toISOString() }]);
                    setIsReportDialogOpen(false);
                  }}
                  onCancel={() => setIsReportDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        {isAdmin && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Reports</p>
                  <p className="text-3xl text-gray-900">{pendingReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Under Review</p>
                  <p className="text-3xl text-gray-900">{underReviewReports}</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resolved</p>
                  <p className="text-3xl text-gray-900">{resolvedReports}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Critical Issues</p>
                  <p className="text-3xl text-gray-900">{criticalReports}</p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="reports" className="w-full">
          <TabsList>
            <TabsTrigger value="reports">
              {isAdmin ? 'All Reports' : 'My Reports'}
            </TabsTrigger>
            <TabsTrigger value="guidelines">Safety Guidelines</TabsTrigger>
            {isAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <Card key={report.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900">{getTypeLabel(report.type)}</h3>
                          <Badge className={getStatusColor(report.status)} variant="outline">
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p className="font-medium text-gray-900">Reported by:</p>
                            <p>{report.reporterName} ({report.reporterEmail})</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Reported on:</p>
                            <p>{formatDate(report.createdAt)}</p>
                          </div>
                          {report.jobId && (
                            <div>
                              <p className="font-medium text-gray-900">Job ID:</p>
                              <p>{report.jobId}</p>
                            </div>
                          )}
                          {report.employerId && (
                            <div>
                              <p className="font-medium text-gray-900">Employer ID:</p>
                              <p>{report.employerId}</p>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <p className="font-medium text-gray-900 mb-1">Reason:</p>
                          <p className="text-gray-700">{report.reason}</p>
                        </div>

                        <div className="mb-4">
                          <p className="font-medium text-gray-900 mb-1">Description:</p>
                          <p className="text-gray-700">{report.description}</p>
                        </div>

                        {report.adminNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="font-medium text-blue-900 mb-1">Admin Notes:</p>
                            <p className="text-blue-800">{report.adminNotes}</p>
                          </div>
                        )}

                        {report.evidence && report.evidence.length > 0 && (
                          <div className="mb-4">
                            <p className="font-medium text-gray-900 mb-2">Evidence:</p>
                            <div className="flex gap-2">
                              {report.evidence.map((file, index) => (
                                <Button key={index} variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {file}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(report.status)}
                      </div>
                    </div>

                    {isAdmin && report.status !== 'resolved' && report.status !== 'dismissed' && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'under_review')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">
                    {isAdmin 
                      ? 'No fraud reports have been submitted yet.'
                      : 'You haven\'t submitted any fraud reports yet.'
                    }
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">For Candidates</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Red Flags to Watch For:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Jobs asking for money upfront</li>
                      <li>• Unrealistic salary promises</li>
                      <li>• Vague job descriptions</li>
                      <li>• No company website or contact info</li>
                      <li>• Pressure to make quick decisions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How to Verify:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Research the company online</li>
                      <li>• Check company website and social media</li>
                      <li>• Verify contact information</li>
                      <li>• Ask for detailed job information</li>
                      <li>• Trust your instincts</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">For Employers</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Best Practices:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Provide clear job descriptions</li>
                      <li>• Include company information</li>
                      <li>• Use professional contact details</li>
                      <li>• Respond to applications promptly</li>
                      <li>• Maintain transparency</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Avoid:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Misleading job titles</li>
                      <li>• Hidden fees or charges</li>
                      <li>• Fake company information</li>
                      <li>• Spam or irrelevant content</li>
                      <li>• Unprofessional communication</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 mt-6">
              <h3 className="text-lg text-gray-900 mb-4">How to Report</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Flag className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">1. Identify the Issue</h4>
                  <p className="text-sm text-gray-600">Look for suspicious behavior or fake content</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">2. Gather Evidence</h4>
                  <p className="text-sm text-gray-600">Take screenshots and collect relevant information</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">3. Submit Report</h4>
                  <p className="text-sm text-gray-600">Use our reporting form to submit your concerns</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="analytics" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-6">Fraud Report Analytics</h3>
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics dashboard will be available here</p>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

interface FraudReportFormProps {
  onSubmit: (report: Omit<FraudReport, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function FraudReportForm({ onSubmit, onCancel }: FraudReportFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    jobId: '',
    employerId: '',
    reason: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report = {
      type: formData.type as any,
      jobId: formData.jobId || undefined,
      employerId: formData.employerId || undefined,
      reporterId: 'current-user',
      reporterName: 'Current User',
      reporterEmail: 'user@example.com',
      reason: formData.reason,
      description: formData.description,
      status: 'pending' as const,
      priority: formData.priority
    };
    
    onSubmit(report);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Report Type *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fake_job">Fake Job Posting</SelectItem>
            <SelectItem value="spam">Spam Content</SelectItem>
            <SelectItem value="misleading_info">Misleading Information</SelectItem>
            <SelectItem value="fraudulent_employer">Fraudulent Employer</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jobId">Job ID (if applicable)</Label>
          <input
            id="jobId"
            type="text"
            value={formData.jobId}
            onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="e.g., job-123"
          />
        </div>
        <div>
          <Label htmlFor="employerId">Employer ID (if applicable)</Label>
          <input
            id="employerId"
            type="text"
            value={formData.employerId}
            onChange={(e) => setFormData(prev => ({ ...prev, employerId: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            placeholder="e.g., emp-456"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason for Report *</Label>
        <input
          id="reason"
          type="text"
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Brief reason for reporting"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
          rows={4}
          placeholder="Provide detailed information about the suspicious activity..."
          required
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Submit Report
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


