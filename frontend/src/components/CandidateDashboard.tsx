// AI assisted development
import { Briefcase, BookmarkIcon, Bell, User, FileText, TrendingUp, ArrowLeft, Trash2, Heart, Search, Filter, Download, Building2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchApplications, ApplicationResponse } from '../api/applications';
import { fetchJobs, fetchJob } from '../api/jobs';
import { getSavedJobs, unsaveJob } from '../api/savedJobs';
import { fetchNotifications } from '../api/notifications';

interface CandidateDashboardProps {
  onNavigate: (page: string, jobId?: string) => void;
}

export function CandidateDashboard({ onNavigate }: CandidateDashboardProps) {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationResponse[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const profileCompleteness = 75;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [postedByFilter, setPostedByFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('appliedDate,desc');

  const handleLogout = () => {
    logout();
    onNavigate('logout');
  };

  const loadDashboardData = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📥 Loading dashboard data for user:', user.id);
      // Fetch user's applications - handle errors gracefully
      let fetchedApplications: ApplicationResponse[] = [];
      try {
        console.log('📋 Fetching applications for candidate:', user.id);
        const applicationsData = await fetchApplications({ candidateId: user.id }, token);
        fetchedApplications = applicationsData?.content || [];
        console.log('✅ Applications fetched:', fetchedApplications.length, 'applications found');
      } catch (error: any) {
        console.error('❌ Error fetching applications:', error);
        // If 500 error or any error, just set empty array
        fetchedApplications = [];
      }
      
      setApplications(fetchedApplications);

      // Fetch saved jobs from backend
      try {
        console.log('📥 Fetching saved jobs for user:', user.id);
        const savedJobsData = await getSavedJobs(token, 0, 100);
        console.log('✅ Saved jobs response:', savedJobsData);
        console.log('📋 Saved jobs content:', savedJobsData?.content);
        
        if (savedJobsData && Array.isArray(savedJobsData.content)) {
          console.log(`✅ Found ${savedJobsData.content.length} saved jobs`);
          setSavedJobs(savedJobsData.content);
        } else {
          console.log('⚠️ No saved jobs found or invalid response format');
          setSavedJobs([]);
        }
      } catch (error: any) {
        console.error('❌ Error fetching saved jobs:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        setSavedJobs([]);
      }
      
      // Fetch recommended jobs (featured or recent jobs)
      try {
        const recommendedData = await fetchJobs({ featured: true, size: 3 });
        setRecommendedJobs(Array.isArray(recommendedData?.content) ? recommendedData.content : []);
      } catch (error) {
        console.error('Error fetching recommended jobs:', error);
        setRecommendedJobs([]);
      }

      // Fetch notifications from backend
      try {
        const notificationsData = await fetchNotifications({ page: 0, size: 10 }, token);
        setNotifications(notificationsData.content || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty arrays on error
      setApplications([]);
      setSavedJobs([]);
      setRecommendedJobs([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Filter and sort applications
  useEffect(() => {
    let filtered = [...applications];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.jobTitle.toLowerCase().includes(searchLower) ||
        app.jobOrganization.toLowerCase().includes(searchLower) ||
        (app.postedBy?.name && app.postedBy.name.toLowerCase().includes(searchLower)) ||
        (app.postedBy?.company && app.postedBy.company.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply postedBy filter
    if (postedByFilter !== 'all') {
      filtered = filtered.filter(app => {
        if (!app.postedBy) return false;
        if (postedByFilter === 'name') return app.postedBy.name && app.postedBy.name !== 'N/A';
        if (postedByFilter === 'company') return app.postedBy.company && app.postedBy.company !== 'N/A';
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const [sortField, sortDir] = sortBy.split(',');
      const dir = sortDir === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'appliedDate':
          return dir * (new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime());
        case 'jobTitle':
          return dir * a.jobTitle.localeCompare(b.jobTitle);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        case 'postedBy':
          const aName = a.postedBy?.name || '';
          const bName = b.postedBy?.name || '';
          return dir * aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, postedByFilter, sortBy]);

  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered - pathname:', location.pathname, 'user:', user?.id);
    loadDashboardData();
  }, [user, token, location.pathname, loadDashboardData]); // Reload when location changes (e.g., after applying to a job)
  
  // Also reload when component mounts or becomes visible
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, reloading dashboard data...');
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDashboardData]);

  const handleRemoveSavedJob = async (jobId: string) => {
    if (!token) {
      alert('Please login to remove saved jobs');
      return;
    }

    try {
      await unsaveJob(jobId, token);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      alert('Job removed from saved jobs');
    } catch (error: any) {
      console.error('Error removing saved job:', error);
      alert(error.message || 'Failed to remove saved job. Please try again.');
    }
  };

  const handleSaveForLater = (job: any) => {
    setSavedJobs(prev => [...prev, job]);
  };

  const handleTrackStatus = (jobId: string) => {
    // In a real app, this would open a modal or navigate to a tracking page
    alert(`Tracking status for job ${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Welcome, {user?.name || 'User'}</h1>
          <p className="text-gray-600">Manage your job applications and profile</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Applied Jobs</p>
                <p className="text-3xl text-gray-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saved Jobs</p>
                <p className="text-3xl text-gray-900">{savedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookmarkIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Interviews</p>
                <p className="text-3xl text-gray-900">{applications.filter(app => app.status === 'interview' || app.interviewDate).length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Profile Views</p>
                <p className="text-3xl text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="applied" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>

              <TabsContent value="applied" className="space-y-4 mt-6">
                {/* Filters and Search */}
                <Card className="p-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Search by job title, company, or posted by..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
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
                      <Label htmlFor="sort">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appliedDate,desc">Newest First</SelectItem>
                          <SelectItem value="appliedDate,asc">Oldest First</SelectItem>
                          <SelectItem value="jobTitle,asc">Job Title (A-Z)</SelectItem>
                          <SelectItem value="jobTitle,desc">Job Title (Z-A)</SelectItem>
                          <SelectItem value="status,asc">Status</SelectItem>
                          <SelectItem value="postedBy,asc">Posted By (A-Z)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading applications...</div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {applications.length === 0 
                        ? "You haven't applied for any jobs yet."
                        : "No applications match your filters."}
                    </p>
                    {applications.length === 0 && (
                      <Button className="mt-4" onClick={() => onNavigate('jobs')}>
                        Browse Jobs
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                  <Card key={app.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge 
                              className={
                                app.status === 'shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                                app.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                app.status === 'hired' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }
                              variant="outline"
                            >
                              {app.status === 'pending' ? 'Under Review' :
                               app.status === 'shortlisted' ? 'Shortlisted' :
                               app.status === 'interview' ? 'Interview Scheduled' :
                               app.status === 'hired' ? 'Hired' :
                               app.status === 'rejected' ? 'Rejected' : app.status}
                            </Badge>
                          </div>
                          <h3 
                            className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => onNavigate('job-detail', app.jobId)}
                          >
                            {app.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{app.jobOrganization}</p>
                          
                          {/* Posted By Information */}
                          {app.postedBy && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">Posted by:</span>
                              <span>{app.postedBy.name !== 'N/A' ? app.postedBy.name : 'Unknown'}</span>
                              {app.postedBy.company && app.postedBy.company !== 'N/A' && (
                                <span className="text-gray-500">• {app.postedBy.company}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Applied on: {new Date(app.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        {app.interviewDate && (
                          <p className="text-purple-600">
                            Interview scheduled: {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => onNavigate('job-detail', app.jobId)}>
                          View Job
                        </Button>
                        {app.resumeUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const resumeUrl = app.resumeUrl?.startsWith('http') 
                                ? app.resumeUrl 
                                : `${window.location.origin}${app.resumeUrl}`;
                              window.open(resumeUrl, '_blank');
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            View Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading saved jobs...</div>
                ) : savedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't saved any jobs yet.</p>
                    <Button className="mt-4" onClick={() => onNavigate('jobs')}>
                      Browse Jobs
                    </Button>
                  </div>
                ) : (
                  savedJobs.map((job) => {
                    console.log('📋 Rendering saved job:', job);
                    return (
                      <Card key={job.id || `job-${Math.random()}`} className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Badge 
                                className={job.sector === 'government' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                  : 'bg-green-100 text-green-700 border-green-200'}
                                variant="outline"
                              >
                                {job.sector === 'government' ? 'Government' : 'Private'}
                              </Badge>
                              <h3 
                                className="text-lg text-gray-900 mt-2 mb-1 cursor-pointer hover:text-blue-600"
                                onClick={() => onNavigate('job-detail', job.id)}
                              >
                                {job.title || 'Untitled Job'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {job.organization || 'Organization not specified'} • {job.location || 'Location not specified'}
                              </p>
                              {job.savedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Saved on: {new Date(job.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => onNavigate('job-detail', job.id)}>
                              Apply Now
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveSavedJob(job.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="recommended" className="space-y-4 mt-6">
                <p className="text-gray-600">Based on your profile and preferences, here are jobs we recommend:</p>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading recommended jobs...</div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No recommended jobs at the moment.</p>
                    <Button className="mt-4" onClick={() => onNavigate('jobs')}>
                      Browse All Jobs
                    </Button>
                  </div>
                ) : (
                  recommendedJobs.map((job) => (
                  <Card key={job.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge 
                            className={job.sector === 'government' 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-green-100 text-green-700 border-green-200'}
                            variant="outline"
                          >
                            {job.sector === 'government' ? 'Government' : 'Private'}
                          </Badge>
                          <h3 
                            className="text-lg text-gray-900 mt-2 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => onNavigate('job-detail', job.id)}
                          >
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600">{job.organization} • {job.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onNavigate('job-detail', job.id)}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSaveForLater(job)}>
                          <Heart className="w-4 h-4 mr-1" />
                          Save for Later
                        </Button>
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Profile Completeness</h3>
              <div className="space-y-3">
                <Progress value={profileCompleteness} className="h-2" />
                <p className="text-sm text-gray-600">{profileCompleteness}% complete</p>
                <Button variant="outline" className="w-full" onClick={() => onNavigate('profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="pb-3 border-b last:border-b-0">
                      <p className="text-sm text-gray-900 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Button 
                variant="link" 
                className="w-full mt-2 text-blue-600"
                onClick={() => onNavigate('notifications')}
              >
                View All Notifications
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
