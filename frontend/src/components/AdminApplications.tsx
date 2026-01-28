import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, FileText, Eye, MessageSquare, Phone, Mail, MapPin, Search, Filter, Users, Briefcase, MoreVertical, Loader2, ArrowLeft } from 'lucide-react';
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
    <Card 
      className="border-l-4 border-l-gray-200 dark:border-l-gray-700 animate-pulse flex flex-col"
      style={{
        padding: 'clamp(0.75rem, 1.5vw, 1.25rem)',
        borderRadius: 'clamp(0.5rem, 0.8vw, 0.75rem)'
      }}
    >
      <div className="flex items-start justify-between mb-3" style={{ marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)' }}>
        <div className="flex-1">
          <div 
            className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700"
            style={{ 
              gap: 'clamp(0.5rem, 0.8vw, 0.75rem)',
              marginBottom: 'clamp(0.5rem, 0.8vw, 0.75rem)',
              paddingBottom: 'clamp(0.5rem, 0.8vw, 0.75rem)'
            }}
          >
            <div 
              className="bg-gray-200 dark:bg-gray-700 rounded-full"
              style={{
                width: 'clamp(2.5rem, 4vw, 3.5rem)',
                height: 'clamp(2.5rem, 4vw, 3.5rem)'
              }}
            />
            <div className="flex-1">
              <div 
                className="bg-gray-200 dark:bg-gray-700 rounded mb-1"
                style={{
                  height: 'clamp(1rem, 1.2vw, 1.125rem)',
                  width: '40%',
                  marginBottom: 'clamp(0.25rem, 0.4vw, 0.375rem)'
                }}
              />
              <div 
                className="bg-gray-200 dark:bg-gray-700 rounded"
                style={{
                  height: 'clamp(0.875rem, 1vw, 1rem)',
                  width: '60%'
                }}
              />
            </div>
            <div 
              className="bg-gray-200 dark:bg-gray-700 rounded"
              style={{
                height: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                width: 'clamp(3rem, 5vw, 4rem)'
              }}
            />
          </div>
          <div 
            className="bg-gray-200 dark:bg-gray-700 rounded mb-3"
            style={{
              height: 'clamp(1rem, 1.2vw, 1.125rem)',
              width: '50%',
              marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
            }}
          />
          <div 
            className="space-y-2 mb-3"
            style={{ 
              gap: 'clamp(0.5rem, 0.8vw, 0.625rem)',
              marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
            }}
          >
            <div 
              className="bg-gray-200 dark:bg-gray-700 rounded"
              style={{ height: 'clamp(0.875rem, 1vw, 1rem)' }}
            />
            <div 
              className="bg-gray-200 dark:bg-gray-700 rounded"
              style={{ height: 'clamp(0.875rem, 1vw, 1rem)' }}
            />
          </div>
          <div 
            className="bg-gray-200 dark:bg-gray-700 rounded mb-3"
            style={{
              height: 'clamp(0.375rem, 0.5vw, 0.5rem)',
              marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
            }}
          />
        </div>
      </div>
      <div 
        className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700"
        style={{
          gap: 'clamp(0.5rem, 0.8vw, 0.75rem)',
          paddingTop: 'clamp(0.75rem, 1.2vw, 1rem)'
        }}
      >
        <div 
          className="bg-gray-200 dark:bg-gray-700 rounded flex-1"
          style={{
            height: 'clamp(2.5rem, 3.5vw, 2.75rem)'
          }}
        />
        <div 
          className="bg-gray-200 dark:bg-gray-700 rounded flex-1"
          style={{
            height: 'clamp(2.5rem, 3.5vw, 2.75rem)'
          }}
        />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate(userRole === 'employer' ? 'employer-dashboard' : 'dashboard')}
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
                onClick={() => onNavigate(userRole === 'employer' ? 'employer-dashboard' : 'dashboard')}
                className="hidden lg:flex"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Desktop Filters - Hidden on mobile, shown in sidebar */}
          <div className="hidden lg:block">
            <Card className="p-4">
              <FilterPanel />
            </Card>
          </div>
        </div>

        {/* Main Content Area - Responsive Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:w-64 xl:w-80 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h3>
                <FilterPanel />
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
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
                  <div 
                    className="grid gap-4 md:gap-5 lg:gap-6"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))'
                    }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <ApplicationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <Card 
                    className="text-center"
                    style={{
                      padding: 'clamp(2rem, 4vw, 3rem)',
                      borderRadius: 'clamp(0.5rem, 0.8vw, 0.75rem)'
                    }}
                  >
                    <Briefcase 
                      className="text-gray-300 dark:text-gray-600 mx-auto mb-4" 
                      style={{ 
                        width: 'clamp(3rem, 5vw, 4rem)', 
                        height: 'clamp(3rem, 5vw, 4rem)' 
                      }}
                    />
                    <p 
                      className="text-gray-500 dark:text-gray-400"
                      style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                    >
                      No applications found matching your criteria.
                    </p>
                  </Card>
                ) : (
                  <div 
                    className="grid gap-4 md:gap-5 lg:gap-6"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))'
                    }}
                  >
                    {filteredApplications.map((application) => (
                      <Card 
                        key={application.id} 
                        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 dark:border-l-blue-600 hover:border-l-blue-600 dark:hover:border-l-blue-500 hover:shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 flex flex-col"
                        style={{
                          borderRadius: 'clamp(0.5rem, 0.8vw, 0.75rem)',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <div 
                          className="flex flex-col flex-1"
                          style={{
                            padding: 'clamp(0.75rem, 1.5vw, 1.25rem)'
                          }}
                        >
                          {/* Candidate Header */}
                          <div 
                            className="mb-3 md:mb-4"
                            style={{ marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)' }}
                          >
                            <div 
                              className="flex items-start justify-between gap-2 md:gap-3 mb-2 md:mb-3"
                              style={{ marginBottom: 'clamp(0.5rem, 1vw, 0.75rem)' }}
                            >
                              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                  <div 
                                    className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-shadow"
                                    style={{
                                      width: 'clamp(2.5rem, 4vw, 3.5rem)',
                                      height: 'clamp(2.5rem, 4vw, 3.5rem)'
                                    }}
                                  >
                                    <span 
                                      className="text-white font-semibold"
                                      style={{ fontSize: 'clamp(1rem, 1.5vw, 1.5rem)' }}
                                    >
                                      {application.candidateName?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                  </div>
                                  <Badge 
                                    className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center p-0 bg-green-500 hover:bg-green-500"
                                    style={{ fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)' }}
                                  >
                                    <span className="text-white font-semibold">H</span>
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h2 
                                    className="text-gray-900 dark:text-gray-100 truncate font-semibold mb-0.5"
                                    style={{ 
                                      fontSize: 'clamp(0.875rem, 1.2vw, 1.125rem)',
                                      lineHeight: '1.3'
                                    }}
                                  >
                                    {application.candidateName || 'Unknown Candidate'}
                                  </h2>
                                  <p 
                                    className="text-gray-600 dark:text-gray-400 truncate font-medium"
                                    style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                  >
                                    {application.jobTitle}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                className={`${getStatusColor(application.status)} flex-shrink-0`} 
                                variant="outline"
                                style={{ fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)' }}
                              >
                                <span className="hidden sm:inline font-medium">{getStatusLabel(application.status)}</span>
                                <span className="sm:hidden font-medium">{getStatusLabel(application.status).charAt(0)}</span>
                              </Badge>
                            </div>
                            
                            {/* Job Title */}
                            <h3 
                              className="text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug font-medium"
                              style={{ 
                                fontSize: 'clamp(0.8125rem, 1.1vw, 1rem)',
                                marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
                              }}
                            >
                              {application.jobTitle}
                            </h3>

                            {/* Key Information Grid */}
                            <div 
                              className="space-y-2 mb-3 md:mb-4"
                              style={{ 
                                gap: 'clamp(0.5rem, 0.8vw, 0.625rem)',
                                marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
                              }}
                            >
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <div 
                                  className="flex-shrink-0 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
                                  style={{
                                    width: 'clamp(1.75rem, 2.5vw, 2rem)',
                                    height: 'clamp(1.75rem, 2.5vw, 2rem)'
                                  }}
                                >
                                  <Briefcase 
                                    className="text-blue-600 dark:text-blue-400" 
                                    style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                                  />
                                </div>
                                <span 
                                  className="font-medium truncate"
                                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                >
                                  {application.jobOrganization}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <div 
                                  className="flex-shrink-0 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"
                                  style={{
                                    width: 'clamp(1.75rem, 2.5vw, 2rem)',
                                    height: 'clamp(1.75rem, 2.5vw, 2rem)'
                                  }}
                                >
                                  <Calendar 
                                    className="text-purple-600 dark:text-purple-400" 
                                    style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                                  />
                                </div>
                                <span style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                                  {formatDate(application.appliedDate)}
                                </span>
                              </div>
                              {application.interviewDate && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="flex-shrink-0 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"
                                    style={{
                                      width: 'clamp(1.75rem, 2.5vw, 2rem)',
                                      height: 'clamp(1.75rem, 2.5vw, 2rem)'
                                    }}
                                  >
                                    <Clock 
                                      className="text-purple-600 dark:text-purple-400" 
                                      style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                                    />
                                  </div>
                                  <span 
                                    className="font-medium text-purple-700 dark:text-purple-300"
                                    style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                  >
                                    Interview: {formatDateTime(application.interviewDate)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Progress Section */}
                            <div 
                              className="mb-3 md:mb-4"
                              style={{ marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)' }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span 
                                  className="font-semibold text-gray-700 dark:text-gray-300"
                                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                >
                                  Progress
                                </span>
                                <span 
                                  className="font-semibold text-blue-600 dark:text-blue-400"
                                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                >
                                  {getStatusProgress(application.status)}%
                                </span>
                              </div>
                              <Progress 
                                value={getStatusProgress(application.status)} 
                                className="bg-gray-100 dark:bg-gray-700"
                                style={{ height: 'clamp(0.375rem, 0.5vw, 0.5rem)' }}
                              />
                            </div>

                            {/* Status Steps - Enhanced */}
                            <div 
                              className="mb-3 md:mb-4"
                              style={{ marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)' }}
                            >
                              <div 
                                className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide"
                                style={{ gap: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}
                              >
                                {getStatusSteps(application.status).map((step, index) => (
                                  <div key={step.key} className="flex items-center flex-shrink-0">
                                    <div className="flex flex-col items-center">
                                      <div 
                                        className={`flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                                          step.completed
                                            ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white dark:from-green-600 dark:to-green-700 shadow-sm'
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                                        }`}
                                        style={{
                                          width: 'clamp(1.5rem, 2.2vw, 2rem)',
                                          height: 'clamp(1.5rem, 2.2vw, 2rem)'
                                        }}
                                      >
                                        {step.completed ? (
                                          <CheckCircle style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }} />
                                        ) : (
                                          <span 
                                            className="font-semibold"
                                            style={{ fontSize: 'clamp(0.625rem, 0.9vw, 0.75rem)' }}
                                          >
                                            {index + 1}
                                          </span>
                                        )}
                                      </div>
                                      <span 
                                        className={`mt-1 font-medium hidden md:block text-center max-w-[60px] truncate ${
                                          step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                        style={{ fontSize: 'clamp(0.625rem, 0.8vw, 0.75rem)' }}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                    {index < getStatusSteps(application.status).length - 1 && (
                                      <div 
                                        className={`hidden md:block transition-colors ${
                                          getStatusSteps(application.status)[index + 1].completed
                                            ? 'bg-gradient-to-r from-green-500 to-green-400 dark:from-green-600 dark:to-green-500'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                        style={{
                                          width: 'clamp(1rem, 1.5vw, 1.5rem)',
                                          height: '2px',
                                          margin: '0 clamp(0.25rem, 0.4vw, 0.5rem)'
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {application.notes && (
                              <div 
                                className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-md border border-amber-200 dark:border-amber-800/50 mb-3 md:mb-4"
                                style={{
                                  padding: 'clamp(0.75rem, 1.2vw, 1rem)',
                                  marginBottom: 'clamp(0.75rem, 1.2vw, 1rem)'
                                }}
                              >
                                <p 
                                  className="text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed"
                                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                                >
                                  <span className="font-semibold text-amber-700 dark:text-amber-300">Notes:</span>{' '}
                                  <span className="text-gray-700 dark:text-gray-300">{application.notes}</span>
                                </p>
                              </div>
                            )}
                          </div>

                        {/* Action Buttons - Enhanced Responsive */}
                        <div 
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700"
                          style={{
                            gap: 'clamp(0.5rem, 0.8vw, 0.75rem)',
                            paddingTop: 'clamp(0.75rem, 1.2vw, 1rem)'
                          }}
                        >
                          {/* Desktop: Full buttons */}
                          <div 
                            className="hidden sm:flex items-center gap-2 flex-1 flex-wrap"
                            style={{ gap: 'clamp(0.5rem, 0.8vw, 0.75rem)' }}
                          >
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                  className="flex-1"
                                  style={{
                                    minHeight: 'clamp(2.5rem, 3.5vw, 2.75rem)',
                                    fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)',
                                    padding: 'clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.75rem, 1.2vw, 1rem)'
                                  }}
                                >
                                  <Eye 
                                    className="mr-1.5" 
                                    style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                                  />
                                  View
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
                                          asChild
                                          onClick={() => {
                                            const resumeUrl = application.resumeUrl?.startsWith('http') 
                                              ? application.resumeUrl 
                                              : `${window.location.origin}${application.resumeUrl}`;
                                            window.open(resumeUrl, '_blank');
                                          }}
                                          className="w-full sm:w-auto"
                                        >
                                          <a 
                                            href={application.resumeUrl?.startsWith('http') 
                                              ? application.resumeUrl 
                                              : `${window.location.origin}${application.resumeUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                          >
                                            <FileText className="w-4 h-4" />
                                            View/Download Resume
                                          </a>
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

                            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                  className="flex-1"
                                  style={{
                                    minHeight: 'clamp(2.5rem, 3.5vw, 2.75rem)',
                                    fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)',
                                    padding: 'clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.75rem, 1.2vw, 1rem)'
                                  }}
                                >
                                  Update Status
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

                            <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                  className="flex-1"
                                  style={{
                                    minHeight: 'clamp(2.5rem, 3.5vw, 2.75rem)',
                                    fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)',
                                    padding: 'clamp(0.5rem, 0.8vw, 0.625rem) clamp(0.75rem, 1.2vw, 1rem)'
                                  }}
                                >
                                  <Calendar 
                                    className="mr-1.5" 
                                    style={{ width: 'clamp(0.875rem, 1.2vw, 1rem)', height: 'clamp(0.875rem, 1.2vw, 1rem)' }}
                                  />
                                  Interview
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-base sm:text-lg">Schedule Interview</DialogTitle>
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

                          {/* Mobile: Dropdown Menu */}
                          <div className="sm:hidden w-full">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full font-medium shadow-sm hover:shadow-md transition-shadow"
                                  style={{
                                    minHeight: 'clamp(2.75rem, 4vw, 3rem)',
                                    fontSize: 'clamp(0.8125rem, 1vw, 0.875rem)',
                                    padding: 'clamp(0.625rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.25rem)'
                                  }}
                                >
                                  <MoreVertical 
                                    className="mr-2" 
                                    style={{ width: 'clamp(1rem, 1.2vw, 1.125rem)', height: 'clamp(1rem, 1.2vw, 1.125rem)' }}
                                  />
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <div className="flex items-center w-full cursor-pointer">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </div>
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
                                            </div>
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
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
                                        {application.resumeUrl && (
                                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                              Resume
                                            </h3>
                                            <Button 
                                              variant="default" 
                                              asChild
                                              className="w-full sm:w-auto"
                                            >
                                              <a 
                                                href={application.resumeUrl?.startsWith('http') 
                                                  ? application.resumeUrl 
                                                  : `${window.location.origin}${application.resumeUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2"
                                              >
                                                <FileText className="w-4 h-4" />
                                                View/Download Resume
                                              </a>
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedApplication(application);
                                  setIsStatusDialogOpen(true);
                                }}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  setSelectedApplication(application);
                                  setIsInterviewDialogOpen(true);
                                }}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Schedule Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        </div>
                      </Card>
                    ))}
                    </div>
                  )}
                </TabsContent>

              {/* Other Tabs Content - Reuse same card structure */}
              <TabsContent value="active" className="mt-4 sm:mt-6">
                {loading ? (
                  <div className="space-y-4 sm:space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <ApplicationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredApplications.filter(app => ['pending', 'applied', 'shortlisted'].includes(app.status)).length === 0 ? (
                  <Card className="p-8 sm:p-12 text-center">
                    <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No active applications found.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredApplications
                      .filter(app => ['pending', 'applied', 'shortlisted'].includes(app.status))
                      .map((application) => (
                        <Card key={application.id} className="p-4 sm:p-6 border-l-4 border-l-blue-500 dark:border-l-blue-600 hover:shadow-lg transition-shadow duration-200">
                          {/* Reuse same card structure from "all" tab - simplified for brevity */}
                          <div className="mb-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">
                                    {application.candidateName?.charAt(0)?.toUpperCase() || 'A'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                    {application.candidateName || 'Unknown Candidate'}
                                  </h2>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {application.jobTitle}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`${getStatusColor(application.status)} flex-shrink-0`} variant="outline">
                                <span className="hidden sm:inline">{getStatusLabel(application.status)}</span>
                                <span className="sm:hidden">{getStatusLabel(application.status).charAt(0)}</span>
                              </Badge>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                              {application.jobTitle}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                              <div className="flex items-start gap-2">
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                <span className="truncate">{application.jobOrganization}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                <span>{formatDate(application.appliedDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="hidden sm:flex items-center gap-2 flex-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)} className="flex-1">
                                    <Eye className="w-4 h-4 mr-1.5" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-lg sm:text-xl">Application Details - {application.candidateName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
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
                                        </div>
                                        <div>
                                          <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
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
                                      </div>
                                    </div>
                                    {application.resumeUrl && (
                                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                          Resume
                                        </h3>
                                        <Button variant="default" asChild className="w-full sm:w-auto">
                                          <a 
                                            href={application.resumeUrl?.startsWith('http') 
                                              ? application.resumeUrl 
                                              : `${window.location.origin}${application.resumeUrl}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2"
                                          >
                                            <FileText className="w-4 h-4" />
                                            View/Download Resume
                                          </a>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)} className="flex-1">
                                    Update Status
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
                              <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)} className="flex-1">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Interview
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-base sm:text-lg">Schedule Interview</DialogTitle>
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
                            <div className="sm:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <MoreVertical className="w-4 h-4 mr-2" />
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem asChild>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <div className="flex items-center w-full cursor-pointer">
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg sm:text-xl">Application Details - {application.candidateName}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
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
                                              </div>
                                              <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
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
                                            </div>
                                          </div>
                                          {application.resumeUrl && (
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                                Resume
                                              </h3>
                                              <Button variant="default" asChild className="w-full sm:w-auto">
                                                <a 
                                                  href={application.resumeUrl?.startsWith('http') 
                                                    ? application.resumeUrl 
                                                    : `${window.location.origin}${application.resumeUrl}`} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="flex items-center justify-center gap-2"
                                                >
                                                  <FileText className="w-4 h-4" />
                                                  View/Download Resume
                                                </a>
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedApplication(application);
                                    setIsStatusDialogOpen(true);
                                  }}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedApplication(application);
                                    setIsInterviewDialogOpen(true);
                                  }}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule Interview
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interview" className="mt-4 sm:mt-6">
                {loading ? (
                  <div className="space-y-4 sm:space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <ApplicationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredApplications.filter(app => app.status === 'interview').length === 0 ? (
                  <Card className="p-8 sm:p-12 text-center">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No interview scheduled applications found.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredApplications
                      .filter(app => app.status === 'interview')
                      .map((application) => (
                        <Card key={application.id} className="p-4 sm:p-6 border-l-4 border-l-purple-500 dark:border-l-purple-600 hover:shadow-lg transition-shadow duration-200">
                          {/* Same structure as active tab - reuse component if needed */}
                          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                            Interview: {application.candidateName} - {application.jobTitle}
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-4 sm:mt-6">
                {loading ? (
                  <div className="space-y-4 sm:space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <ApplicationSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredApplications.filter(app => ['hired', 'selected', 'rejected'].includes(app.status)).length === 0 ? (
                  <Card className="p-8 sm:p-12 text-center">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No completed applications found.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredApplications
                      .filter(app => ['hired', 'selected', 'rejected'].includes(app.status))
                      .map((application) => (
                        <Card key={application.id} className="p-4 sm:p-6 border-l-4 border-l-green-500 dark:border-l-green-600 hover:shadow-lg transition-shadow duration-200">
                          {/* Same structure as active tab - reuse component if needed */}
                          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                            Completed: {application.candidateName} - {application.jobTitle}
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
