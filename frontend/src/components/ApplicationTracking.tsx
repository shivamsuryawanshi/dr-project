import { useState } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, FileText, Eye, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { mockApplications, mockJobs } from '../data/mockData';
import { Application, ApplicationStatus } from '../types';

interface ApplicationTrackingProps {
  userRole: 'candidate' | 'employer';
  userId: string;
}

interface ApplicationWithJob extends Application {
  job: any;
}

export function ApplicationTracking({ userRole, userId }: ApplicationTrackingProps) {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJob | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const mockApplicationsWithJobs: ApplicationWithJob[] = [
    {
      ...mockApplications[0],
      job: mockJobs.find(j => j.id === mockApplications[0].jobId)
    },
    {
      ...mockApplications[1],
      job: mockJobs.find(j => j.id === mockApplications[1].jobId)
    },
    {
      ...mockApplications[2],
      job: mockJobs.find(j => j.id === mockApplications[2].jobId)
    }
  ];

  const getStatusIcon = (status: ApplicationStatus) => {
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

  const getStatusColor = (status: ApplicationStatus) => {
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

  const getStatusProgress = (status: ApplicationStatus) => {
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

  const getStatusSteps = (status: ApplicationStatus) => {
    const steps = [
      { key: 'applied', label: 'Applied', completed: true },
      { key: 'shortlisted', label: 'Shortlisted', completed: ['shortlisted', 'interview', 'selected'].includes(status) },
      { key: 'interview', label: 'Interview', completed: ['interview', 'selected'].includes(status) },
      { key: 'selected', label: 'Selected', completed: status === 'selected' }
    ];
    return steps;
  };

  const updateApplicationStatus = (applicationId: string, newStatus: ApplicationStatus, notes?: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, notes: notes || app.notes }
          : app
      )
    );
  };

  const scheduleInterview = (applicationId: string, interviewDate: string, notes?: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'interview', interviewDate, notes: notes || app.notes }
          : app
      )
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            {userRole === 'candidate' ? 'My Applications' : 'Application Management'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'candidate' 
              ? 'Track the status of your job applications'
              : 'Manage and review candidate applications'
            }
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {mockApplicationsWithJobs.map((application) => (
                <Card key={application.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg text-gray-900">{application.job?.title}</h3>
                        <Badge className={getStatusColor(application.status)} variant="outline">
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Organization:</span>
                          <span>{application.job?.organization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Location:</span>
                          <span>{application.job?.location}</span>
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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      
                      {userRole === 'employer' && (
                        <>
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
                                    updateApplicationStatus(selectedApplication.id, status, notes);
                                    setIsStatusDialogOpen(false);
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
                                    scheduleInterview(selectedApplication.id, date, notes);
                                    setIsInterviewDialogOpen(false);
                                  }
                                }}
                                onCancel={() => setIsInterviewDialogOpen(false)}
                              />
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Candidate Info (for employers) */}
                  {userRole === 'employer' && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Candidate Information</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{application.candidateEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{application.candidatePhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Resume
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-6">
              {mockApplicationsWithJobs
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
              {mockApplicationsWithJobs
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
              {mockApplicationsWithJobs
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
  application: ApplicationWithJob | null;
  onUpdate: (status: ApplicationStatus, notes?: string) => void;
  onCancel: () => void;
}

function StatusUpdateForm({ application, onUpdate, onCancel }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<ApplicationStatus>('applied');
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
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
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
  application: ApplicationWithJob | null;
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


