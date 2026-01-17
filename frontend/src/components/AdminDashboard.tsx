// AI assisted development
import { BarChart, Briefcase, Users, Building2, Bell, Settings, Newspaper } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const adminCards = [
    {
      title: 'Manage Jobs',
      description: 'View, create, edit, and delete job postings.',
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      action: () => onNavigate('admin-jobs'),
    },
    {
      title: 'Manage Admins',
      description: 'Add, edit, and remove admin accounts.',
      icon: <Users className="w-8 h-8 text-green-600" />,
      action: () => onNavigate('admin-users'),
    },
    {
      title: 'Employer Verification',
      description: 'Review and approve employer verification requests.',
      icon: <Building2 className="w-8 h-8 text-purple-600" />,
      action: () => onNavigate('admin-employer-verification'), // Placeholder
    },
    {
      title: 'Manage Applications',
      description: 'Review and manage job applications from candidates.',
      icon: <Briefcase className="w-8 h-8 text-purple-600" />,
      action: () => onNavigate('admin-applications'),
    },
    {
      title: 'Site Analytics',
      description: 'Monitor platform performance and job statistics.',
      icon: <BarChart className="w-8 h-8 text-orange-600" />,
      action: () => onNavigate('analytics'),
    },
    {
      title: 'Manage News',
      description: 'Create, edit, and delete news updates and announcements.',
      icon: <Newspaper className="w-8 h-8 text-indigo-600" />,
      action: () => onNavigate('admin-news'),
    },
    {
      title: 'Notifications & Alerts',
      description: 'Send global notifications or manage system alerts.',
      icon: <Bell className="w-8 h-8 text-red-600" />,
      action: () => onNavigate('notifications'),
    },
    {
      title: 'Settings',
      description: 'Configure platform-wide settings and parameters.',
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      action: () => onNavigate('profile'), // Navigates to the admin's profile page
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, Administrator! Manage your MedExJob.com platform here.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onNavigate('home')}>
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="p-6 flex flex-col items-start hover:shadow-lg transition-shadow duration-200">
              <div className="mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-gray-600 mb-4 flex-grow">{card.description}</p>
              <Button onClick={card.action} className="mt-auto">
                Go to {card.title}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}