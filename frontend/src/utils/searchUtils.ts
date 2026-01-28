/**
 * Optimized Search Utilities for Job Search
 * Best practices: debouncing, query normalization, caching, analytics
 */

import React from 'react';

// Debounce hook for search input
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Normalize and optimize search query
export function normalizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Trim and remove extra whitespace
  let normalized = query.trim().replace(/\s+/g, ' ');
  
  // Remove special characters that might interfere with search
  // Keep alphanumeric, spaces, and common job-related characters
  normalized = normalized.replace(/[^\w\s\-&/]/gi, '');
  
  // Limit query length for performance
  if (normalized.length > 200) {
    normalized = normalized.substring(0, 200);
  }
  
  return normalized;
}

// Extract keywords from search query for better matching
export function extractSearchKeywords(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return [];
  
  // Split into words and filter out common stop words
  const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with']);
  
  const words = normalized.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 2 && !stopWords.has(word));
}

// Build optimized search URL with proper encoding
export function buildSearchUrl(searchQuery: string, location: string, additionalParams?: Record<string, string>): string {
  const params = new URLSearchParams();
  
  // Add search query if present
  const normalizedQuery = normalizeSearchQuery(searchQuery);
  if (normalizedQuery) {
    params.set('search', normalizedQuery);
  }
  
  // Add location if present
  if (location && location.trim()) {
    params.set('location', location.trim());
  }
  
  // Add any additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  }
  
  const queryString = params.toString();
  return queryString ? `/jobs?${queryString}` : '/jobs';
}

// Search history management (localStorage)
const SEARCH_HISTORY_KEY = 'job_search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  location: string;
  timestamp: number;
}

export function saveSearchHistory(query: string, location: string): void {
  try {
    const history = getSearchHistory();
    const newItem: SearchHistoryItem = {
      query: normalizeSearchQuery(query),
      location: location.trim(),
      timestamp: Date.now()
    };
    
    // Remove duplicates
    const filtered = history.filter(
      item => !(item.query === newItem.query && item.location === newItem.location)
    );
    
    // Add new item at the beginning
    filtered.unshift(newItem);
    
    // Keep only last MAX_HISTORY_ITEMS
    const limited = filtered.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
  } catch (error) {
    // Silently fail if localStorage is not available
    console.warn('Failed to save search history:', error);
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    return [];
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
}

// Search analytics (track search performance)
export function trackSearch(query: string, location: string, resultCount: number): void {
  try {
    // Store search metrics
    const metrics = {
      query: normalizeSearchQuery(query),
      location: location.trim(),
      resultCount,
      timestamp: Date.now()
    };
    
    // In production, you would send this to an analytics service
    // For now, we'll just log it
    console.log('Search tracked:', metrics);
    
    // You can extend this to send to Google Analytics, Mixpanel, etc.
  } catch (error) {
    console.warn('Failed to track search:', error);
  }
}

// Validate search query before submission
export function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  const normalized = normalizeSearchQuery(query);
  
  if (normalized.length < 1) {
    return { valid: false, error: 'Please enter a search query' };
  }
  
  if (normalized.length > 200) {
    return { valid: false, error: 'Search query is too long (max 200 characters)' };
  }
  
  return { valid: true };
}

