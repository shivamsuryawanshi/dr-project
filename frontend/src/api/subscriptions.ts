// AI assisted development
const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  price: number;
  basePrice?: number;
  finalPrice?: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValue?: number | null;
  hasDiscount?: boolean;
  duration: string;
  jobPostsAllowed: number;
  features: string[];
  isActive?: boolean;
  displayOrder?: number;
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  plan: SubscriptionPlanResponse;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  autoRenew: boolean;
  jobPostsUsed: number;
  jobPostsAllowed: number;
  cancelledAt?: string;
  createdAt: string;
}

export interface PaymentResponse {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
  transactionId: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  message: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  razorpayAmount?: number;
  razorpayCurrency?: string;
}

export interface RazorpayConfirmRequest {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayConfirmResponse {
  payment: PaymentResponse;
  subscription?: SubscriptionResponse | null;
  message: string;
}

export interface PaymentInvoiceResponse {
  invoiceNumber: string;
  fileUrl: string;
  status: string;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlanResponse[]> {
  const res = await fetch(`${API_BASE}/subscriptions/plans`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch subscription plans (${res.status})`);
  }

  const data = await res.json();
  return data.plans || [];
}

export async function getCurrentSubscription(token: string): Promise<SubscriptionResponse | null> {
  const res = await fetch(`${API_BASE}/subscriptions/current`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current subscription (${res.status})`);
  }

  const data = await res.json();
  return data.subscription || null;
}

export async function createSubscription(planId: string, token: string): Promise<SubscriptionResponse> {
  const res = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    let errorMessage = `Failed to create subscription (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If JSON parsing fails, use default message
    }
    const error = new Error(errorMessage);
    (error as any).response = res;
    throw error;
  }

  return res.json();
}

export async function getPaymentInvoice(
  paymentId: string,
  token: string
): Promise<PaymentInvoiceResponse> {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/invoice`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let errorMessage = `Failed to fetch invoice (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function updateSubscription(
  id: string,
  updates: { autoRenew?: boolean },
  token: string
): Promise<SubscriptionResponse> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`Failed to update subscription (${res.status})`);
  }

  return res.json();
}

export async function cancelSubscription(id: string, token: string): Promise<SubscriptionResponse> {
  const res = await fetch(`${API_BASE}/subscriptions/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to cancel subscription (${res.status})`);
  }

  return res.json();
}

export async function initiatePayment(planId: string, token: string): Promise<PaymentInitiateResponse> {
  const res = await fetch(`${API_BASE}/subscriptions/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to initiate payment (${res.status})`);
  }

  return res.json();
}

export async function confirmRazorpayPayment(
  data: RazorpayConfirmRequest,
  token: string
): Promise<RazorpayConfirmResponse> {
  const res = await fetch(`${API_BASE}/subscriptions/payments/razorpay/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = `Failed to confirm payment (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function getPaymentHistory(
  params: { page?: number; size?: number } = {},
  token: string
): Promise<{
  content: PaymentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.size !== undefined) qs.set('size', String(params.size));

  const res = await fetch(`${API_BASE}/subscriptions/payments/history?${qs.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch payment history (${res.status})`);
  }

  return res.json();
}

// Admin Pricing Management API
export interface AdminPlanPricing {
  id: string;
  name: string;
  basePrice: number;
  price: number;
  finalPrice: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValue?: number | null;
  duration: string;
  jobPostsAllowed: number;
  features: string[];
  isActive: boolean;
  displayOrder?: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePlanPricingRequest {
  basePrice?: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValue?: number | null;
  isActive?: boolean;
  features?: string;
  jobPostsAllowed?: number;
  duration?: string;
}

export async function fetchAdminPlans(token: string): Promise<AdminPlanPricing[]> {
  try {
    const endpoint = `${API_BASE}/admin/pricing/plans`;
    console.log('Fetching admin plans from:', endpoint);
    
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle network errors
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (parseError) {
        // If response is not JSON, create error object
        errorData = {
          error: `HTTP ${res.status}`,
          message: res.status === 404 
            ? 'Admin pricing endpoint not found. Please verify backend is running and endpoint is configured correctly.'
            : res.status === 403
            ? 'Access denied. Admin privileges required.'
            : res.status === 401
            ? 'Authentication failed. Please login again.'
            : `Server error: ${res.statusText || 'Unknown error'}`
        };
      }
      
      const errorMessage = errorData.message || errorData.error || `Failed to fetch plans (${res.status})`;
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).response = errorData;
      throw error;
    }

    const data = await res.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.warn('Invalid response format, returning empty array');
      return [];
    }

    // Check if response has error flag (backend returned 200 with error info)
    if (data.error === true) {
      console.error('Backend returned error:', data.message || data.details);
      // Still return empty array so UI can show empty state
      return [];
    }

    // Return plans array (could be empty)
    const plans = data.plans;
    if (!Array.isArray(plans)) {
      console.warn('Plans is not an array, returning empty array');
      return [];
    }

    return plans;
  } catch (err: any) {
    console.error('Error fetching admin plans:', err);
    // Re-throw with proper error information
    if (err.status) {
      throw err;
    }
    throw new Error(err.message || 'Failed to fetch subscription plans');
  }
}

export async function updatePlanPricing(
  planId: string,
  updates: UpdatePlanPricingRequest,
  token: string
): Promise<{ message: string; plan: AdminPlanPricing }> {
  const res = await fetch(`${API_BASE}/admin/pricing/plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update plan pricing (${res.status})`);
  }

  return res.json();
}

export async function removePlanDiscount(planId: string, token: string): Promise<{ message: string; plan: AdminPlanPricing }> {
  const res = await fetch(`${API_BASE}/admin/pricing/plans/${planId}/discount`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to remove discount (${res.status})`);
  }

  return res.json();
}

export async function togglePlanStatus(planId: string, token: string): Promise<{ message: string; plan: AdminPlanPricing }> {
  const res = await fetch(`${API_BASE}/admin/pricing/plans/${planId}/toggle-status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to toggle plan status (${res.status})`);
  }

  return res.json();
}

