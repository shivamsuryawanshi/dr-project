import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { fetchEmployer } from '../api/employers';
import { EmployerResponse } from '../api/employers';

interface EmployerVerificationProps {
  onNavigate: (page: string) => void;
}

export function EmployerVerification({ onNavigate }: EmployerVerificationProps) {
  const { user, token } = useAuth();
  const [employer, setEmployer] = useState<EmployerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employer verification status on component mount
  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        const employerData = await fetchEmployer(user.id, token);
        setEmployer(employerData);

        // If verification is approved, redirect to employer dashboard
        if (employerData.verificationStatus === 'approved') {
          onNavigate('employer-dashboard');
          return;
        }
      } catch (err) {
        console.error('Failed to fetch employer data:', err);
        setError('Failed to load verification status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [user, token, onNavigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Handle different verification statuses
  if (employer?.verificationStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl text-gray-900 mb-2">Verification Approved!</h1>
          <p className="text-gray-600 mb-6">Redirecting to employer dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (employer?.verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h1 className="text-2xl text-gray-900 mb-2">Verification Rejected</h1>
            <p className="text-gray-600 mb-4">
              {employer.verificationNotes || 'Your verification documents were not approved. Please contact support for more details.'}
            </p>
            <Button onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default case: pending verification
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h1 className="text-3xl text-gray-900 mb-2">Verification Pending</h1>
          <p className="text-gray-600 mb-6">
            Your employer verification request has been submitted and is currently under review by our admin team.
            You will be notified once the verification process is complete.
          </p>

          <Card className="p-6 mb-6">
            <h3 className="text-lg text-gray-900 mb-4">What happens next?</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 font-medium">1</span>
                </div>
                <p className="text-sm text-gray-600">Admin team reviews your submitted information</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 font-medium">2</span>
                </div>
                <p className="text-sm text-gray-600">If approved, you'll be redirected to subscription setup</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-blue-600 font-medium">3</span>
                </div>
                <p className="text-sm text-gray-600">Complete subscription to start posting jobs</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => window.location.reload()}>
              Check Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
