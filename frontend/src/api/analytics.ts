const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export async function fetchAnalyticsOverview() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to load analytics overview');
  return res.json();
}

export async function fetchJobsByCategory() {
  const res = await fetch(`${API_BASE}/analytics/jobs-by-category`);
  if (!res.ok) throw new Error('Failed to load jobs by category');
  return res.json();
}

export async function fetchJobsByLocation() {
  const res = await fetch(`${API_BASE}/analytics/jobs-by-location`);
  if (!res.ok) throw new Error('Failed to load jobs by location');
  return res.json();
}

export async function fetchTopJobs() {
  const res = await fetch(`${API_BASE}/analytics/top-jobs`);
  if (!res.ok) throw new Error('Failed to load top jobs');
  return res.json();
}
