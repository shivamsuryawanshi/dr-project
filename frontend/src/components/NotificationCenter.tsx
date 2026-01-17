// AI assisted development
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  NotificationResponse,
} from '../api/notifications';

interface NotificationCenterProps {
  userId: string;
  userRole: 'admin' | 'employer' | 'candidate';
}

export function NotificationCenter({ userId, userRole }: NotificationCenterProps) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'job_alert' | 'application_update' | 'interview_scheduled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page: 0,
          size: 100
        };

        if (filter === 'unread') {
          params.unreadOnly = true;
        } else if (filter !== 'all') {
          params.type = filter;
        }

        console.log('📥 Fetching notifications with params:', params);
        const response = await fetchNotifications(params, token);
        console.log('✅ Notifications response:', response);
        setNotifications(response.content || []);

        // Fetch unread count
        console.log('📊 Fetching unread count...');
        const count = await getUnreadCount(token);
        console.log('✅ Unread count:', count);
        setUnreadCount(count);
      } catch (err: any) {
        console.error('❌ Error fetching notifications:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        setError(err.message || 'Failed to load notifications. Please try again.');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [token, filter]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) {
      setError('Authentication required. Please login again.');
      return;
    }

    try {
      await markAsRead(notificationId, token);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read.');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!token) {
      setError('Authentication required. Please login again.');
      return;
    }

    try {
      await deleteNotification(notificationId, token);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.message || 'Failed to delete notification.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_alert':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'application_update':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'interview_scheduled':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'subscription':
        return <Bell className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job_alert':
        return 'border-l-blue-500 bg-blue-50';
      case 'application_update':
        return 'border-l-green-500 bg-green-50';
      case 'interview_scheduled':
        return 'border-l-purple-500 bg-purple-50';
      case 'subscription':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your job applications and alerts</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="job_alert">Job Alerts</SelectItem>
              <SelectItem value="application_update">Application Updates</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading notifications...</span>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-6 border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    notification.read ? 'opacity-75 bg-white' : 'bg-white shadow-sm'
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-gray-900 ${notification.read ? '' : 'font-semibold'}`}>
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "No notifications match your current filter."
                  }
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
