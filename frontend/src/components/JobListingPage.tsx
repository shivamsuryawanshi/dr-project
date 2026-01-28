import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { JobCard } from './JobCard';
import { FilterSidebar, FilterOptions } from './FilterSidebar';
import { fetchJobs, fetchJobsMeta } from '../api/jobs';
import { 
  normalizeSearchQuery, 
  buildSearchUrl, 
  saveSearchHistory, 
  trackSearch, 
  validateSearchQuery 
} from '../utils/searchUtils';

interface JobListingPageProps {
  onNavigate: (page: string, jobId?: string) => void;
  sector?: 'government' | 'private';
}

export function JobListingPage({ onNavigate, sector }: JobListingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    locations: [],
    featured: false
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [metaCategories, setMetaCategories] = useState<string[]>([]);
  const [metaLocations, setMetaLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Read search query, location, and category from URL params on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');
    const categoryParam = params.get('category');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery(''); // Clear if not in URL
    }
    
    if (locationParam) {
      setFilters(prev => ({
        ...prev,
        locations: [locationParam]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        locations: []
      }));
    }
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam]
      }));
    }
  }, [location.search]);

  useEffect(() => {
    // load meta on mount
    (async () => {
      try {
        const meta = await fetchJobsMeta();
        setMetaCategories(Array.isArray(meta?.categories) ? meta.categories : []);
        setMetaLocations(Array.isArray(meta?.locations) ? meta.locations : []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // fetch jobs on filters/search change
    // Also read URL params directly to ensure we use latest values
    (async () => {
      setLoading(true);
      try {
        // Read URL params directly to ensure we have latest values
        const urlParams = new URLSearchParams(location.search);
        const urlSearch = urlParams.get('search');
        const urlLocation = urlParams.get('location');
        
        // Use URL params if available, otherwise use state
        const params: any = {
          search: urlSearch || searchQuery || undefined,
          sector: sector || undefined,
          category: filters.categories[0] || undefined,
          location: urlLocation || filters.locations[0] || undefined,
          featured: filters.featured || undefined,
          status: 'active',
          size: 50,
        };
        
        // Remove undefined values to avoid passing them to API
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        
        // Debug: Log params to verify location is being passed
        console.log('Fetching jobs with params:', params);
        
        let res = await fetchJobs(params);
        let content = res?.content || [];
        let total = res?.totalElements || 0;

        // Don't retry without status filter if location filter is applied
        // This ensures location filtering is not bypassed
        if (content.length === 0 && !params.location && !params.search) {
          const { status, ...fallbackParams } = params;
          res = await fetchJobs(fallbackParams);
          content = res?.content || [];
          total = res?.totalElements || 0;
        }
        
        // Additional client-side filtering to ensure location matches exactly
        if (params.location && content.length > 0) {
          const locationLower = params.location.toLowerCase().trim();
          content = content.filter((job: any) => {
            const jobLocation = (job.location || '').toLowerCase().trim();
            return jobLocation === locationLower || jobLocation.startsWith(locationLower);
          });
          total = content.length;
        }

        // Normalize job data - ensure sector is always present
        const normalizedJobs = content.map((job: any) => ({
          ...job,
          sector: job.sector?.toLowerCase() || 'private' // Default to private if missing
        }));
        
        setJobs(normalizedJobs);
        setTotal(total);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchQuery, filters, sector, location.search]);

  // Optimized search handler with validation, history, and analytics
  const handleSearch = useCallback(() => {
    // Validate search query
    const validation = validateSearchQuery(searchQuery);
    if (!validation.valid) {
      console.warn('Search validation failed:', validation.error);
      // Continue with search for flexibility
    }
    
    // Normalize and optimize the search query
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    const locationParam = filters.locations.length > 0 ? filters.locations[0] : '';
    
    // Save to search history
    saveSearchHistory(normalizedQuery, locationParam);
    
    // Build URL params
    const params = new URLSearchParams();
    
    // Add search query if present
    if (normalizedQuery) {
      params.set('search', normalizedQuery);
    } else {
      params.delete('search');
    }
    
    // Add location if present
    if (locationParam) {
      params.set('location', locationParam);
    } else {
      params.delete('location');
    }
    
    // Add category if present
    if (filters.categories.length > 0) {
      params.set('category', filters.categories[0]);
    } else {
      params.delete('category');
    }
    
    // Track search analytics
    trackSearch(normalizedQuery, locationParam, 0);
    
    // Navigate to updated URL - this will trigger the useEffect to fetch jobs
    const queryString = params.toString();
    navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`, { replace: true });
  }, [searchQuery, filters, location.pathname, navigate]);

  const title = sector === 'government' ? 'Government Jobs' : sector === 'private' ? 'Private Jobs' : 'All Jobs';
  const countLabel = total > 0 ? `Showing ${total} job${total !== 1 ? 's' : ''}` : `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl text-gray-900 mb-4">{title}</h1>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by job title, company name, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <FilterSidebar onFilterChange={setFilters} categories={metaCategories} locations={metaLocations} />
          </div>

          {/* Job Listings */}
          <div className="md:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                {loading ? 'Loading jobs…' : countLabel}
              </p>
            </div>

            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg mb-4">No jobs found matching your criteria</p>
                  <Button variant="outline" onClick={() => setFilters({
                    categories: [],
                    locations: [],
                    featured: false
                  })}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
