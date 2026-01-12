// AI assisted development
import { Plus, Briefcase, Users, Eye, CheckCircle, XCircle, Calendar, ArrowLeft, Edit, Trash2, AlertTriangle, LogOut } from 'lucide-react';
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

  const totalViews = myJobs.reduce((sum, job) => sum + (job.views || 0), 0);
  const totalApplications = myApplications.length;

  // Fetch employer data and jobs on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) return;

      try {
        // Fetch employer data
        const employerData = await fetchEmployer(user.id, token);
        setEmployer(employerData);

        // If verification is pending, redirect to verification page
        if (employerData.verificationStatus === 'pending') {
          onNavigate('verification');
          return;
        }

        // Fetch all jobs and filter by employer
        const jobsResponse = await fetchJobs({ page: 0, size: 1000 });
        const allJobs = jobsResponse.content || [];
        
        // Filter jobs by employer ID
        const employerJobs = allJobs.filter((job: any) => {
          // Check if job's organization matches employer's company name
          // Or if there's an employerId field
          return job.organization === employerData.companyName || 
                 (job.employerId && job.employerId === employerData.id);
        });
        
        setMyJobs(employerJobs);

        // Fetch applications for employer's jobs
        if (employerJobs.length > 0) {
          try {
            const jobIds = employerJobs.map((job: any) => job.id);
            const allApplications: ApplicationResponse[] = [];
            
            // Fetch applications for each job
            for (const jobId of jobIds) {
              try {
                const appsResponse = await fetchApplications({ jobId }, token);
                if (appsResponse.content && Array.isArray(appsResponse.content)) {
                  allApplications.push(...appsResponse.content);
                }
              } catch (err) {
                console.error(`Failed to fetch applications for job ${jobId}:`, err);
              }
            }
            
            setMyApplications(allApplications);
          } catch (error) {
            console.error('Failed to fetch applications:', error);
            setMyApplications([]);
          }
        } else {
          setMyApplications([]);
        }
      } catch (error) {
        console.error('Failed to fetch employer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, onNavigate]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If employer is not verified, show verification required message
  if (employer?.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">{employer?.companyName || 'Employer Dashboard'}</h1>
              <p className="text-gray-600">Manage your job postings and applications</p>
            </div>
            <Button
              className="bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
              disabled
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job (Subscription Required)
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

        {/* Main Content */}
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics" onClick={() => onNavigate('analytics')}>Analytics</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

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
                <h3 className="text-lg text-gray-900 mb-4">Recent Applications</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job Applied</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      myApplications.map((application) => {
                        return (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div>
                                <p className="text-gray-900">{application.candidateName}</p>
                                <p className="text-sm text-gray-500">{application.candidateEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{application.jobTitle || 'N/A'}</TableCell>
                            <TableCell>{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={
                                application.status === 'shortlisted' ? 'bg-green-100 text-green-700 border-green-200' :
                                application.status === 'interview' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                application.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-gray-100 text-gray-700 border-gray-200'
                              } variant="outline">
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                  View Resume (Subscription Required)
                                </Button>
                                <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Schedule (Subscription Required)
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
        </Tabs>
      </div>
    </div>
  );
}
