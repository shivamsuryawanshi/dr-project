import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, FileText, Eye, MessageSquare, Phone, Mail, MapPin, Search, Filter, Users, Briefcase, Building2, MoreVertical, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { toast } from 'sonner';
import { fetchApplications, updateApplicationStatus } from '../api/applications';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationResponse } from '../api/applications';
import { fetchJobsByEmployer } from '../api/jobs';
import { fetchEmployer } from '../api/employers';
import { openFileInViewer } from '../utils/fileUtils';

interface AdminApplicationsProps {
  onNavigate: (page: string) => void;
  userRole?: 'admin' | 'employer'; // Allow component to work for both roles
}

export function AdminApplications({ onNavigate, userRole }: AdminApplicationsProps) {
  const { token, user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationResponse | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    jobId: '',
    startDate: '',
    endDate: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, token, navigate]);

  useEffect(() => {
    if (isAuthenticated && user && token) {
      loadApplications();
    }
  }, [filters, token, userRole, user, isAuthenticated]);

  const loadApplications = async () => {
    if (!token || !isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        status: (filters.status && filters.status !== "all") ? filters.status : undefined,
        search: filters.search || undefined,
        jobId: filters.jobId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
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
            } catch (err: any) {
              // Handle 401 errors - authentication failed
              if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
                logout();
                navigate('/login');
                return;
              }
              console.error(`Failed to fetch applications for job ${jobId}:`, err);
            }
          }
          setApplications(allApplications);
        } catch (error: any) {
          // Handle 401 errors - authentication failed
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            logout();
            navigate('/login');
            return;
          }
          console.error('Failed to load employer applications:', error);
          setApplications([]);
        }
      } else {
        // Admin can see all applications
        const response = await fetchApplications(params, token);
        setApplications(response.content || []);
      }
    } catch (error: any) {
      // Handle 401 errors - authentication failed
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        logout();
        navigate('/login');
        return;
      }
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status === 'applied' ? 'pending' : status === 'selected' ? 'hired' : status;
    switch (normalizedStatus) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status === 'applied' ? 'pending' : status === 'selected' ? 'hired' : status;
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case 'hired':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusProgress = (status: string) => {
    const normalizedStatus = status === 'applied' ? 'pending' : status === 'selected' ? 'hired' : status;
    switch (normalizedStatus) {
      case 'pending':
        return 25;
      case 'shortlisted':
        return 50;
      case 'interview':
        return 75;
      case 'hired':
        return 100;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };

  const getStatusSteps = (status: string) => {
    const normalizedStatus = status === 'applied' ? 'pending' : status === 'selected' ? 'hired' : status;
    const steps = [
      { key: 'pending', label: 'Pending', completed: ['pending', 'shortlisted', 'interview', 'hired'].includes(normalizedStatus) },
      { key: 'shortlisted', label: 'Shortlisted', completed: ['shortlisted', 'interview', 'hired'].includes(normalizedStatus) },
      { key: 'interview', label: 'Interview', completed: ['interview', 'hired'].includes(normalizedStatus) },
      { key: 'hired', label: 'Hired', completed: normalizedStatus === 'hired' }
    ];
    return steps;
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status === 'applied' ? 'pending' : status === 'selected' ? 'hired' : status;
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  };

  const updateApplicationStatusHandler = async (applicationId: string, newStatus: string, notes?: string, interviewDate?: string) => {
    if (!token || !isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await updateApplicationStatus(applicationId, newStatus, token, notes, interviewDate);
      await loadApplications(); // Reload applications
      setIsStatusDialogOpen(false);
      setIsInterviewDialogOpen(false);
      
      // Show success toast
      const app = applications.find(a => a.id === applicationId);
      toast.success('Status Updated', {
        description: `Application status for ${app?.candidateName || 'candidate'} has been updated to ${getStatusLabel(newStatus)}.`,
      });
    } catch (error: any) {
      // Handle 401 errors - authentication failed
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        logout();
        navigate('/login');
        return;
      }
      toast.error('Update Failed', {
        description: error.message || 'Failed to update application status. Please try again.',
      });
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
    // Handle "all" status filter
    const matchesStatus = !filters.status || filters.status === "all" || app.status === filters.status;
    const matchesSearch = !filters.search ||
      app.candidateName.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.jobOrganization.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Don't render if not authenticated
  if (!isAuthenticated || !user || !token) {
    return null;
  }

  // Skeleton Loader Component
  const ApplicationSkeleton = () => (
    <Card className="rounded-2xl border border-gray-200/90 dark:border-gray-700/90 bg-white dark:bg-gray-800 animate-pulse flex flex-col h-full">
      <div className="p-4 sm:p-5 flex flex-col flex-1 h-full">
        {/* Header Row Skeleton */}
        <div className="flex items-center justify-between gap-3 mb-3.5 pb-3 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
        </div>

        {/* Job Title Skeleton */}
        <div className="mb-3 space-y-1.5 min-h-[52px]">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>

        {/* Dates Skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-7 bg-gray-100 dark:bg-gray-700/50 rounded-md w-full" />
        </div>

        {/* Progress Skeleton */}
        <div className="mb-3.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3" />
          <div className="flex justify-center gap-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    </Card>
  );

  // Filter Component (reusable for sidebar and drawer)
  const FilterPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search" className="text-sm font-medium">Search</Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="search"
            placeholder="Search by name, job, or organization..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
        <Select 
          value={filters.status} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="mt-1.5 text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
          className="mt-1.5 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
        <Input
          id="endDate"
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
          className="mt-1.5 text-sm"
        />
      </div>

      <Button
        variant="outline"
        onClick={() => {
          setFilters({ status: 'all', search: '', jobId: '', startDate: '', endDate: '' });
          onClose?.();
        }}
        className="w-full text-sm"
      >
        Clear Filters
      </Button>
    </div>
  );

  const renderApplicationCard = (application: ApplicationResponse) => (
    <Card 
      key={application.id} 
      className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700/90 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 flex flex-col h-full"
    >
      <div className="p-4 sm:p-5 flex flex-col flex-1 h-full">
        {/* Candidate Header: Avatar + Candidate Name on Left, Status Badge on Right */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">
                <span>{application.candidateName?.charAt(0)?.toUpperCase() || 'A'}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 
                className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-[17px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight" 
                title={application.candidateName}
              >
                {application.candidateName || 'Unknown Candidate'}
              </h2>
            </div>
          </div>
          <Badge 
            className={`${getStatusColor(application.status)} flex-shrink-0 font-semibold text-xs px-2.5 py-1 rounded-full shadow-2xs`}
            variant="outline"
          >
            {getStatusLabel(application.status)}
          </Badge>
        </div>

        {/* Job Title & Organization Section (Full Card Width, No Awkward Wrapping) */}
        <div className="mb-3 min-h-[50px]">
          <div className="flex items-start gap-2 mb-1 min-w-0" title={application.jobTitle}>
            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-[15px] leading-snug line-clamp-2">
              {application.jobTitle}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-w-0 pl-6">
            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium text-gray-600 dark:text-gray-300">
              {application.jobOrganization}
            </span>
          </div>
        </div>

        {/* Meta Info: Applied Date & Standardized Interview Slot */}
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatDate(application.appliedDate)}
            </span>
          </div>

          <div className="min-h-[30px] flex items-center">
            {application.interviewDate ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/40 text-xs font-medium w-full min-w-0">
                <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="truncate">Interview: {formatDateTime(application.interviewDate)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-50/70 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700/60 text-xs w-full min-w-0">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">No interview scheduled</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-3.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Progress
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {getStatusProgress(application.status)}%
            </span>
          </div>
          <Progress 
            value={getStatusProgress(application.status)} 
            className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"
          />

          {/* Status Steps */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {getStatusSteps(application.status).map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      step.completed 
                        ? 'bg-blue-600 text-white shadow-2xs' 
                        : step.current 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border-2 border-blue-600' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span 
                    className={`mt-1 font-medium hidden md:inline truncate max-w-[52px] text-center text-[10px] ${
                      step.completed || step.current 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < getStatusSteps(application.status).length - 1 && (
                  <div 
                    className={`w-3 sm:w-4 md:w-5 h-0.5 mx-0.5 sm:mx-1 ${
                      step.completed ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes (Optional) */}
        {application.notes && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-xs">
            <p className="text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
              <span className="font-bold text-amber-800 dark:text-amber-400">Notes:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300">{application.notes}</span>
            </p>
          </div>
        )}

        {/* Action Buttons - Clean 2x2 Grid (All Viewports) */}
        <div 
          className="medex-applicant-footer grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800"
          data-slot="applicant-footer"
        >
          {/* 1. View Details */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedApplication(application)}
                className="medex-app-btn medex-app-btn-view w-full h-9 sm:h-10 px-2 py-1 text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center min-w-0 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="View Details"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                <span className="truncate">View</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Application Details - {application.candidateName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Candidate Information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    Candidate Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-semibold break-words">
                        {application.candidateName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2 break-all">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <a href={`mailto:${application.candidateEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {application.candidateEmail}
                        </a>
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <a href={`tel:${application.candidatePhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {application.candidatePhone || 'N/A'}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Applied Date</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{formatDate(application.appliedDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    Job Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Job Title</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                        {application.jobTitle}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Organization</label>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                        {application.jobOrganization}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Application Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(application.status)} variant="outline">
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                    </div>
                    {application.interviewDate && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Interview Date</label>
                        <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                          {formatDateTime(application.interviewDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Resume
                  </h3>
                  {application.resumeUrl ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Button 
                        variant="default" 
                        onClick={() => openFileInViewer(application.resumeUrl!)}
                        className="w-full sm:w-auto"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Resume
                      </Button>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                        Click to view or download the candidate's resume
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No resume uploaded by candidate</p>
                  )}
                </div>

                {/* Notes */}
                {application.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Application Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {application.notes}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* 2. Update Status */}
          <Dialog 
            open={isStatusDialogOpen && selectedApplication?.id === application.id} 
            onOpenChange={(open) => {
              setIsStatusDialogOpen(open);
              if (!open && selectedApplication?.id === application.id) {
                setSelectedApplication(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApplication(application);
                  setIsStatusDialogOpen(true);
                }}
                className="medex-app-btn medex-app-btn-status w-full h-9 sm:h-10 px-2 py-1 text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center min-w-0 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Update Status"
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">Update Status</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Update Application Status</DialogTitle>
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

          {/* 3. View Interview / Interview */}
          <Dialog 
            open={isInterviewDialogOpen && selectedApplication?.id === application.id} 
            onOpenChange={(open) => {
              setIsInterviewDialogOpen(open);
              if (!open && selectedApplication?.id === application.id) {
                setSelectedApplication(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApplication(application);
                  setIsInterviewDialogOpen(true);
                }}
                className="medex-app-btn medex-app-btn-interview w-full h-9 sm:h-10 px-2 py-1 text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center min-w-0 border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                title={application.interviewDate ? 'View Interview' : 'Schedule Interview'}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="truncate">{application.interviewDate || application.status === 'interview' ? 'View Interview' : 'Interview'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {application.interviewDate ? 'Interview Details / Reschedule' : 'Schedule Interview'}
                </DialogTitle>
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

          {/* 4. View Resume */}
          {application.resumeUrl ? (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => openFileInViewer(application.resumeUrl!)}
              className="medex-app-btn medex-app-btn-resume medex-applicant-resume-button w-full h-9 sm:h-10 px-2 py-1 text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center min-w-0 bg-green-600 hover:bg-green-700 text-white shadow-2xs"
              title="View Resume"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">View Resume</span>
            </Button>
          ) : (
            <div 
              className="medex-app-btn medex-applicant-no-resume w-full h-9 sm:h-10 px-2 py-1 text-xs font-semibold inline-flex items-center justify-center min-w-0 rounded-lg text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50"
              title="No resume uploaded"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">No Resume</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate(userRole === 'employer' ? 'dashboard/employer' : 'dashboard/admin')}
                  className="lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                    Application Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {userRole === 'employer' || user?.role === 'EMPLOYER' 
                      ? 'Review and manage job applications from candidates for your posted jobs'
                      : 'Review and manage all job applications across the platform'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter applications by status, date, and more
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel onClose={() => setIsFilterSheetOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate(userRole === 'employer' ? 'dashboard/employer' : 'dashboard/admin')}
                className="hidden lg:flex"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Responsive Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-gray-700/90 shadow-xs">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h3>
                <FilterPanel />
              </Card>
            </div>
          </aside>

          {/* Main Content Panel */}
          <main className="flex-1 min-w-0 w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700/90 p-4 sm:p-6 shadow-xs">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <TabsList className="inline-flex h-9 sm:h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400">
                    <TabsTrigger 
                      value="all" 
                      className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                    >
                      All <span className="hidden sm:inline">({filteredApplications.length})</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="active" 
                      className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interview" 
                      className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                    >
                      Interviews
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed" 
                      className="text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                    >
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-4 sm:mt-6">
                  {loading ? (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {[...Array(6)].map((_, i) => (
                        <ApplicationSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <Card className="text-center p-8 sm:p-12 border-dashed">
                      <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        No applications found matching your criteria.
                      </p>
                    </Card>
                  ) : (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {filteredApplications.map(renderApplicationCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active" className="mt-4 sm:mt-6">
                  {loading ? (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {[...Array(6)].map((_, i) => (
                        <ApplicationSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredApplications.filter(app => ['pending', 'applied', 'shortlisted'].includes(app.status)).length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center border-dashed">
                      <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No active applications found.</p>
                    </Card>
                  ) : (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {filteredApplications
                        .filter(app => ['pending', 'applied', 'shortlisted'].includes(app.status))
                        .map(renderApplicationCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="interview" className="mt-4 sm:mt-6">
                  {loading ? (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {[...Array(6)].map((_, i) => (
                        <ApplicationSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredApplications.filter(app => app.status === 'interview').length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center border-dashed">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No interview scheduled applications found.</p>
                    </Card>
                  ) : (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {filteredApplications
                        .filter(app => app.status === 'interview')
                        .map(renderApplicationCard)}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4 sm:mt-6">
                  {loading ? (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {[...Array(6)].map((_, i) => (
                        <ApplicationSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredApplications.filter(app => ['hired', 'selected', 'rejected'].includes(app.status)).length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center border-dashed">
                      <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No completed applications found.</p>
                    </Card>
                  ) : (
                    <div className="medex-applicant-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 items-stretch w-full">
                      {filteredApplications
                        .filter(app => ['hired', 'selected', 'rejected'].includes(app.status))
                        .map(renderApplicationCard)}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
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
  const [status, setStatus] = useState<string>('pending');
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
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
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
