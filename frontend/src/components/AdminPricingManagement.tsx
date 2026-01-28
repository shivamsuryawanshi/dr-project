// AI assisted development
import { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, X, Percent, Tag, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Loader2, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { fetchAdminPlans, updatePlanPricing, removePlanDiscount, togglePlanStatus, AdminPlanPricing, UpdatePlanPricingRequest } from '../api/subscriptions';

interface AdminPricingManagementProps {
  onNavigate: (page: string) => void;
}

export function AdminPricingManagement({ onNavigate }: AdminPricingManagementProps) {
  const { token } = useAuth();
  const [plans, setPlans] = useState<AdminPlanPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ 
    open: boolean; 
    planId: string | null; 
    action: string;
    planName?: string;
    changes?: string;
  }>({
    open: false,
    planId: null,
    action: ''
  });

  // Form state for editing
  const [editForm, setEditForm] = useState<{
    basePrice: string;
    discountType: 'PERCENTAGE' | 'FIXED' | null;
    discountValue: string;
    isActive: boolean;
    features: string;
    jobPostsAllowed: string;
    duration: string;
  }>({
    basePrice: '',
    discountType: null,
    discountValue: '',
    isActive: true,
    features: '',
    jobPostsAllowed: '',
    duration: ''
  });

  useEffect(() => {
    loadPlans();
  }, [token]);

  const loadPlans = async () => {
    if (!token) {
      setError('Authentication required. Please login again.');
      setPlans([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const fetchedPlans = await fetchAdminPlans(token);
      
      // Validate plans data structure
      if (!Array.isArray(fetchedPlans)) {
        console.warn('Received non-array plans data, using empty array');
        setPlans([]);
        return;
      }
      
      // Validate each plan has required fields
      const validPlans = fetchedPlans.filter(plan => {
        if (!plan || !plan.id || !plan.name) {
          console.warn('Invalid plan data:', plan);
          return false;
        }
        // Ensure required numeric fields have valid values
        if (typeof plan.basePrice !== 'number' || plan.basePrice < 0) {
          console.warn('Invalid basePrice for plan:', plan.id);
          return false;
        }
        return true;
      });
      
      setPlans(validPlans);
      
      if (validPlans.length === 0 && fetchedPlans.length > 0) {
        setError('Some plans had invalid data and were filtered out.');
      }
    } catch (err: any) {
      console.error('Error loading plans:', err);
      let errorMessage = 'Failed to load subscription plans';
      
      // Parse error response
      if (err.response) {
        const errorData = err.response;
        const status = err.status || 500;
        
        if (status === 500) {
          errorMessage = errorData.message || errorData.error || 'Server error: Unable to fetch plans. Please check backend logs.';
          if (errorData.details) {
            errorMessage += ` (${errorData.details})`;
          }
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else {
          errorMessage = errorData.message || errorData.error || `Error ${status}: Unknown error`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPlans([]); // Clear plans on error
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (plan: AdminPlanPricing) => {
    setEditingPlanId(plan.id);
    setEditForm({
      basePrice: plan.basePrice.toString(),
      discountType: plan.discountType,
      discountValue: plan.discountValue?.toString() || '',
      isActive: plan.isActive,
      features: plan.features.join(', '),
      jobPostsAllowed: plan.jobPostsAllowed.toString(),
      duration: plan.duration
    });
  };

  const cancelEditing = () => {
    setEditingPlanId(null);
    setEditForm({
      basePrice: '',
      discountType: null,
      discountValue: '',
      isActive: true,
      features: '',
      jobPostsAllowed: '',
      duration: ''
    });
  };

  const calculateFinalPrice = (): number => {
    const basePrice = parseFloat(editForm.basePrice) || 0;
    if (!editForm.discountType || !editForm.discountValue) {
      return basePrice;
    }

    const discountValue = parseFloat(editForm.discountValue) || 0;
    if (editForm.discountType === 'PERCENTAGE') {
      const discount = (basePrice * discountValue) / 100;
      return Math.max(0, basePrice - discount);
    } else {
      return Math.max(0, basePrice - discountValue);
    }
  };

  const handleSave = async (planId: string, skipConfirm: boolean = false) => {
    if (!token) return;

    // Validation
    const basePrice = parseFloat(editForm.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      setError('Base price must be a valid positive number');
      return;
    }

    if (editForm.discountType && editForm.discountValue) {
      const discountValue = parseFloat(editForm.discountValue);
      if (isNaN(discountValue) || discountValue < 0) {
        setError('Discount value must be a valid positive number');
        return;
      }
      if (editForm.discountType === 'PERCENTAGE' && discountValue > 100) {
        setError('Percentage discount cannot exceed 100%');
        return;
      }
    }

    // Show confirmation dialog unless skipped
    if (!skipConfirm) {
      const plan = plans.find(p => p.id === planId);
      const finalPrice = calculateFinalPrice();
      const changes: string[] = [];
      
      if (plan) {
        if (plan.basePrice !== basePrice) {
          changes.push(`Base Price: ₹${plan.basePrice.toLocaleString()} → ₹${basePrice.toLocaleString()}`);
        }
        if (plan.discountType !== editForm.discountType || plan.discountValue !== parseFloat(editForm.discountValue || '0')) {
          if (editForm.discountType) {
            changes.push(`Discount: ${editForm.discountType === 'PERCENTAGE' ? `${editForm.discountValue}%` : `₹${editForm.discountValue}`}`);
          } else {
            changes.push('Discount: Removed');
          }
        }
        if (plan.finalPrice !== finalPrice) {
          changes.push(`Final Price: ₹${plan.finalPrice.toLocaleString()} → ₹${finalPrice.toLocaleString()}`);
        }
        if (plan.isActive !== editForm.isActive) {
          changes.push(`Status: ${editForm.isActive ? 'Active' : 'Inactive'}`);
        }
      }

      setConfirmDialog({
        open: true,
        planId: planId,
        action: 'save',
        planName: plan?.name || 'Plan',
        changes: changes.length > 0 ? changes.join('\n') : 'No changes detected'
      });
      return;
    }

    // Proceed with save
    try {
      setSaving(planId);
      setError(null);

      const updates: UpdatePlanPricingRequest = {
        basePrice: basePrice,
        discountType: editForm.discountType,
        discountValue: editForm.discountType && editForm.discountValue ? parseFloat(editForm.discountValue) : null,
        isActive: editForm.isActive,
        features: editForm.features,
        jobPostsAllowed: parseInt(editForm.jobPostsAllowed) || undefined,
        duration: editForm.duration || undefined
      };

      await updatePlanPricing(planId, updates, token);
      await loadPlans();
      setEditingPlanId(null);
      setConfirmDialog({ open: false, planId: null, action: '' });
      setSuccessMessage('Plan pricing updated successfully! Changes are now live on the employer subscription page.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error saving plan:', err);
      setError(err.message || 'Failed to update plan pricing');
      setConfirmDialog({ open: false, planId: null, action: '' });
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveDiscount = async (planId: string) => {
    if (!token) return;
    try {
      setSaving(planId);
      setError(null);
      await removePlanDiscount(planId, token);
      await loadPlans();
      setConfirmDialog({ open: false, planId: null, action: '' });
      setSuccessMessage('Discount removed successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error removing discount:', err);
      setError(err.message || 'Failed to remove discount');
    } finally {
      setSaving(null);
    }
  };

  const handleToggleStatus = async (planId: string) => {
    if (!token) return;
    try {
      setSaving(planId);
      setError(null);
      await togglePlanStatus(planId, token);
      await loadPlans();
      setSuccessMessage('Plan status updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error toggling status:', err);
      setError(err.message || 'Failed to toggle plan status');
    } finally {
      setSaving(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading pricing plans...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Pricing Management
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage subscription plan pricing, discounts, and availability</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => onNavigate('subscription')} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                title="View plans as employers see them"
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline sm:inline">View Employer Page</span>
                <span className="xs:hidden sm:hidden">View</span>
              </Button>
              <Button 
                onClick={loadPlans} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">Refresh</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccessMessage(null)}
                className="mt-2 text-green-600 hover:text-green-700"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-2">{error}</p>
              <p className="text-xs text-red-600 mb-3">
                Unable to load plans. Please try again or check backend configuration.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPlans}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isEditing = editingPlanId === plan.id;
            const finalPrice = isEditing ? calculateFinalPrice() : (plan.finalPrice || plan.price);
            const hasDiscount = plan.discountType && plan.discountValue != null && plan.discountValue > 0;

            return (
              <Card key={plan.id} className={`p-6 ${!plan.isActive ? 'opacity-60' : ''}`}>
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      {plan.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.duration}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(plan.id)}
                    disabled={saving === plan.id}
                    className="flex items-center gap-1"
                  >
                    {plan.isActive ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* Pricing Display */}
                {!isEditing ? (
                  <div className="space-y-4 mb-6">
                    {/* Base Price */}
                    <div>
                      <Label className="text-xs text-gray-500 mb-1">Base Price</Label>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(plan.basePrice || plan.price || 0)}</p>
                    </div>

                    {/* Discount Info */}
                    {hasDiscount && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Discount Applied</span>
                          <Badge className="bg-blue-600 text-white">
                            {plan.discountType === 'PERCENTAGE' ? `${plan.discountValue}%` : formatPrice(plan.discountValue!)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 line-through">{formatPrice(plan.basePrice || plan.price)}</span>
                          <span className="text-lg font-bold text-blue-700">{formatPrice(plan.finalPrice || plan.price)}</span>
                        </div>
                      </div>
                    )}

                    {/* Final Price */}
                    {!hasDiscount && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-1">Final Price</Label>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(plan.finalPrice || plan.price || plan.basePrice)}</p>
                      </div>
                    )}

                    {/* Plan Details */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Job Posts:</span> {plan.jobPostsAllowed}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Features:</span> {plan.features.length} included
                      </p>
                      {plan.updatedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-medium">Last Updated:</span>{' '}
                          {new Date(plan.updatedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {/* Base Price Input */}
                    <div>
                      <Label htmlFor={`basePrice-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Base Price (₹)
                      </Label>
                      <Input
                        id={`basePrice-${plan.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.basePrice}
                        onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                        className="text-lg font-semibold"
                      />
                    </div>

                    {/* Discount Type */}
                    <div>
                      <Label htmlFor={`discountType-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Discount Type
                      </Label>
                      <Select
                        value={editForm.discountType || 'none'}
                        onValueChange={(value) =>
                          setEditForm({
                            ...editForm,
                            discountType: value === 'none' ? null : (value as 'PERCENTAGE' | 'FIXED'),
                            discountValue: value === 'none' ? '' : editForm.discountValue
                          })
                        }
                      >
                        <SelectTrigger id={`discountType-${plan.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Discount</SelectItem>
                          <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Discount Value */}
                    {editForm.discountType && (
                      <div>
                        <Label htmlFor={`discountValue-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                          Discount Value
                          {editForm.discountType === 'PERCENTAGE' && ' (%)'}
                          {editForm.discountType === 'FIXED' && ' (₹)'}
                        </Label>
                        <Input
                          id={`discountValue-${plan.id}`}
                          type="number"
                          min="0"
                          max={editForm.discountType === 'PERCENTAGE' ? 100 : undefined}
                          step={editForm.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                          value={editForm.discountValue}
                          onChange={(e) => setEditForm({ ...editForm, discountValue: e.target.value })}
                          placeholder={editForm.discountType === 'PERCENTAGE' ? '0-100' : '0.00'}
                        />
                      </div>
                    )}

                    {/* Real-time Preview */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                      <Label className="text-xs text-gray-500 mb-1 block">Final Price Preview</Label>
                      <p className="text-2xl font-bold text-green-700">{formatPrice(finalPrice)}</p>
                      {editForm.discountType && editForm.discountValue && (
                        <p className="text-xs text-gray-600 mt-1">
                          Savings: {formatPrice(parseFloat(editForm.basePrice) - finalPrice)}
                        </p>
                      )}
                    </div>

                    {/* Job Posts Allowed */}
                    <div>
                      <Label htmlFor={`jobPosts-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Job Posts Allowed
                      </Label>
                      <Input
                        id={`jobPosts-${plan.id}`}
                        type="number"
                        min="1"
                        value={editForm.jobPostsAllowed}
                        onChange={(e) => setEditForm({ ...editForm, jobPostsAllowed: e.target.value })}
                      />
                    </div>

                    {/* Validity Period (Duration) */}
                    <div>
                      <Label htmlFor={`duration-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Validity Period (Duration)
                      </Label>
                      <Select
                        value={editForm.duration}
                        onValueChange={(value) => setEditForm({ ...editForm, duration: value })}
                      >
                        <SelectTrigger id={`duration-${plan.id}`}>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per post">Per Post</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Features */}
                    <div>
                      <Label htmlFor={`features-${plan.id}`} className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Features (comma-separated)
                      </Label>
                      <Input
                        id={`features-${plan.id}`}
                        type="text"
                        value={editForm.features}
                        onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => startEditing(plan)}
                        variant="outline"
                        className="flex-1 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Pricing
                      </Button>
                      {hasDiscount && (
                        <Button
                          onClick={() => setConfirmDialog({ open: true, planId: plan.id, action: 'removeDiscount' })}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSave(plan.id, false)}
                        disabled={saving === plan.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        {saving === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save & Publish
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        disabled={saving === plan.id}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {plans.length === 0 && !loading && !error && (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscription Plans Found</h3>
            <p className="text-gray-600 mb-6">
              No plans found. Create a plan to get started with pricing management.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button 
                onClick={() => onNavigate('subscription')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Employer Subscription Page
              </Button>
              <Button 
                onClick={loadPlans} 
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.action === 'save' ? 'Confirm Price Update' : 'Confirm Action'}
              </DialogTitle>
              <DialogDescription className="space-y-3">
                {confirmDialog.action === 'removeDiscount' && (
                  <p>Are you sure you want to remove the discount from this plan?</p>
                )}
                {confirmDialog.action === 'save' && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">Plan: {confirmDialog.planName}</p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Changes to be published:</p>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                        {confirmDialog.changes || 'No changes detected'}
                      </pre>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      These changes will be immediately visible to employers on the subscription page.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, planId: null, action: '' })}
                disabled={saving === confirmDialog.planId}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (confirmDialog.action === 'save' && confirmDialog.planId) {
                    handleSave(confirmDialog.planId, true);
                  } else if (confirmDialog.action === 'removeDiscount' && confirmDialog.planId) {
                    handleRemoveDiscount(confirmDialog.planId);
                  }
                }}
                className={confirmDialog.action === 'save' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={saving === confirmDialog.planId}
              >
                {saving === confirmDialog.planId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  confirmDialog.action === 'save' ? 'Publish Changes' : 'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

