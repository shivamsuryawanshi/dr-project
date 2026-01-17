// AI assisted development
import { Briefcase, BookmarkIcon, Bell, User, FileText, TrendingUp, ArrowLeft, Trash2, Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
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
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const profileCompleteness = 75;

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
      let applications: ApplicationResponse[] = [];
      try {
        console.log('📋 Fetching applications for candidate:', user.id);
        const applicationsData = await fetchApplications({ candidateId: user.id }, token);
        applications = applicationsData?.content || [];
        console.log('✅ Applications fetched:', applications.length, 'applications found');
      } catch (error: any) {
        console.error('❌ Error fetching applications:', error);
        // If 500 error or any error, just set empty array
        applications = [];
      }
      
      // Map applications to jobs with status - only if we have applications
      if (applications.length > 0) {
        const appliedJobsWithDetails = await Promise.all(
          applications.map(async (app: ApplicationResponse) => {
            try {
              // Try to fetch job details by ID
              let job = null;
              try {
                job = await fetchJob(app.jobId);
              } catch (error) {
                console.error(`Error fetching job ${app.jobId}:`, error);
                // If fetch fails, use fallback
              }
              
              if (job) {
                return {
                  ...job,
                  status: app.status === 'applied' ? 'under_review' : app.status,
                  appliedDate: app.appliedDate,
                  interviewDate: app.interviewDate,
                };
              }
              
              // Fallback if job not found
              return {
                id: app.jobId,
                title: app.jobTitle,
                organization: app.jobOrganization,
                sector: 'private' as const,
                status: app.status === 'applied' ? 'under_review' : app.status,
                appliedDate: app.appliedDate,
                interviewDate: app.interviewDate,
              };
            } catch (error) {
              console.error('Error processing application:', error);
              // Return minimal job data
              return {
                id: app.jobId,
                title: app.jobTitle,
                organization: app.jobOrganization,
                sector: 'private' as const,
                status: app.status === 'applied' ? 'under_review' : app.status,
                appliedDate: app.appliedDate,
                interviewDate: app.interviewDate,
              };
            }
          })
        );
        
        setAppliedJobs(appliedJobsWithDetails);
      } else {
        // No applications found
        setAppliedJobs([]);
      }

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
      setAppliedJobs([]);
      setSavedJobs([]);
      setRecommendedJobs([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

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
                <p className="text-3xl text-gray-900">{appliedJobs.length}</p>
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
                <p className="text-3xl text-gray-900">{appliedJobs.filter(job => job.status === 'interview' || job.interviewDate).length}</p>
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
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading applications...</div>
                ) : appliedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't applied for any jobs yet.</p>
                    <Button className="mt-4" onClick={() => onNavigate('jobs')}>
                      Browse Jobs
                    </Button>
                  </div>
                ) : (
                  appliedJobs.map((job) => (
                  <Card key={job.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span 
                              className={`${
                                job.sector === 'government' 
                                  ? '!bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white' 
                                  : '!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white'
                              } !border-0 shadow-md px-3 py-1 text-xs font-semibold rounded-md inline-flex`}
                              style={{
                                background: job.sector === 'government' 
                                  ? 'linear-gradient(to right, rgb(59 130 246), rgb(37 99 235))' 
                                  : 'linear-gradient(to right, rgb(16 185 129), rgb(5 150 105))',
                                color: 'white'
                              }}
                            >
                              {job.sector === 'government' ? 'Government' : 'Private'}
                            </span>
                            <Badge 
                              className={
                                job.status === 'shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                                job.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              }
                              variant="outline"
                            >
                              {job.status === 'under_review' ? 'Under Review' :
                               job.status === 'shortlisted' ? 'Shortlisted' :
                               job.status === 'interview' ? 'Interview Scheduled' : job.status}
                            </Badge>
                          </div>
                          <h3 
                            className="text-lg text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                            onClick={() => onNavigate('job-detail', job.id)}
                          >
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600">{job.organization}</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>Applied on: {new Date(job.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        {job.interviewDate && (
                          <p className="text-purple-600 mt-1">
                            Interview scheduled: {new Date(job.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onNavigate('job-detail', job.id)}>
                          View Job
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTrackStatus(job.id)}>
                          Track Status
                        </Button>
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
