import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Loader2, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { JobCard } from './JobCard';
import { FilterSidebar, FilterOptions } from './FilterSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { fetchJobs, fetchJobsMeta, fetchJobOptions, debugSearch } from '../api/jobs';
import { 
  saveSearchHistory, 
  trackSearch
} from '../utils/searchUtils';

interface JobListingPageProps {
  onNavigate: (page: string, jobId?: string) => void;
  sector?: 'government' | 'private';
}

export function JobListingPage({ onNavigate, sector }: JobListingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedJobOption, setSelectedJobOption] = useState('');
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
  const [hasSearched, setHasSearched] = useState(false);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  
  // Track if this is the initial mount to prevent double fetching
  const isInitialMount = useRef(true);
  
  // Track the last search params to prevent duplicate API calls
  const lastSearchParams = useRef<string>('');

  // Read search query, location, and category from URL params on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');
    const categoryParam = params.get('category');
    
    if (searchParam) {
      setSelectedJobOption(searchParam);
      setHasSearched(true);
    } else {
      setSelectedJobOption('');
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
    // load meta and job options on mount
    (async () => {
      try {
        console.log('Loading job options and meta...');
        const [meta, jobOptions] = await Promise.all([
          fetchJobsMeta(),
          fetchJobOptions()
        ]);
        
        console.log('Meta loaded:', { 
          categories: meta?.categories?.length || 0, 
          locations: meta?.locations?.length || 0 
        });
        console.log('Job options loaded:', { 
          titles: jobOptions.titles?.length || 0, 
          companies: jobOptions.companies?.length || 0 
        });
        
        setMetaCategories(Array.isArray(meta?.categories) ? meta.categories : []);
        setMetaLocations(Array.isArray(meta?.locations) ? meta.locations : []);
        setJobTitles(jobOptions.titles || []);
        setCompanies(jobOptions.companies || []);
        
        // If no job options, log a warning
        if ((jobOptions.titles?.length || 0) === 0 && (jobOptions.companies?.length || 0) === 0) {
          console.warn('WARNING: No job titles or companies available. This may indicate no ACTIVE jobs in the database.');
        }
      } catch (err) {
        console.error('Error loading job options/meta:', err);
      }
    })();
  }, []);

  useEffect(() => {
    // Fetch jobs when search selection or filters change
    const fetchJobsData = async () => {
      // Build params string to check for duplicates
      const currentParams = JSON.stringify({
        search: selectedJobOption,
        sector,
        category: filters.categories[0],
        location: filters.locations[0],
        featured: filters.featured
      });
      
      // Skip if params haven't changed (prevents duplicate calls)
      if (currentParams === lastSearchParams.current && !isInitialMount.current) {
        console.log('Skipping duplicate fetch - params unchanged');
        return;
      }
      
      lastSearchParams.current = currentParams;
      isInitialMount.current = false;
      
      setLoading(true);
      try {
        // Build search params - only include non-empty values
        const params: any = {
          status: 'active',
          size: 50,
        };
        
        // Add search query if a selection was made
        if (selectedJobOption && selectedJobOption.length >= 1) {
          params.search = selectedJobOption;
          console.log('=== SEARCH DEBUG ===');
          console.log('Selected job option:', `"${selectedJobOption}"`);
          console.log('Option length:', selectedJobOption.length);
          console.log('Option char codes:', Array.from(selectedJobOption).map(c => c.charCodeAt(0)));
        }
        
        // Add other filters - but DON'T add location when searching by job title/company
        // The job title/company search should not be restricted by location unless explicitly filtered
        if (sector) params.sector = sector;
        if (filters.categories[0]) params.category = filters.categories[0];
        // Only add location filter if explicitly set in sidebar AND no search query
        // OR if both are set (user wants to filter search results by location)
        if (filters.locations[0]) {
          params.location = filters.locations[0];
          console.log('Location filter applied:', `"${filters.locations[0]}"`);
        }
        if (filters.featured) params.featured = true;
        
        console.log('Final API params:', JSON.stringify(params, null, 2));
        
        const res = await fetchJobs(params);
        console.log('API Response:', { totalElements: res?.totalElements, contentLength: res?.content?.length });
        
        // If no results and we have a search query, run debug search
        if (res?.totalElements === 0 && selectedJobOption) {
          console.log('No results found, running debug search...');
          await debugSearch(selectedJobOption, filters.locations[0]);
        }
        
        let content = res?.content || [];
        let totalCount = res?.totalElements || 0;

        // Normalize job data - ensure sector is always present
        const normalizedJobs = content.map((job: any) => ({
          ...job,
          sector: job.sector?.toLowerCase() || 'private'
        }));
        
        setJobs(normalizedJobs);
        setTotal(totalCount);
        
        // Track search if there was a search query
        if (selectedJobOption) {
          setHasSearched(true);
          trackSearch(selectedJobOption, filters.locations[0] || '', totalCount);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobsData();
  }, [selectedJobOption, filters, sector]);

  // Handle search selection change
  const handleSearchChange = useCallback((value: string) => {
    setSelectedJobOption(value);
    
    if (value) {
      // Update URL when selection is made
      saveSearchHistory(value, filters.locations[0] || '');
      setHasSearched(true);
      
      // Build URL params for shareable URL
      const params = new URLSearchParams();
      params.set('search', value);
      
      if (filters.locations[0]) {
        params.set('location', filters.locations[0]);
      }
      
      if (filters.categories.length > 0) {
        params.set('category', filters.categories[0]);
      }
      
      // Update URL
      const queryString = params.toString();
      navigate(`${location.pathname}?${queryString}`, { replace: true });
    } else {
      // Clear search
      setHasSearched(false);
      
      // Build URL without search
      const params = new URLSearchParams();
      if (filters.locations[0]) {
        params.set('location', filters.locations[0]);
      }
      if (filters.categories.length > 0) {
        params.set('category', filters.categories[0]);
      }
      
      const queryString = params.toString();
      navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`, { replace: true });
    }
  }, [filters, location.pathname, navigate]);
  
  // Clear search handler
  const handleClearSearch = useCallback(() => {
    handleSearchChange('');
  }, [handleSearchChange]);

  const title = sector === 'government' ? 'Government Jobs' : sector === 'private' ? 'Private Jobs' : 'All Jobs';
  
  // Build count label with search context
  const getCountLabel = () => {
    if (loading) return 'Searching...';
    
    const count = total > 0 ? total : jobs.length;
    const jobWord = count === 1 ? 'job' : 'jobs';
    
    if (selectedJobOption && count > 0) {
      return `Found ${count} ${jobWord} for "${selectedJobOption}"`;
    } else if (selectedJobOption && count === 0) {
      return `No jobs found for "${selectedJobOption}"`;
    } else if (count > 0) {
      return `Showing ${count} ${jobWord}`;
    }
    return 'No jobs available';
  };
  
  const countLabel = getCountLabel();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl text-gray-900 mb-4">{title}</h1>
          
          {/* Search Bar - Dropdown Select (same style as Location dropdown) */}
          <div className="max-w-md">
            <div 
              className="flex items-center bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all"
              style={{
                gap: '10px',
                paddingLeft: '14px',
                paddingRight: '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderRadius: '12px',
                minHeight: '48px',
                height: '48px'
              }}
            >
              <Briefcase 
                className="text-gray-400 flex-shrink-0" 
                style={{ width: '18px', height: '18px', minWidth: '18px' }}
                aria-hidden="true"
              />
              <Select value={selectedJobOption} onValueChange={handleSearchChange}>
                <SelectTrigger 
                  id="job-search-title"
                  className="flex-1 border-0 focus:ring-0 text-gray-900 bg-transparent p-0 h-full min-w-0 pl-0"
                  style={{ fontSize: '0.95rem' }}
                  aria-label="Select job title or company"
                >
                  <SelectValue placeholder="Job Title or Company" className="placeholder:text-gray-500" />
                </SelectTrigger>
                <SelectContent className="max-h-[20rem]">
                  {jobTitles.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Job Titles</SelectLabel>
                      {jobTitles.map((title) => (
                        <SelectItem 
                          key={`title-${title}`} 
                          value={title}
                          style={{ fontSize: '0.95rem' }}
                        >
                          {title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {companies.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Companies</SelectLabel>
                      {companies.map((company) => (
                        <SelectItem 
                          key={`company-${company}`} 
                          value={company}
                          style={{ fontSize: '0.95rem' }}
                        >
                          {company}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {jobTitles.length === 0 && companies.length === 0 && (
                    <div className="py-4 text-center text-gray-500 text-sm">
                      No options available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search hint */}
          <p className="text-sm text-gray-500 mt-2">
            Select a job title or company from the dropdown to filter jobs.
          </p>
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
              <p className="text-gray-600 font-medium">
                {countLabel}
              </p>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Searching for jobs...</p>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job: any) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                  />
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {hasSearched ? 'No jobs found' : 'Start your job search'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {hasSearched 
                      ? `No jobs match "${selectedJobOption}". Try selecting a different job title or company.`
                      : 'Search for medical jobs by selecting a job title or company from the dropdown.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {hasSearched && (
                      <Button variant="outline" onClick={handleClearSearch}>
                        Clear Search
                      </Button>
                    )}
                    {(filters.categories.length > 0 || filters.locations.length > 0 || filters.featured) && (
                      <Button variant="outline" onClick={() => setFilters({
                        categories: [],
                        locations: [],
                        featured: false
                      })}>
                        Clear Filters
                      </Button>
                    )}
                    {!hasSearched && (
                      <Button onClick={() => onNavigate('jobs')}>
                        Browse All Jobs
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
