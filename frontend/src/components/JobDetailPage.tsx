import { MapPin, Briefcase, Calendar, Building2, GraduationCap, DollarSign, FileText, ExternalLink, Clock, Eye, User, Mail, Phone, Upload, Shield, BriefcaseIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { useEffect, useState } from 'react';
import { fetchJob } from '../api/jobs';
import { useParams } from 'react-router-dom';
import { applyForJob } from '../api/applications';
import { useAuth } from '../contexts/AuthContext';

interface JobDetailPageProps {
  onNavigate: (page: string) => void;
  showApplyDialog?: boolean;
}

export function JobDetailPage({ onNavigate, showApplyDialog: initialShowApplyDialog = false }: JobDetailPageProps) {
  const { isAuthenticated, user, token } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(initialShowApplyDialog);
  const [applicationForm, setApplicationForm] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    resume: null as File | null,
    notes: ''
  });
  const [applying, setApplying] = useState(false);
  const locationText = job?.location || [job?.city, job?.state].filter(Boolean).join(', ');
  const { jobId } = useParams<{ jobId: string }>();

  useEffect(() => {
    (async () => {
      if (!jobId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchJob(jobId);
        setJob(data);
        setNotFound(false);
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (user) {
      setApplicationForm(prev => ({ ...prev, candidateName: user.name, candidateEmail: user.email }));
    }
  }, [user, showApplyDialog]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading job…</div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Button onClick={() => onNavigate('jobs')}>Browse All Jobs</Button>
        </div>
      </div>
    );
  }

  const isGovernment = job.sector === 'government';
  const daysLeft = job.lastDate ? Math.ceil((new Date(job.lastDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleApplicationSubmit = async () => {
    if (!job || !token) return;

    setApplying(true);
    try {
      await applyForJob({
        jobId: job.id,
        candidateName: applicationForm.candidateName,
        candidateEmail: applicationForm.candidateEmail,
        candidatePhone: applicationForm.candidatePhone,
        resume: applicationForm.resume || undefined,
        notes: applicationForm.notes || undefined,
        token: token
      });

      alert('Application submitted successfully!');
      setShowApplyDialog(false);
      setApplicationForm({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        resume: null,
        notes: ''
      });
    } catch (error) {
      alert('Failed to submit application. Please try again.');
      console.error('Application error:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span 
                    className={`${
                      isGovernment 
                        ? '!bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white' 
                        : '!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white'
                    } !border-0 shadow-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 rounded-md inline-flex`}
                    style={{
                      background: isGovernment 
                        ? 'linear-gradient(to right, rgb(59 130 246), rgb(37 99 235))' 
                        : 'linear-gradient(to right, rgb(16 185 129), rgb(5 150 105))',
                      color: 'white'
                    }}
                  >
                    {isGovernment ? (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        Government
                      </>
                    ) : (
                      <>
                        <BriefcaseIcon className="w-3.5 h-3.5" />
                        Private
                      </>
                    )}
                  </span>
                  <Badge variant="outline">{job.category}</Badge>
                  {job.featured && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200" variant="outline">
                      Featured
                    </Badge>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-5 h-5" />
                    <span className="text-lg">{job.organization}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{job.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.applications} applications</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.postedDate && <span>Posted {new Date(job.postedDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Details */}
            <Card className="p-6">
              <h2 className="text-xl text-gray-900 mb-4">Job Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900">{locationText || 'Location'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Number of Posts</p>
                    <p className="text-gray-900">{job.numberOfPosts}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Qualification</p>
                    <p className="text-gray-900">{job.qualification}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-gray-900">{job.experience}</p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p className="text-gray-900">{job.salary}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Date to Apply</p>
                    <p className="text-gray-900">{new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <h2 className="text-xl text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </Card>

            {/* Government Job Additional Info */}
            {isGovernment && job.pdfUrl && (
              <Card className="p-6">
                <h2 className="text-xl text-gray-900 mb-4">Official Documents</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={job.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Official Notification PDF
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  </Button>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Inline Preview</div>
                    <div className="border rounded overflow-hidden">
                      <object data={job.pdfUrl} type="application/pdf" width="100%" height="600px">
                        <iframe src={job.pdfUrl} title="PDF Preview" width="100%" height="600px" />
                      </object>
                    </div>
                  </div>
                  {job.applyLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Official Apply Link
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Apply Card */}
            <Card className="p-6 sticky top-20">
              <div className="space-y-4">
                {daysLeft > 0 && (
                  <Alert className={daysLeft <= 7 ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
                    <Calendar className="w-4 h-4" />
                    <AlertDescription>
                      {daysLeft <= 7 ? (
                        <span className="text-red-700">Only {daysLeft} days left to apply!</span>
                      ) : (
                        <span className="text-blue-700">{daysLeft} days remaining</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {isGovernment ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Apply directly through our platform or visit the official website.
                    </p>
                    {isAuthenticated ? (
                      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Apply Now
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                          <DialogDescription>
                            Fill out the form below to submit your application for this position.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="candidateName">Full Name *</Label>
                            <Input
                              id="candidateName"
                              value={applicationForm.candidateName}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidateName: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="candidateEmail">Email Address *</Label>
                            <Input
                              id="candidateEmail"
                              type="email"
                              value={applicationForm.candidateEmail}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidateEmail: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="candidatePhone">Phone Number *</Label>
                            <Input
                              id="candidatePhone"
                              value={applicationForm.candidatePhone}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidatePhone: e.target.value }))}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resume">Resume/CV</Label>
                            <Input
                              id="resume"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, resume: e.target.files?.[0] || null }))}
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload PDF, DOC, or DOCX (max 10MB)</p>
                          </div>
                          <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              value={applicationForm.notes}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Any additional information you'd like to share..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowApplyDialog(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApplicationSubmit}
                              disabled={applying || !applicationForm.candidateName || !applicationForm.candidateEmail || !applicationForm.candidatePhone}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {applying ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onNavigate('login')}>
                          Login to Apply
                        </Button>
                        <p className="text-xs text-center text-gray-500">Please login to submit your application.</p>
                      </div>
                    )}
                    {job.applyLink && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Official Apply Link
                          <ExternalLink className="w-4 h-4 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {job.pdfUrl && (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={job.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          View Notification
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Apply directly through our platform. Your profile and resume will be shared with the employer.
                    </p>
                    {isAuthenticated ? (
                      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            Apply Now
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Apply for {job.title}</DialogTitle>
                          <DialogDescription>
                            Fill out the form below to submit your application for this position.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="candidateName">Full Name *</Label>
                            <Input
                              id="candidateName"
                              value={applicationForm.candidateName}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidateName: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="candidateEmail">Email Address *</Label>
                            <Input
                              id="candidateEmail"
                              type="email"
                              value={applicationForm.candidateEmail}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidateEmail: e.target.value }))}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="candidatePhone">Phone Number *</Label>
                            <Input
                              id="candidatePhone"
                              value={applicationForm.candidatePhone}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, candidatePhone: e.target.value }))}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resume">Resume/CV</Label>
                            <Input
                              id="resume"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, resume: e.target.files?.[0] || null }))}
                            />
                            <p className="text-xs text-gray-500 mt-1">Upload PDF, DOC, or DOCX (max 10MB)</p>
                          </div>
                          <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              value={applicationForm.notes}
                              onChange={(e) => setApplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Any additional information you'd like to share..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowApplyDialog(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApplicationSubmit}
                              disabled={applying || !applicationForm.candidateName || !applicationForm.candidateEmail || !applicationForm.candidatePhone}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {applying ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onNavigate('login')}>
                          Login to Apply
                        </Button>
                        <p className="text-xs text-center text-gray-500">Please login to submit your application.</p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                <Button variant="outline" className="w-full">
                  Save Job
                </Button>
              </div>
            </Card>

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">About Organization</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{job.organization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{job.location}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
