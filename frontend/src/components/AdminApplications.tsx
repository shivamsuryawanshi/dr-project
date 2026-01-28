import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, FileText, Eye, MessageSquare, Phone, Mail, MapPin, Search, Filter, Users, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchApplications, updateApplicationStatus } from '../api/applications';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationResponse } from '../api/applications';
import { fetchJobsByEmployer } from '../api/jobs';
import { fetchEmployer } from '../api/employers';

interface AdminApplicationsProps {
  onNavigate: (page: string) => void;
  userRole?: 'admin' | 'employer'; // Allow component to work for both roles
}

export function AdminApplications({ onNavigate, userRole }: AdminApplicationsProps) {
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationResponse | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    jobId: ''
  });

  useEffect(() => {
    loadApplications();
  }, [filters, token, userRole, user]);

  const loadApplications = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params: any = {
        status: filters.status as 'applied' | 'shortlisted' | 'interview' | 'selected' | 'rejected' | undefined,
        search: filters.search || undefined,
        jobId: filters.jobId || undefined,
        page: 0,
        size: 50,
        sort: 'appliedDate,desc'
      };

      // If user is employer, fetch only applications for their jobs
      if ((userRole === 'employer' || user?.role === 'EMPLOYER') && user) {
        try {
          // Get employer data
          const employerData = await fetchEmployer(user.id, token);
          
          // Get all jobs for this employer
          const jobsResponse = await fetchJobsByEmployer(employerData.id, {
            status: 'all',
            page: 0,
            size: 1000
          });
          const employerJobs = jobsResponse.content || [];
          const jobIds = employerJobs.map((job: any) => job.id);

          // Fetch applications for each job
          const allApplications: ApplicationResponse[] = [];
          for (const jobId of jobIds) {
            try {
              const appsResponse = await fetchApplications({
                jobId,
                ...params
              }, token);
              if (appsResponse && appsResponse.content && Array.isArray(appsResponse.content)) {
                allApplications.push(...appsResponse.content);
              }
            } catch (err) {
              console.error(`Failed to fetch applications for job ${jobId}:`, err);
            }
          }
          setApplications(allApplications);
        } catch (error) {
          console.error('Failed to load employer applications:', error);
          setApplications([]);
        }
      } else {
        // Admin can see all applications
        const response = await fetchApplications(params, token);
        setApplications(response.content || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'selected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shortlisted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'interview':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'selected':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'applied':
        return 25;
      case 'shortlisted':
        return 50;
      case 'interview':
        return 75;
      case 'selected':
        return 100;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'applied', label: 'Applied', completed: true },
      { key: 'shortlisted', label: 'Shortlisted', completed: ['shortlisted', 'interview', 'selected'].includes(status) },
      { key: 'interview', label: 'Interview', completed: ['interview', 'selected'].includes(status) },
      { key: 'selected', label: 'Selected', completed: status === 'selected' }
    ];
    return steps;
  };

  const updateApplicationStatusHandler = async (applicationId: string, newStatus: string, notes?: string, interviewDate?: string) => {
    if (!token) return;

    try {
      await updateApplicationStatus(applicationId, newStatus, token, notes, interviewDate);
      await loadApplications(); // Reload applications
      setIsStatusDialogOpen(false);
      setIsInterviewDialogOpen(false);
    } catch (error) {
      alert('Failed to update application status. Please try again.');
      console.error('Status update error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !filters.status || app.status === filters.status;
    const matchesSearch = !filters.search ||
      app.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.jobOrganization.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading applications…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Application Management</h1>
              <p className="text-gray-600">
                {userRole === 'employer' || user?.role === 'EMPLOYER' 
                  ? 'Review and manage job applications from candidates for your posted jobs'
                  : 'Review and manage all job applications across the platform'}
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate(userRole === 'employer' ? 'employer-dashboard' : 'dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, job, or organization..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobId">Job ID (Optional)</Label>
                <Input
                  id="jobId"
                  placeholder="Filter by Job ID"
                  value={filters.jobId}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobId: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: '', search: '', jobId: '' })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Applications ({filteredApplications.length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {filteredApplications.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No applications found matching your criteria.</p>
                </Card>
              ) : (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Candidate Name - Prominently Displayed */}
                        <div className="mb-3 pb-3 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-lg">
                                {application.candidateName?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">{application.candidateName || 'Unknown Candidate'}</h2>
                              <p className="text-sm text-gray-600">Applied for: {application.jobTitle}</p>
                            </div>
                            <Badge className={getStatusColor(application.status)} variant="outline">
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900">{application.jobTitle}</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Organization:</span>
                            <span>{application.jobOrganization}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Applied:</span>
                            <span>{formatDate(application.appliedDate)}</span>
                          </div>
                          {application.interviewDate && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Interview:</span>
                              <span>{formatDateTime(application.interviewDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Application Progress</span>
                            <span className="text-sm text-gray-600">{getStatusProgress(application.status)}%</span>
                          </div>
                          <Progress value={getStatusProgress(application.status)} className="h-2" />
                        </div>

                        {/* Status Steps */}
                        <div className="flex items-center justify-between mb-4">
                          {getStatusSteps(application.status).map((step, index) => (
                            <div key={step.key} className="flex items-center">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                step.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-400'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-medium">{index + 1}</span>
                                )}
                              </div>
                              <span className={`ml-2 text-xs ${
                                step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </span>
                              {index < getStatusSteps(application.status).length - 1 && (
                                <div className={`w-8 h-0.5 mx-2 ${
                                  getStatusSteps(application.status)[index + 1].completed
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>

                        {application.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {application.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Details - {application.candidateName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Candidate Information */}
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Users className="w-5 h-5" />
                                  Candidate Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                                    <p className="text-gray-900 font-semibold">{application.candidateName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      <a href={`mailto:${application.candidateEmail}`} className="text-blue-600 hover:underline">
                                        {application.candidateEmail}
                                      </a>
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Phone</label>
                                    <p className="text-gray-900 flex items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      <a href={`tel:${application.candidatePhone}`} className="text-blue-600 hover:underline">
                                        {application.candidatePhone || 'N/A'}
                                      </a>
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Applied Date</label>
                                    <p className="text-gray-900">{formatDate(application.appliedDate)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Job Information */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <Briefcase className="w-5 h-5" />
                                  Job Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                                    <p className="text-gray-900">{application.jobTitle}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Organization</label>
                                    <p className="text-gray-900">{application.jobOrganization}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Application Status</label>
                                    <Badge className={getStatusColor(application.status)} variant="outline">
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </Badge>
                                  </div>
                                  {application.interviewDate && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Interview Date</label>
                                      <p className="text-gray-900">{formatDateTime(application.interviewDate)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Resume */}
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <FileText className="w-5 h-5" />
                                  Resume
                                </h3>
                                {application.resumeUrl ? (
                                  <div className="flex items-center gap-3">
                                    <Button 
                                      variant="default" 
                                      asChild
                                      onClick={() => {
                                        // Ensure full URL
                                        const resumeUrl = application.resumeUrl?.startsWith('http') 
                                          ? application.resumeUrl 
                                          : `${window.location.origin}${application.resumeUrl}`;
                                        window.open(resumeUrl, '_blank');
                                      }}
                                    >
                                      <a 
                                        href={application.resumeUrl?.startsWith('http') 
                                          ? application.resumeUrl 
                                          : `${window.location.origin}${application.resumeUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                      >
                                        <FileText className="w-4 h-4" />
                                        View/Download Resume
                                      </a>
                                    </Button>
                                    <span className="text-sm text-gray-600">Click to view or download the candidate's resume</span>
                                  </div>
                                ) : (
                                  <p className="text-gray-600">No resume uploaded by candidate</p>
                                )}
                              </div>

                              {/* Notes */}
                              {application.notes && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                  <h3 className="font-semibold text-gray-900 mb-2">Application Notes</h3>
                                  <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Application Status</DialogTitle>
                            </DialogHeader>
                            <StatusUpdateForm
                              application={selectedApplication}
                              onUpdate={(status, notes) => {
                                if (selectedApplication) {
                                  updateApplicationStatusHandler(selectedApplication.id, status, notes);
                                }
                              }}
                              onCancel={() => setIsStatusDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule Interview
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Interview</DialogTitle>
                            </DialogHeader>
                            <InterviewSchedulingForm
                              application={selectedApplication}
                              onSchedule={(date, notes) => {
                                if (selectedApplication) {
                                  updateApplicationStatusHandler(selectedApplication.id, 'interview', notes, date);
                                }
                              }}
                              onCancel={() => setIsInterviewDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Candidate Info - Enhanced */}
                    <div className="pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Candidate Contact Information
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-600">Email</span>
                          </div>
                          <a 
                            href={`mailto:${application.candidateEmail}`} 
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            {application.candidateEmail}
                          </a>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-gray-600">Phone</span>
                          </div>
                          <a 
                            href={`tel:${application.candidatePhone}`} 
                            className="text-green-600 hover:underline text-sm font-medium"
                          >
                            {application.candidatePhone || 'N/A'}
                          </a>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-medium text-gray-600">Resume</span>
                          </div>
                          {application.resumeUrl ? (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-purple-600 hover:text-purple-700 font-medium"
                              onClick={() => {
                                const resumeUrl = application.resumeUrl?.startsWith('http') 
                                  ? application.resumeUrl 
                                  : `${window.location.origin}${application.resumeUrl}`;
                                window.open(resumeUrl, '_blank');
                              }}
                            >
                              📄 View/Download Resume
                            </Button>
                          ) : (
                            <span className="text-gray-500 text-sm">No resume uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-6">
              {filteredApplications
                .filter(app => ['applied', 'shortlisted'].includes(app.status))
                .map((application) => (
                  <Card key={application.id} className="p-6">
                    {/* Same content as above but filtered */}
                    <div className="text-center py-8">
                      <p className="text-gray-500">Active applications will be shown here</p>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="interview" className="mt-6">
            <div className="space-y-6">
              {filteredApplications
                .filter(app => app.status === 'interview')
                .map((application) => (
                  <Card key={application.id} className="p-6">
                    {/* Same content as above but filtered */}
                    <div className="text-center py-8">
                      <p className="text-gray-500">Interview scheduled applications will be shown here</p>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              {filteredApplications
                .filter(app => ['selected', 'rejected'].includes(app.status))
                .map((application) => (
                  <Card key={application.id} className="p-6">
                    {/* Same content as above but filtered */}
                    <div className="text-center py-8">
                      <p className="text-gray-500">Completed applications will be shown here</p>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatusUpdateFormProps {
  application: ApplicationResponse | null;
  onUpdate: (status: string, notes?: string) => void;
  onCancel: () => void;
}

function StatusUpdateForm({ application, onUpdate, onCancel }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<string>('applied');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(status, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">New Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
        >
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          rows={3}
          placeholder="Add any notes about this status update..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Update Status
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface InterviewSchedulingFormProps {
  application: ApplicationResponse | null;
  onSchedule: (date: string, notes?: string) => void;
  onCancel: () => void;
}

function InterviewSchedulingForm({ application, onSchedule, onCancel }: InterviewSchedulingFormProps) {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = `${interviewDate}T${interviewTime}`;
    onSchedule(dateTime, notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Interview Date</Label>
          <input
            id="date"
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Interview Time</Label>
          <input
            id="time"
            type="time"
            value={interviewTime}
            onChange={(e) => setInterviewTime(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Interview Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          rows={3}
          placeholder="Add any notes about the interview..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Schedule Interview
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
