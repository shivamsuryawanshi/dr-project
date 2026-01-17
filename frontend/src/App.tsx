// AI assisted development
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { createJob } from './api/jobs';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { JobListingPage } from './components/JobListingPage';
import { JobDetailPage } from './components/JobDetailPage';
import { CandidateDashboard } from './components/CandidateDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfilePage } from './components/ProfilePage';
import { AboutPage } from './components/AboutPage';
import { FAQPage } from './components/FAQPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsConditionsPage } from './components/TermsConditionsPage';
import { AdminJobManagementPage } from './components/AdminJobManagementPage';
import { JobPostingForm } from './components/JobPostingForm';
import { AdminUsersPage } from './components/AdminUsersPage';
import { EmployerVerificationPage } from './components/EmployerVerificationPage';
import { AdminApplications } from './components/AdminApplications';
import { AdminNewsManagementPage } from './components/AdminNewsManagementPage';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { NotificationCenter } from './components/NotificationCenter';
import { SubscriptionPage } from './components/SubscriptionPage';
import { EmployerVerification } from './components/EmployerVerification';
import { NewsPage } from './components/NewsPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(location.pathname.substring(1) || 'home');

  useEffect(() => {
    setCurrentPage(location.pathname.substring(1) || 'home');
  }, [location]);

  const handleNavigate = (page: string, entityId?: string) => {
    if (page === 'logout') {
      logout();
      navigate('/login');
      return;
    }
    // Handle dashboard navigation based on user role - ignore entityId for dashboard
    if (page === 'dashboard') {
      if (!isAuthenticated || !user) {
        navigate('/login');
        return;
      }
      // Navigate to role-specific dashboard
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'employer') {
        navigate('/dashboard/employer');
      } else if (user.role === 'candidate') {
        navigate('/dashboard/candidate');
      } else {
        navigate('/dashboard/candidate'); // Default fallback
      }
      return;
    }
    const path = entityId ? `/${page}/${entityId}` : `/${page}`;
    navigate(path);
  };

  const getDashboard = () => {
    if (!isAuthenticated || !user) return <AuthPage mode="login" onNavigate={handleNavigate} />;    
    if (user.role === 'admin') return <AdminDashboard onNavigate={handleNavigate} />;    
    if (user.role === 'employer') return <EmployerVerification onNavigate={handleNavigate} />; // Employers land on verification first
    return <CandidateDashboard onNavigate={handleNavigate} />;    
  }  

  return (
    <>
      <Header currentPage={currentPage} onNavigate={handleNavigate} isAuthenticated={isAuthenticated} userRole={user?.role} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/login" element={<AuthPage mode="login" onNavigate={handleNavigate} />} />
          <Route path="/register" element={<AuthPage mode="register" onNavigate={handleNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/jobs" element={<JobListingPage onNavigate={handleNavigate} />} />
          <Route path="/govt-jobs" element={<JobListingPage onNavigate={handleNavigate} sector="government" />} />
          <Route path="/private-jobs" element={<JobListingPage onNavigate={handleNavigate} sector="private" />} />
          <Route path="/news" element={<NewsPage onNavigate={handleNavigate} />} />
          <Route path="/job-detail/:jobId" element={<JobDetailPage onNavigate={handleNavigate} />} />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
          <Route path="/faq" element={<FAQPage onNavigate={handleNavigate} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage onNavigate={handleNavigate} />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage onNavigate={handleNavigate} />} />
          <Route path="/subscription" element={<SubscriptionPage onNavigate={handleNavigate} />} />
          
          {/* Notifications Route */}
          <Route 
            path="/notifications" 
            element={
              isAuthenticated && user ? (
                <NotificationCenter userId={user.id} userRole={user.role as 'admin' | 'employer' | 'candidate'} />
              ) : (
                <AuthPage mode="login" onNavigate={handleNavigate} />
              )
            } 
          />

          {/* Authenticated Routes */}
          {isAuthenticated && user && (
            <>
              {/* Generic dashboard route, redirects based on role */}
              <Route path="/dashboard" element={getDashboard()} />

              {/* Role-specific dashboard routes */}
              <Route path="/dashboard/candidate" element={<CandidateDashboard onNavigate={handleNavigate} />} />
              <Route path="/dashboard/employer" element={<EmployerDashboard onNavigate={handleNavigate} />} />
              <Route path="/verification" element={<EmployerVerification onNavigate={handleNavigate} />} />
              
              {/* Employer Job Posting Route */}
              {user.role === 'employer' && (
                <Route path="/employer-post-job" element={
                  <JobPostingForm 
                    onCancel={() => handleNavigate('dashboard/employer')} 
                    onSave={async (jobData: any) => {
                      try {
                        if (!token) {
                          alert('Authentication token not found. Please login again.');
                          return;
                        }
                        const payload = {
                          ...jobData,
                          status: 'pending', // Jobs need admin approval
                          featured: false,
                          views: 0,
                          applications: 0,
                          type: 'hospital'
                        };
                        await createJob(payload);
                        alert('Job posted successfully! It will be reviewed by admin before publishing.');
                        handleNavigate('dashboard/employer');
                      } catch (e: any) {
                        console.error("Error creating job:", e);
                        console.error("Error details:", {
                          message: e.message,
                          response: e.response?.data,
                          status: e.response?.status
                        });
                        let errorMessage = 'Failed to create job. Please try again.';
                        if (e.response?.data?.error) {
                          errorMessage = e.response.data.error;
                          // If it's an authentication error, redirect to login
                          if (e.response.status === 401 || e.response.status === 403) {
                            if (errorMessage.includes('Unauthorized') || errorMessage.includes('login')) {
                              alert('Your session has expired. Please login again.');
                              handleNavigate('logout');
                              return;
                            }
                          }
                        } else if (e.message) {
                          errorMessage = e.message;
                        }
                        alert(`Error creating job: ${errorMessage}`);
                      }
                    }} 
                  />
                } />
              )}

              {/* Admin Routes */}
              <Route path="/dashboard/admin" element={<AdminDashboard onNavigate={handleNavigate} />} />
              <Route path="/admin-jobs" element={<AdminJobManagementPage onNavigate={handleNavigate} />} />
              <Route path="/admin-news" element={<AdminNewsManagementPage onNavigate={handleNavigate} />} />
              <Route path="/admin-post-job" element={
                <JobPostingForm 
                  onCancel={() => handleNavigate('admin-jobs')} 
                  onSave={async (jobData: any) => {
                    try {
                      if (!token) {
                        alert('Authentication token not found. Please login again.');
                        return;
                      }
                      const payload = {
                        ...jobData,
                        status: jobData.status || 'active',
                        featured: jobData.featured || false,
                        views: jobData.views || 0,
                        applications: jobData.applications || 0,
                        type: 'hospital'
                      };
                      await createJob(payload);
                      alert('Job created successfully!');
                      handleNavigate('admin-jobs');
                    } catch (e: any) {
                      console.error("Error creating job:", e);
                      alert(`Error creating job: ${e.message}`);
                    }
                  }} 
                />
              } />
              <Route path="/profile" element={<ProfilePage onNavigate={handleNavigate} />} />
              <Route path="/admin-users" element={<AdminUsersPage onNavigate={handleNavigate} />} />
              <Route path="/admin-employer-verification" element={<EmployerVerificationPage onNavigate={handleNavigate} />} />
              <Route path="/admin-applications" element={<AdminApplications onNavigate={handleNavigate} />} />
              <Route path="/analytics" element={<AnalyticsDashboard userRole={user.role} userId={user.id} />} />
            </>
          )}
        </Routes>
      </main>
      <Footer onNavigate={handleNavigate} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}