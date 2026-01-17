// AI assisted development
const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  price: number;
  duration: string;
  jobPostsAllowed: number;
  features: string[];
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

