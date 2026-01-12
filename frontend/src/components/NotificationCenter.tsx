import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Check, X, Trash2, Settings, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { mockNotifications } from '../data/mockData';
import { Notification } from '../types';

interface NotificationCenterProps {
  userId: string;
  userRole: 'admin' | 'employer' | 'candidate';
}

export function NotificationCenter({ userId, userRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'job_alert' | 'application_update' | 'interview_scheduled'>('all');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    // If admin, show all notifications. Otherwise, filter for the current user.
    const userNotifications = userRole === 'admin'
      ? mockNotifications
      : mockNotifications.filter(n => n.userId === userId);
    setNotifications(userNotifications);
  }, [userId]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_alert':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'application_update':
        return <Mail className="w-5 h-5 text-green-500" />;
      case 'interview_scheduled':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your job applications and alerts</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} unread
              </Badge>
            )}
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList>
                <TabsTrigger value="notifications">All Notifications</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="mt-6">
                {/* Filter Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
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
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`p-6 border-l-4 transition-all duration-200 hover:shadow-md ${
                          notification.read ? 'opacity-75' : ''
                        } ${getNotificationColor(notification.type)}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-gray-900 ${notification.read ? '' : 'font-medium'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
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
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg text-gray-900 mb-2">No notifications</h3>
                      <p className="text-gray-600">
                        {filter === 'unread' 
                          ? "You're all caught up! No unread notifications."
                          : "No notifications match your current filter."
                        }
                      </p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-lg text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="text-base font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications" className="text-base font-medium">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive important updates via SMS
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications" className="text-base font-medium">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive browser push notifications
                        </p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div className="mt-8">
                    <h4 className="text-base font-medium text-gray-900 mb-4">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Job Alerts</p>
                          <p className="text-xs text-gray-600">New jobs matching your criteria</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Application Updates</p>
                          <p className="text-xs text-gray-600">Status changes on your applications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Interview Scheduling</p>
                          <p className="text-xs text-gray-600">Interview invitations and updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Subscription Updates</p>
                          <p className="text-xs text-gray-600">Billing and subscription notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <Button className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Notification Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-gray-900 font-medium">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unread</span>
                  <span className="text-red-600 font-medium">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-gray-900 font-medium">
                    {notifications.filter(n => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(n.createdAt) > weekAgo;
                    }).length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Create Job Alert
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Read
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
