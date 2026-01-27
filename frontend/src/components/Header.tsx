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
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-0">
        <div className="flex h-auto sm:h-16 items-center justify-between gap-2">
          {/* Logo - MEDEXJOB Wordmark */}
          <div
            className="flex items-center cursor-pointer flex-shrink-0 px-2 sm:px-3 hover:opacity-95 transition-opacity"
            onClick={() => onNavigate('home')}
            aria-label="MedExJob Home"
          >
            <h1
              className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-bold leading-none tracking-tight"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                letterSpacing: '-0.02em'
              }}
            >
              <span style={{ color: '#2A3F6B' }}>MEDEX</span>
              <span style={{ color: '#4299D4' }}>JOB</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-wrap">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => onNavigate('govt-jobs')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'govt-jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              Government Jobs
            </button>
            <button
              onClick={() => onNavigate('private-jobs')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'private-jobs' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              Private Jobs
            </button>
            <button
              onClick={() => onNavigate('news')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'news' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              News
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'about' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
            >
              About
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50/80 transition-all duration-200 h-9 w-9 sm:h-10 sm:w-10"
                  onClick={() => onNavigate('notifications')}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 hover:text-blue-700 transition-colors stroke-[2] fill-none" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 px-1 sm:px-1.5 bg-red-500 text-white text-[10px] sm:text-[11px] font-bold leading-none rounded-full shadow-[0_2px_6px_rgba(239,68,68,0.4),0_1px_2px_rgba(0,0,0,0.1)] border border-red-600/20">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Profile Icon - Navigate to Dashboard */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate('dashboard')}
                  title="Dashboard"
                  aria-label="Dashboard"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Logout Button - Responsive: Icon only on mobile, Icon + Text on larger screens */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-9 sm:h-8 px-2 sm:px-3 gap-1.5 sm:gap-2 min-w-[36px] sm:min-w-auto"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-0 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('login')}
                  className="h-9 sm:h-9 px-3 sm:px-4 text-sm"
                  aria-label="Login"
                >
                  Login
                </Button>
                <Button
                  onClick={() => onNavigate('register')}
                  className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-9 px-3 sm:px-4 text-sm"
                  aria-label="Register"
                >
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
