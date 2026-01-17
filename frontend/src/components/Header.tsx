// AI assisted development
import { Bell, User, Briefcase, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadCount } from '../api/notifications';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  userRole?: 'admin' | 'employer' | 'candidate' | string;
}

export function Header({ currentPage, onNavigate, isAuthenticated, userRole }: HeaderProps) {
  const { user, logout, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count from API
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated && user && token) {
        try {
          const count = await getUnreadCount(token);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, token]);

  const handleLogout = () => {
    logout();
    onNavigate('logout');
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-blue-600">MedExJob.com</h1>
              <p className="text-xs text-gray-500">Medical Excellence Jobs</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors ${
                currentPage === 'home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className={`transition-colors ${
                currentPage === 'jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => onNavigate('govt-jobs')}
              className={`transition-colors ${
                currentPage === 'govt-jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Government Jobs
            </button>
            <button
              onClick={() => onNavigate('private-jobs')}
              className={`transition-colors ${
                currentPage === 'private-jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Private Jobs
            </button>
            <button
              onClick={() => onNavigate('news')}
              className={`transition-colors ${
                currentPage === 'news' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              News
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`transition-colors ${
                currentPage === 'about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => onNavigate('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 p-0 flex items-center justify-center bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* Profile Icon - Navigate to Dashboard */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('dashboard')}
                  title="Dashboard"
                >
                  <User className="w-5 h-5" />
                </Button>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onNavigate('login')}>
                  Login
                </Button>
                <Button onClick={() => onNavigate('register')} className="bg-blue-600 hover:bg-blue-700">
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
