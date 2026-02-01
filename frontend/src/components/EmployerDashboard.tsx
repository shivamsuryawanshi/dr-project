// AI assisted development
import { Plus, Briefcase, Users, Eye, CheckCircle, XCircle, Calendar, ArrowLeft, Edit, Trash2, AlertTriangle, FileText, Mail, Phone } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchEmployer } from '../api/employers';
import { EmployerResponse } from '../api/employers';
import { Alert, AlertDescription } from './ui/alert';
import { fetchJobs } from '../api/jobs';
import { fetchApplications, ApplicationResponse } from '../api/applications';
import { getCurrentSubscription, SubscriptionResponse } from '../api/subscriptions';
import { fetchNotifications } from '../api/notifications';
import { openFileInViewer } from '../utils/fileUtils';

interface EmployerDashboardProps {
  onNavigate: (page: string) => void;
}

export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('logout');
  };
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationResponse[]>([]);
  const [employer, setEmployer] = useState<EmployerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionResponse | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const totalViews = myJobs.reduce((sum, job) => sum + (job.views || 0), 0);
  // Calculate total applications from both myApplications and job applications count
  const totalApplicationsFromList = myApplications.length;
  const totalApplicationsFromJobs = myJobs.reduce((sum, job) => sum + (job.applications || 0), 0);
  // Use the maximum of both to ensure we show the correct count
  const totalApplications = Math.max(totalApplicationsFromList, totalApplicationsFromJobs);

  // Debug logging
  useEffect(() => {
    if (myJobs.length > 0 || myApplications.length > 0) {
      console.log('📊 Application Count Debug:', {
        applicationsFromList: totalApplicationsFromList,
        applicationsFromJobs: totalApplicationsFromJobs,
        totalApplications,
        jobsCount: myJobs.length,
        applicationsCount: myApplications.length,
        jobs: myJobs.map(j => ({ id: j.id, title: j.title, applications: j.applications }))
      });
    }
  }, [myJobs, myApplications, totalApplicationsFromList, totalApplicationsFromJobs, totalApplications]);

  // Fetch employer data and jobs on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) return;

      try {
        // Fetch employer data
        let employerData;
        try {
          employerData = await fetchEmployer(user.id, token);
        } catch (err: any) {
          // If employer not found, create one
          if (err.message?.includes('404')) {
            const { createEmployer } = await import('../api/employers');
            employerData = await createEmployer({}, token);
          } else {
            throw err;
          }
        }
        setEmployer(employerData);

        // If verification is pending, redirect to verification page
        if (employerData.verificationStatus === 'pending') {
          onNavigate('verification');
          return;
        }

        // Fetch jobs directly by employer ID using the new endpoint
        const { fetchJobsByEmployer } = await import('../api/jobs');
        const jobsResponse = await fetchJobsByEmployer(employerData.id, {
          status: 'all',
          page: 0,
          size: 1000
        });
        const employerJobs = jobsResponse.content || [];

        console.log('Fetched employer jobs:', employerJobs.length, 'for employer:', employerData.id);
        setMyJobs(employerJobs);

        // Fetch applications for employer's jobs
        if (employerJobs.length > 0) {
          try {
            const jobIds = employerJobs.map((job: any) => job.id);
            console.log('📋 Fetching applications for jobs:', jobIds);
            const allApplications: ApplicationResponse[] = [];

            // Fetch applications for each job - use large size to get all applications
            for (const jobId of jobIds) {
              try {
                console.log(`🔍 Fetching applications for job: ${jobId}`);
                const appsResponse = await fetchApplications({
                  jobId,
                  page: 0,
                  size: 1000  // Fetch all applications at once
                }, token);
                console.log(`✅ Applications response for job ${jobId}:`, appsResponse);

                if (appsResponse && appsResponse.content && Array.isArray(appsResponse.content)) {
                  console.log(`📝 Found ${appsResponse.content.length} applications for job ${jobId}`);
                  allApplications.push(...appsResponse.content);
                } else if (Array.isArray(appsResponse)) {
                  // Sometimes API returns array directly
                  console.log(`📝 Found ${appsResponse.length} applications (direct array) for job ${jobId}`);
                  allApplications.push(...appsResponse);
                } else {
                  console.warn(`⚠️ No applications found for job ${jobId}, response:`, appsResponse);
                }
              } catch (err) {
                console.error(`❌ Failed to fetch applications for job ${jobId}:`, err);
              }
            }

            console.log(`📊 Total applications fetched: ${allApplications.length}`);
            setMyApplications(allApplications);
          } catch (error) {
            console.error('❌ Failed to fetch applications:', error);
            setMyApplications([]);
          }
        } else {
          console.log('⚠️ No jobs found, setting applications to empty');
          setMyApplications([]);
        }

        // Fetch current subscription
        try {
          const subscription = await getCurrentSubscription(token);
          setCurrentSubscription(subscription);
        } catch (err) {
          // Subscription not found or error - continue without it
          console.warn('Could not fetch subscription:', err);
          setCurrentSubscription(null);
        }

        // Fetch notifications
        try {
          const notificationsData = await fetchNotifications({ page: 0, size: 10 }, token);
          setNotifications(notificationsData.content || []);
          console.log('✅ Notifications fetched:', notificationsData.content?.length || 0);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch employer data:', error);
        setError(error?.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, onNavigate]);

  // Refresh data when component becomes visible (e.g., when user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && token) {
        // Refresh data when page becomes visible
        const fetchData = async () => {
          try {
            const employerData = await fetchEmployer(user.id, token);
            setEmployer(employerData);

            const { fetchJobsByEmployer } = await import('../api/jobs');
            const jobsResponse = await fetchJobsByEmployer(employerData.id, {
              status: 'all',
              page: 0,
              size: 1000
            });
            const employerJobs = jobsResponse.content || [];
            setMyJobs(employerJobs);

            // Refresh applications
            if (employerJobs.length > 0) {
              const jobIds = employerJobs.map((job: any) => job.id);
              const allApplications: ApplicationResponse[] = [];
              for (const jobId of jobIds) {
                try {
                  const appsResponse = await fetchApplications({
                    jobId,
                    page: 0,
                    size: 1000  // Fetch all applications
                  }, token);
                  if (appsResponse && appsResponse.content && Array.isArray(appsResponse.content)) {
                    allApplications.push(...appsResponse.content);
                  } else if (Array.isArray(appsResponse)) {
                    allApplications.push(...appsResponse);
                  }
                } catch (err) {
                  console.error(`Failed to fetch applications for job ${jobId}:`, err);
                }
              }
              console.log(`🔄 Refreshed applications: ${allApplications.length} total`);
              setMyApplications(allApplications);
            }

            // Refresh notifications
            try {
              const notificationsData = await fetchNotifications({ page: 0, size: 10 }, token);
              setNotifications(notificationsData.content || []);
            } catch (error) {
              console.error('Error refreshing notifications:', error);
            }
          } catch (error) {
            console.error('Failed to refresh data:', error);
          }
        };
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, token]);

  const handleEditJob = (jobId: string) => {
    // In a real app, this would open an edit modal or navigate to edit page
    alert(`Editing job ${jobId}`);
  };

  const handleCloseJob = (jobId: string) => {
    setMyJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'closed' as const } : job
    ));
  };

  const handleViewApplications = (jobId: string) => {
    // In a real app, this would navigate to applications page for this job
    alert(`Viewing applications for job ${jobId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // If employer data is not loaded yet, show loading
  if (!employer) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employer data...</p>
        </div>
      </div>
    );
  }

  // If employer is not verified, show verification required message
  if (employer?.verificationStatus === 'pending') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h1 className="text-3xl text-gray-900 mb-2">Verification Required</h1>
            <p className="text-gray-600 mb-6">
              Your employer account needs to be verified before you can access the dashboard and post jobs.
              Please complete the verification process.
            </p>
            <Button onClick={() => onNavigate('verification')} className="bg-blue-600 hover:bg-blue-700">
              Go to Verification
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 pb-8">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">{employer?.companyName || 'Employer Dashboard'}</h1>
              <p className="text-gray-600">Manage your job postings and applications</p>
            </div>
            <Button
              className={currentSubscription && currentSubscription.status === 'active'
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"}
              disabled={!currentSubscription || currentSubscription.status !== 'active'}
              onClick={() => {
                if (currentSubscription && currentSubscription.status === 'active') {
                  onNavigate('employer-post-job');
                } else {
                  onNavigate('subscription');
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {currentSubscription && currentSubscription.status === 'active'
                ? 'Post New Job'
                : 'Post New Job (Subscription Required)'}
            </Button>
          </div>
        </div>

        {/* Verification Status Alert */}
        {employer?.verificationStatus === 'approved' && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your account is verified! You can now post jobs and access all employer features.
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Alert */}
        {currentSubscription && currentSubscription.status === 'active' ? (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Active Subscription:</strong> {currentSubscription.plan.name} -
              Posts used: {currentSubscription.jobPostsUsed} / {currentSubscription.jobPostsAllowed}
              {currentSubscription.endDate && ` (Valid until ${new Date(currentSubscription.endDate).toLocaleDateString('en-IN')})`}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              To start posting jobs, you need to subscribe to a plan. Choose a subscription plan that fits your needs.
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => onNavigate('subscription')}
              >
                View Plans
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Jobs</p>
                <p className="text-3xl text-gray-900">{myJobs.filter(j => j.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Applications</p>
                <p className="text-3xl text-gray-900">{totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Views</p>
                <p className="text-3xl text-gray-900">{totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Verification</p>
                <p className="text-sm text-green-600">Verified</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Manage Applications Button */}
        <div className="mb-8">
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white"
            onClick={() => onNavigate('employer-manage-applications')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Go to Manage Applications
          </Button>
        </div>

        {/* Manage Applications Card */}
        <Card className="p-6 mb-8 border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => onNavigate('employer-manage-applications')}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Manage Applications</h3>
              <p className="text-gray-600">Review and manage job applications from candidates.</p>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="subscription" className="w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max min-w-full sm:w-auto">
              <TabsTrigger value="subscription" className="whitespace-nowrap">Subscription</TabsTrigger>
              <TabsTrigger value="jobs" className="whitespace-nowrap">My Jobs</TabsTrigger>
              <TabsTrigger value="applications" className="whitespace-nowrap">Applications</TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">
                Notifications
                {notifications.filter((n: any) => !n.read).length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {notifications.filter((n: any) => !n.read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap" onClick={() => onNavigate('analytics')}>Analytics</TabsTrigger>
              <TabsTrigger value="verification" className="whitespace-nowrap">Verification</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">Your Job Postings</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          No jobs posted yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      myJobs.map((job) => {
                        return (
                          <TableRow key={job.id}>
                            <TableCell>
                              <div>
                                <p className="text-gray-900">{job.title}</p>
                                <p className="text-sm text-gray-500">{job.location}</p>
                              </div>
                            </TableCell>
                            <TableCell>{job.category || 'N/A'}</TableCell>
                            <TableCell>{job.applications || 0}</TableCell>
                            <TableCell>{job.views || 0}</TableCell>
                            <TableCell>{job.postedDate ? new Date(job.postedDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={
                                job.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                    'bg-gray-100 text-gray-700 border-gray-200'
                              } variant="outline">
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit (Subscription Required)
                                </Button>
                                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Close (Subscription Required)
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-gray-900">Job Applications</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage applications for your posted jobs
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!user || !token || !employer) return;
                      try {
                        console.log('🔄 Manually refreshing applications...');
                        const { fetchJobsByEmployer } = await import('../api/jobs');
                        const jobsResponse = await fetchJobsByEmployer(employer.id, {
                          status: 'all',
                          page: 0,
                          size: 1000
                        });
                        const employerJobs = jobsResponse.content || [];

                        if (employerJobs.length > 0) {
                          const jobIds = employerJobs.map((job: any) => job.id);
                          const allApplications: ApplicationResponse[] = [];

                          for (const jobId of jobIds) {
                            try {
                              const appsResponse = await fetchApplications({
                                jobId,
                                page: 0,
                                size: 1000
                              }, token);

                              if (appsResponse && appsResponse.content && Array.isArray(appsResponse.content)) {
                                allApplications.push(...appsResponse.content);
                              } else if (Array.isArray(appsResponse)) {
                                allApplications.push(...appsResponse);
                              }
                            } catch (err) {
                              console.error(`Failed to fetch applications for job ${jobId}:`, err);
                            }
                          }

                          console.log(`✅ Refreshed: ${allApplications.length} applications`);
                          setMyApplications(allApplications);
                          alert(`Applications refreshed! Found ${allApplications.length} applications.`);
                        } else {
                          setMyApplications([]);
                        }
                      } catch (error) {
                        console.error('Failed to refresh applications:', error);
                        alert('Failed to refresh applications. Please check console for details.');
                      }
                    }}
                  >
                    🔄 Refresh
                  </Button>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Total Applications</div>
                    <div className="text-2xl font-bold text-blue-900">{myApplications.length}</div>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-sm text-green-600 mb-1">New (Applied)</div>
                    <div className="text-2xl font-bold text-green-900">
                      {myApplications.filter((app: ApplicationResponse) => app.status === 'applied').length}
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-sm text-purple-600 mb-1">Shortlisted</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {myApplications.filter((app: ApplicationResponse) => app.status === 'shortlisted').length}
                    </div>
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="text-sm text-orange-600 mb-1">Interviews</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {myApplications.filter((app: ApplicationResponse) => app.status === 'interview').length}
                    </div>
                  </Card>
                </div>

                {/* Applications Grouped by Job */}
                {loading ? (
                  <div className="text-center text-gray-500 py-8">Loading applications...</div>
                ) : myApplications.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div>
                      <p className="text-lg mb-2">No applications found</p>
                      {myJobs.length > 0 && (
                        <p className="text-sm text-gray-400">
                          You have {myJobs.length} job{myJobs.length > 1 ? 's' : ''} posted.
                          Applications will appear here when candidates apply.
                        </p>
                      )}
                      {myJobs.length === 0 && (
                        <p className="text-sm text-gray-400">
                          Post a job to start receiving applications.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group applications by job */}
                    {(() => {
                      const applicationsByJob = new Map<string, ApplicationResponse[]>();
                      myApplications.forEach((app: ApplicationResponse) => {
                        const jobId = app.jobId || 'unknown';
                        if (!applicationsByJob.has(jobId)) {
                          applicationsByJob.set(jobId, []);
                        }
                        applicationsByJob.get(jobId)!.push(app);
                      });

                      return Array.from(applicationsByJob.entries()).map(([jobId, apps]) => {
                        const job = myJobs.find((j: any) => j.id === jobId);
                        const jobTitle = job?.title || apps[0]?.jobTitle || 'Unknown Job';
                        const newApps = apps.filter((app: ApplicationResponse) => app.status === 'applied').length;
                        
                        return (
                          <Card key={jobId} className="border-l-4 border-l-blue-500">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{jobTitle}</h4>
                                  <p className="text-sm text-gray-600">
                                    {apps.length} application{apps.length !== 1 ? 's' : ''}
                                    {newApps > 0 && (
                                      <Badge className="ml-2 bg-blue-500 text-white">
                                        {newApps} new
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {job?.status || 'N/A'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                {apps.map((application: ApplicationResponse) => (
                                  <div key={application.id} className="border-2 border-blue-200 rounded-lg p-4 bg-white hover:bg-blue-50 transition-colors shadow-sm">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        {/* Candidate Name - Prominent */}
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-bold">
                                              {application.candidateName?.charAt(0)?.toUpperCase() || 'A'}
                                            </span>
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-bold text-lg text-gray-900">{application.candidateName || 'Unknown Candidate'}</h5>
                                            <p className="text-xs text-gray-500">Candidate Application</p>
                                          </div>
                                          <Badge className={
                                            application.status === 'shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                                              application.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                application.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                  application.status === 'selected' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'
                                          } variant="outline">
                                            {application.status}
                                          </Badge>
                                          {application.status === 'applied' && (
                                            <Badge className="bg-blue-500 text-white animate-pulse">
                                              New
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {/* Contact Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            <div>
                                              <span className="text-xs text-gray-600">Email</span>
                                              <a 
                                                href={`mailto:${application.candidateEmail}`} 
                                                className="block text-blue-600 hover:underline font-medium text-sm"
                                              >
                                                {application.candidateEmail}
                                              </a>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            <Phone className="w-4 h-4 text-green-500" />
                                            <div>
                                              <span className="text-xs text-gray-600">Phone</span>
                                              <a 
                                                href={`tel:${application.candidatePhone}`} 
                                                className="block text-green-600 hover:underline font-medium text-sm"
                                              >
                                                {application.candidatePhone || 'N/A'}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Additional Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                          <div>
                                            <span className="font-medium">Applied:</span> {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString('en-IN') : 'N/A'}
                                          </div>
                                        </div>
                                        
                                        {/* Notes */}
                                        {application.notes && (
                                          <div className="mt-2 text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <span className="font-medium text-yellow-800">Application Notes:</span>
                                            <p className="mt-1 text-gray-700">{application.notes}</p>
                                          </div>
                                        )}
                                        
                                        {/* Resume */}
                                        <div className="mt-3">
                                          {application.resumeUrl ? (
                                            <Button 
                                              variant="default" 
                                              size="sm"
                                              onClick={() => openFileInViewer(application.resumeUrl!)}
                                              className="bg-purple-600 hover:bg-purple-700"
                                            >
                                              <FileText className="w-4 h-4 mr-2" />
                                              View Resume
                                            </Button>
                                            </Button>
                                          ) : (
                                            <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
                                              No resume uploaded by candidate
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <Card className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg text-gray-900 mb-4">Choose Your Subscription Plan</h3>
                <p className="text-gray-600 mb-6">
                  Select a subscription plan to start posting jobs and access all employer features.
                </p>
                <Button onClick={() => onNavigate('subscription')}>
                  View Subscription Plans
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-6">
            <Card className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg text-gray-900 mb-4">Employer Verification</h3>
                <p className="text-gray-600 mb-6">
                  Complete your verification to access all features and build trust with candidates.
                </p>
                <Button onClick={() => onNavigate('verification')}>
                  Go to Verification
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-900">Recent Notifications</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('notifications')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="pb-3 border-b last:border-b-0">
                      <p className="text-sm text-gray-900 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
