import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Briefcase, Eye, MousePointer, Calendar, Download, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { fetchAnalyticsOverview, fetchJobsByCategory, fetchJobsByLocation, fetchTopJobs } from '../api/analytics';

interface AnalyticsDashboardProps {
  userRole: 'admin' | 'employer';
  userId?: string;
}

// Data is fetched dynamically from backend analytics APIs

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AnalyticsDashboard({ userRole, userId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [overview, setOverview] = useState<{ totalJobs: number; totalApplications: number; totalUsers: number; totalEmployers: number } | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ov, cats, locs, tops] = await Promise.all([
          fetchAnalyticsOverview(),
          fetchJobsByCategory(),
          fetchJobsByLocation(),
          fetchTopJobs(),
        ]);
        setOverview(ov);
        setCategoryData(Array.isArray(cats) ? cats : []);
        setLocationData(Array.isArray(locs) ? locs : []);
        setTopJobs(Array.isArray(tops) ? tops : []);
      } catch (e) {
        setOverview({ totalJobs: 0, totalApplications: 0, totalUsers: 0, totalEmployers: 0 });
        setCategoryData([]);
        setLocationData([]);
        setTopJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalJobs = isAdmin ? (overview?.totalJobs ?? 0) : undefined;
  const totalApplications = isAdmin ? (overview?.totalApplications ?? 0) : undefined;
  const totalUsers = isAdmin ? (overview?.totalUsers ?? 0) : undefined;
  const totalEmployers = isAdmin ? (overview?.totalEmployers ?? 0) : undefined;
  const avgResponseTime = '2.3 days';
  const conversionRate = '12.5%';

  const topPerformingJobs = topJobs;

  const recentActivity: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">
              {isAdmin ? 'Platform Analytics' : 'Job Performance Analytics'}
            </h1>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Comprehensive insights into platform performance and user engagement'
                : 'Track your job postings performance and candidate engagement'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
                <p className="text-3xl text-gray-900">{(totalJobs ?? 0).toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
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
                <p className="text-3xl text-gray-900">{(totalApplications ?? 0).toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {isAdmin && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl text-gray-900">{(totalUsers ?? 0).toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+15.2%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Employers</p>
                    <p className="text-3xl text-gray-900">{(totalEmployers ?? 0)}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+5.7%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </>
          )}

          {!isAdmin && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Avg. Response Time</p>
                    <p className="text-3xl text-gray-900">{avgResponseTime}</p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">-0.5 days</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                    <p className="text-3xl text-gray-900">{conversionRate}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+2.1%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs Performance</TabsTrigger>
            <TabsTrigger value="users">Users & Engagement</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Job Views & Applications Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg text-gray-900">Job Views & Applications</h3>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="applications">Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {/* Using jobs-by-location as dynamic series; X=location; Y=views/applications approximated */}
                  <LineChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={selectedMetric === 'views' ? 'jobs' : 'applications'} 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Job Categories Distribution */}
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-6">Jobs by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Performing Jobs */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg text-gray-900 mb-6">Top Performing Jobs</h3>
              <div className="space-y-4">
                {topPerformingJobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-medium">{job.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {job.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4" />
                          {job.conversion}% conversion
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Jobs by Location */}
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-6">Jobs by Location</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Applications by Location */}
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-6">Applications by Location</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {isAdmin ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg text-gray-900 mb-6">User Registration Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="jobs" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'job' ? 'bg-blue-500' :
                          activity.type === 'application' ? 'bg-green-500' :
                          activity.type === 'approval' ? 'bg-yellow-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-600">{activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-6">Candidate Engagement</h3>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Candidate engagement analytics will be available here</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-6">Generate Reports</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Job Performance Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  Application Analytics
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  User Engagement Report
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="outline" className="h-20 flex-col">
                      <Download className="w-6 h-6 mb-2" />
                      Platform Overview
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Download className="w-6 h-6 mb-2" />
                      Employer Performance
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Download className="w-6 h-6 mb-2" />
                      Financial Report
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


