// AI assisted development
import { useState, useEffect } from 'react';
import { Plus, Bell, MapPin, Search, Filter, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchJobAlerts,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  JobAlertResponse,
  JobAlertPayload
} from '../api/jobAlerts';
import { JobCategory, JobSector } from '../types';

interface JobAlert extends JobAlertResponse {
  categories: JobCategory[];
  sectors: JobSector[];
}

export function JobAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job alerts
  useEffect(() => {
    const loadAlerts = async () => {
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchJobAlerts({ page: 0, size: 100 }, token);
        
        // Convert categories and sectors to proper types
        const convertedAlerts: JobAlert[] = (response.content || []).map(alert => ({
          ...alert,
          categories: (alert.categories || []) as JobCategory[],
          sectors: (alert.sectors || []) as JobSector[]
        }));
        
        setAlerts(convertedAlerts);
      } catch (err: any) {
        console.error('Error fetching job alerts:', err);
        setError(err.message || 'Failed to load job alerts. Please try again.');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [token]);

  const jobCategories: JobCategory[] = [
    'Junior Resident',
    'Senior Resident', 
    'Medical Officer',
    'Faculty',
    'Specialist',
    'AYUSH',
    'Paramedical / Nursing'
  ];

  const locations = [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Jaipur', 'Chandigarh', 'Lucknow', 'Ahmedabad', 'Kochi', 'Bhubaneswar', 'Indore',
    'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu'
  ];

  const handleToggleAlert = async (alertId: string) => {
    if (!token) {
      setError('Authentication required. Please login again.');
      return;
    }

    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      await updateJobAlert(alertId, { active: !alert.active }, token);
      setAlerts(prev => 
        prev.map(a => 
          a.id === alertId ? { ...a, active: !a.active } : a
        )
      );
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      setError(err.message || 'Failed to update alert status.');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!token) {
      setError('Authentication required. Please login again.');
      return;
    }

    if (!confirm('Are you sure you want to delete this job alert?')) {
      return;
    }

    try {
      await deleteJobAlert(alertId, token);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setError(err.message || 'Failed to delete alert.');
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'instant':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'daily':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'weekly':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (min >= 100000) {
      return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L PA`;
    }
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()} PA`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Job Alerts</h1>
            <p className="text-gray-600">Get notified about new jobs matching your criteria</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Alert</DialogTitle>
              </DialogHeader>
              <CreateAlertForm 
                onSave={async (alert) => {
                  if (!token) {
                    setError('Authentication required. Please login again.');
                    return;
                  }

                  try {
                    const payload: JobAlertPayload = {
                      name: alert.name,
                      keywords: alert.keywords,
                      locations: alert.locations,
                      categories: alert.categories,
                      sectors: alert.sectors,
                      salaryRange: alert.salaryRange,
                      experience: alert.experience,
                      frequency: alert.frequency,
                      active: alert.active
                    };
                    const newAlert = await createJobAlert(payload, token);
                    setAlerts(prev => [...prev, {
                      ...newAlert,
                      categories: (newAlert.categories || []) as JobCategory[],
                      sectors: (newAlert.sectors || []) as JobSector[]
                    }]);
                    setIsCreateDialogOpen(false);
                  } catch (err: any) {
                    console.error('Error creating alert:', err);
                    setError(err.message || 'Failed to create alert.');
                  }
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
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

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Alerts</p>
                <p className="text-3xl text-gray-900">{alerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
                <p className="text-3xl text-gray-900">{alerts.filter(a => a.active).length}</p>
              </div>
              <ToggleRight className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Matches</p>
                <p className="text-3xl text-gray-900">{alerts.reduce((sum, a) => sum + a.matches, 0)}</p>
              </div>
              <Search className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Week</p>
                <p className="text-3xl text-gray-900">3</p>
              </div>
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading job alerts...</span>
          </div>
        ) : (
          /* Alerts List */
          <div className="space-y-6">
            {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-900">{alert.name}</h3>
                      <Badge className={getFrequencyColor(alert.frequency)} variant="outline">
                        {alert.frequency}
                      </Badge>
                      {alert.active ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200" variant="outline">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Locations:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.locations.slice(0, 3).map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                          {alert.locations.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{alert.locations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Categories:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Salary Range:</p>
                        <p className="text-sm">{formatSalary(alert.salaryRange.min, alert.salaryRange.max)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAlert(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      {alert.active ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAlert(alert)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {new Date(alert.createdAt).toLocaleDateString('en-IN')}</span>
                    {alert.lastSent && (
                      <span>Last sent: {new Date(alert.lastSent).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{alert.matches} matches found</span>
                    <Button variant="outline" size="sm">
                      View Matches
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No job alerts created</h3>
              <p className="text-gray-600 mb-4">
                Create your first job alert to get notified about relevant opportunities
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </Card>
          )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingAlert && (
        <Dialog open={!!editingAlert} onOpenChange={(open) => !open && setEditingAlert(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Alert</DialogTitle>
            </DialogHeader>
            <CreateAlertForm 
              initialData={editingAlert}
              onSave={async (alert) => {
                if (!token || !editingAlert) {
                  setError('Authentication required. Please login again.');
                  return;
                }

                try {
                  const payload: JobAlertPayload = {
                    name: alert.name,
                    keywords: alert.keywords,
                    locations: alert.locations,
                    categories: alert.categories,
                    sectors: alert.sectors,
                    salaryRange: alert.salaryRange,
                    experience: alert.experience,
                    frequency: alert.frequency,
                    active: alert.active
                  };
                  const updatedAlert = await updateJobAlert(editingAlert.id, payload, token);
                  setAlerts(prev => prev.map(a => 
                    a.id === editingAlert.id 
                      ? {
                          ...updatedAlert,
                          categories: (updatedAlert.categories || []) as JobCategory[],
                          sectors: (updatedAlert.sectors || []) as JobSector[]
                        }
                      : a
                  ));
                  setEditingAlert(null);
                } catch (err: any) {
                  console.error('Error updating alert:', err);
                  setError(err.message || 'Failed to update alert.');
                }
              }}
              onCancel={() => setEditingAlert(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface CreateAlertFormProps {
  initialData?: JobAlert;
  onSave: (alert: Omit<JobAlert, 'id' | 'matches' | 'createdAt' | 'updatedAt' | 'lastSent'>) => void;
  onCancel: () => void;
}

function CreateAlertForm({ initialData, onSave, onCancel }: CreateAlertFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    keywords: initialData?.keywords?.join(', ') || '',
    locations: initialData?.locations || [],
    categories: initialData?.categories || [],
    sectors: initialData?.sectors || [],
    salaryMin: initialData?.salaryRange?.min?.toString() || '',
    salaryMax: initialData?.salaryRange?.max?.toString() || '',
    experience: initialData?.experience || '',
    frequency: (initialData?.frequency || 'daily') as 'daily' | 'weekly' | 'instant',
    active: initialData?.active ?? true
  });

  const jobCategories: JobCategory[] = [
    'Junior Resident',
    'Senior Resident', 
    'Medical Officer',
    'Faculty',
    'Specialist',
    'AYUSH',
    'Paramedical / Nursing'
  ];

  const locations = [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Jaipur', 'Chandigarh', 'Lucknow', 'Ahmedabad', 'Kochi', 'Bhubaneswar', 'Indore',
    'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alert = {
      name: formData.name,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      locations: formData.locations,
      categories: formData.categories,
      sectors: formData.sectors,
      salaryRange: {
        min: parseInt(formData.salaryMin) || 0,
        max: parseInt(formData.salaryMax) || 1000000
      },
      experience: formData.experience,
      frequency: formData.frequency,
      active: formData.active
    };
    
    onSave(alert);
  };

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  const toggleCategory = (category: JobCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleSector = (sector: JobSector) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Alert Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Cardiology Jobs in Delhi"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          placeholder="e.g., cardiologist, heart, cardiac"
          value={formData.keywords}
          onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Job Categories</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {jobCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={formData.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={category} className="text-sm">{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Job Sectors</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="government"
              checked={formData.sectors.includes('government')}
              onCheckedChange={() => toggleSector('government')}
            />
            <Label htmlFor="government">Government</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={formData.sectors.includes('private')}
              onCheckedChange={() => toggleSector('private')}
            />
            <Label htmlFor="private">Private</Label>
          </div>
        </div>
      </div>

      <div>
        <Label>Locations</Label>
        <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={location}
                checked={formData.locations.includes(location)}
                onCheckedChange={() => toggleLocation(location)}
              />
              <Label htmlFor={location} className="text-sm">{location}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salaryMin">Min Salary (₹)</Label>
          <Input
            id="salaryMin"
            type="number"
            placeholder="50000"
            value={formData.salaryMin}
            onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="salaryMax">Max Salary (₹)</Label>
          <Input
            id="salaryMax"
            type="number"
            placeholder="500000"
            value={formData.salaryMax}
            onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="experience">Experience</Label>
        <Input
          id="experience"
          placeholder="e.g., 2-5 years"
          value={formData.experience}
          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="frequency">Notification Frequency</Label>
        <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instant">Instant</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Create Alert
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


