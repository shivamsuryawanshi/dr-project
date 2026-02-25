import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Shield, Users, ChevronRight, MapPin, Briefcase as BriefcaseIcon, Building2, UserCheck, Calendar, Landmark, GraduationCap, AlarmClock, Sparkles, Newspaper } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { JobCard } from './JobCard';
import { fetchJobs, fetchJobsMeta, fetchJobOptions } from '../api/jobs';
import { fetchHomepageNews, PulseUpdate } from '../api/news';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  saveSearchHistory, 
  trackSearch
} from '../utils/searchUtils';

interface HomePageProps {
  onNavigate: (page: string, jobId?: string) => void;
}

// Custom hook for animated counter
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function StatCard({ icon: Icon, end, label, suffix = '' }: { icon: any, end: number, label: string, suffix?: string }) {
  const count = useCounter(end);
  
  return (
    <div className="text-center transform hover:scale-105 transition-transform duration-300">
      <div className="flex flex-col items-center justify-center mb-3">
        {/* Icon with explicit styling for visibility */}
        <div className="mb-3 flex items-center justify-center">
          <Icon 
            className="w-12 h-12 md:w-14 md:h-14 text-blue-600 flex-shrink-0" 
            strokeWidth={2.5}
            fill="none"
            stroke="currentColor"
            style={{ color: '#2563EB' }}
          />
        </div>
        {/* Number */}
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1">
          {count.toLocaleString()}{suffix}
        </div>
      </div>
      {/* Label */}
      <div className="text-gray-600 text-sm md:text-base font-medium">{label}</div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedJobOption, setSelectedJobOption] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [governmentJobs, setGovernmentJobs] = useState<any[]>([]);
  const [privateJobs, setPrivateJobs] = useState<any[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<PulseUpdate[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    // Load featured, latest, government, private jobs, news, and job options
    (async () => {
      try {
        const [feat, latest, gov, priv, meta, news, jobOptions] = await Promise.all([
          fetchJobs({ featured: true, size: 6, status: 'active' }).then(r => r.content ?? []),
          fetchJobs({ size: 6, sort: 'createdAt,desc', status: 'active' }).then(r => r.content ?? []),
          fetchJobs({ sector: 'government', size: 10, status: 'active' }).then(r => r.content ?? []),
          fetchJobs({ sector: 'private', size: 10, status: 'active' }).then(r => r.content ?? []),
          fetchJobsMeta(),
          fetchHomepageNews(),
          fetchJobOptions(),
        ]);
        
        // Set job options for dropdown
        setJobTitles(jobOptions.titles || []);
        setCompanies(jobOptions.companies || []);

        // Combine featured and latest jobs, removing duplicates, limit to 6
        const featuredArray = Array.isArray(feat) ? feat : [];
        const latestArray = Array.isArray(latest) ? latest : [];
        
        // Create a map to track job IDs to avoid duplicates
        const jobMap = new Map();
        
        // First add featured jobs
        featuredArray.forEach(job => {
          if (job.id) jobMap.set(job.id, job);
        });
        
        // Then add latest jobs (up to 6 total)
        latestArray.forEach(job => {
          if (job.id && jobMap.size < 6) {
            jobMap.set(job.id, job);
          }
        });
        
        // Convert map to array and limit to 6
        const combinedJobs = Array.from(jobMap.values()).slice(0, 6);
        setFeaturedJobs(combinedJobs);
        
        // Filter government jobs - ensure only government sector jobs are included
        const filteredGovJobs = Array.isArray(gov) 
          ? gov.filter(job => {
              const jobSector = job.sector?.toLowerCase() || '';
              return jobSector === 'government';
            }).slice(0, 3)
          : [];
        setGovernmentJobs(filteredGovJobs);
        
        // Filter private jobs - ensure only private sector jobs are included
        const filteredPrivateJobs = Array.isArray(priv) 
          ? priv.filter(job => {
              const jobSector = job.sector?.toLowerCase() || '';
              return jobSector === 'private';
            }).slice(0, 3)
          : [];
        setPrivateJobs(filteredPrivateJobs);
        setNewsUpdates(Array.isArray(news) ? news.slice(0, 6) : []);

        const locs: string[] = Array.isArray(meta?.locations) ? meta.locations : [];
        setLocations(locs);

      } catch (e) {
        // Set empty arrays on error, no mock data fallback
        setFeaturedJobs([]);
        setGovernmentJobs([]);
        setPrivateJobs([]);
        setLocations([]);
        setNewsUpdates([]);
      }
    })();
  }, []);

  // Handle search - only works when a selection is made
  const handleSearch = useCallback(() => {
    // Must have a job option selected to search
    if (!selectedJobOption) {
      return;
    }
    
    // Save to search history
    saveSearchHistory(selectedJobOption, selectedLocation);
    trackSearch(selectedJobOption, selectedLocation, 0);
    
    // Build URL params
    const params = new URLSearchParams();
    params.set('search', selectedJobOption);
    
    if (selectedLocation) {
      params.set('location', selectedLocation);
    }
    
    // Navigate to jobs page with search params
    const queryString = params.toString();
    onNavigate(`jobs?${queryString}`);
  }, [selectedJobOption, selectedLocation, onNavigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Better Visible Background */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 md:py-24 overflow-hidden">
        {/* Background Image with Better Visibility */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1666886573590-5815157da865?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwaGVhbHRoY2FyZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjAzNzY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Medical professionals"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-blue-700/70 to-blue-900/70"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in">
              <span className="text-sm"></span>
            </div> */}
            
            <h1 className="text-5xl md:text-6xl mb-6 animate-fade-in-up">
              Find Your Dream Medical Career
            </h1>
            <p className="text-xl text-blue-100 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              India's Premier Job Portal for Doctors, Nurses & Paramedical Professionals
            </p>

            {/* Enhanced Search Bar - Refined */}
            <div 
              className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up max-w-6xl mx-auto px-4 sm:px-6"
              style={{ 
                animationDelay: '0.4s',
                borderRadius: 'clamp(0.5rem, 1vw, 1.5rem)',
                padding: 'clamp(0.75rem, 1.5vw, 1.25rem)'
              }}
            >
              {/* Mobile: Stack | Tablet: Grid 2-col | Desktop: Grid 3-col with equal widths */}
              <div 
                className="flex flex-col md:grid md:grid-cols-2 lg:grid lg:grid-cols-3 items-stretch"
                style={{ gap: 'clamp(0.75rem, 1.5vw, 1rem)' }}
              >
                {/* Job Title / Company Dropdown - Same style as Location */}
                <div 
                  className="flex items-center bg-white border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800/50 transition-all min-w-[240px]"
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
                  <BriefcaseIcon 
                    className="text-gray-400 dark:text-gray-500 flex-shrink-0" 
                    style={{ width: '18px', height: '18px', minWidth: '18px' }}
                    aria-hidden="true"
                  />
                  <Select value={selectedJobOption} onValueChange={setSelectedJobOption}>
                    <SelectTrigger 
                      id="job-search-title"
                      className="flex-1 border-0 focus:ring-0 text-gray-900 dark:text-gray-100 bg-transparent p-0 h-full min-w-0 pl-0"
                      style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
                      aria-label="Select job title or company"
                    >
                      <SelectValue placeholder="Job Title or Company" className="placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[20rem]">
                      {jobTitles.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Job Titles</SelectLabel>
                          {jobTitles.map((title) => (
                            <SelectItem 
                              key={`title-${title}`} 
                              value={title}
                              style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
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
                              style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
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

                {/* Location Dropdown */}
                <div 
                  className="flex items-center bg-white border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800/50 transition-all min-w-[240px]"
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
                  <MapPin 
                    className="text-gray-400 dark:text-gray-500 flex-shrink-0" 
                    style={{ width: '18px', height: '18px', minWidth: '18px' }}
                    aria-hidden="true"
                  />
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger 
                      id="job-search-location"
                      className="flex-1 border-0 focus:ring-0 text-gray-900 dark:text-gray-100 bg-transparent p-0 h-full min-w-0 pl-0"
                      style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
                      aria-label="Select job location"
                    >
                      <SelectValue placeholder="Select Location" className="placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[20rem]">
                      {locations.map((location) => (
                        <SelectItem 
                          key={location} 
                          value={location}
                          style={{ fontSize: 'clamp(0.85rem, 1vw, 1rem)' }}
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button - Disabled until job option is selected */}
                <Button 
                  id="job-search-submit"
                  type="button"
                  disabled={!selectedJobOption}
                  className="w-full md:col-span-2 lg:col-span-1 lg:min-w-[240px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    gap: 'clamp(0.5rem, 1vw, 0.75rem)',
                    paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                    paddingRight: 'clamp(1rem, 2vw, 2rem)',
                    paddingTop: 'clamp(0.625rem, 1vw, 0.875rem)',
                    paddingBottom: 'clamp(0.625rem, 1vw, 0.875rem)',
                    borderRadius: 'clamp(0.5rem, 1vw, 1.5rem)',
                    minHeight: 'clamp(2.75rem, 3vw, 3.25rem)',
                    height: 'clamp(2.75rem, 3vw, 3.25rem)',
                    fontSize: 'clamp(0.85rem, 1vw, 1rem)'
                  }}
                  onClick={handleSearch}
                  aria-label={selectedJobOption ? "Search for jobs" : "Select a job title or company first"}
                >
                  <Search 
                    className="flex-shrink-0" 
                    style={{ width: 'clamp(1rem, 1.2vw, 1.25rem)', height: 'clamp(1rem, 1.2vw, 1.25rem)' }}
                    aria-hidden="true" 
                  />
                  <span>{selectedJobOption ? 'Search Jobs' : 'Select to Search'}</span>
                </Button>
              </div>
              
              {/* Helper text */}
              <p className="text-blue-100 text-sm mt-3 text-center">
                Select a job title or company from the dropdown, then click Search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 bg-white border-b relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon={BriefcaseIcon} end={5000} label="Active Jobs" suffix="+" />
            <StatCard icon={Building2} end={2000} label="Hospitals" suffix="+" />
            <StatCard icon={Users} end={50000} label="Candidates" suffix="+" />
            <StatCard icon={UserCheck} end={10000} label="Placements" suffix="+" />
          </div>
        </div>
      </section>

      {/* Latest Jobs with Animations */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl text-gray-900 mb-2">Latest Jobs</h2>
              <p className="text-gray-600">Latest job opportunities for you</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('jobs')}
              className="group hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
            >
              View All 
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {featuredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredJobs.map((job, index) => (
                <div 
                  key={job.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <JobCard
                    job={job}
                    onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available Yet</h3>
              <p className="text-gray-600 mb-6">Check back soon for latest job opportunities</p>
              <Button onClick={() => onNavigate('jobs')} variant="outline">
                Browse All Jobs
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Government & Private Jobs Split with Hover Effects */}
      <section className="py-16 bg-gray-100 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Government Jobs Column */}
            <div className="space-y-4">
              {/* Government Jobs Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl text-gray-900 flex items-center">
                    <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
                    Government Jobs
                  </h2>
                  <p className="text-sm text-gray-600 ml-5 mt-1">Official government vacancies</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  onClick={() => onNavigate('govt-jobs')}
                >
                  View All
                </Button>
              </div>
              
              {/* Government Job Cards */}
              {governmentJobs.length > 0 ? (
                governmentJobs.map((job, index) => (
                  <div 
                    key={job.id}
                    className="animate-fade-in-right transform hover:scale-[1.02] transition-transform duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <JobCard
                      job={job}
                      onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                    />
                  </div>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No government jobs available at the moment</p>
                </Card>
              )}
            </div>

            {/* Private Jobs Column */}
            <div className="space-y-4">
              {/* Private Jobs Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl text-gray-900 flex items-center">
                    <span className="w-2 h-8 bg-green-600 rounded-full mr-3"></span>
                    Private Jobs
                  </h2>
                  <p className="text-sm text-gray-600 ml-5 mt-1">Top hospitals & healthcare providers</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
                  onClick={() => onNavigate('private-jobs')}
                >
                  View All
                </Button>
              </div>
              
              {/* Private Job Cards */}
              {privateJobs.length > 0 ? (
                privateJobs.map((job, index) => (
                  <div 
                    key={job.id}
                    className="animate-fade-in-left transform hover:scale-[1.02] transition-transform duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <JobCard
                      job={job}
                      onViewDetails={(jobId) => onNavigate('job-detail', jobId)}
                    />
                  </div>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No private jobs available at the moment</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREMIUM EDITORIAL NEWS SECTION ================= */}
      {newsUpdates.length > 0 && (
        <section className="relative py-20 bg-gradient-to-br from-white via-gray-50/50 to-white overflow-hidden">
          {/* Subtle background patterns */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Premium Editorial Header */}
            <div className="mb-12">
              <div className="mb-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-4 py-2 rounded-full border-2 border-blue-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                    </span>
                    Breaking News
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                    Latest News & Updates
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Stay informed with the latest medical notifications, exam updates, and industry news
                  </p>
                </div>
              </div>

            </div>

            {/* News Cards - Job Cards Style with Equal Space */}
            {newsUpdates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  // Get all news (breaking + regular) - max 4 cards, all equal size
                  const allNews = newsUpdates.slice(0, 4);
                  
                  const formatDate = (dateStr: string) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    if (Number.isNaN(d.getTime())) return dateStr;
                    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  };

                  const getIcon = (type: string) => {
                    const iconMap: Record<string, any> = {
                      GOVT: Landmark,
                      EXAM: GraduationCap,
                      PRIVATE: BriefcaseIcon,
                      DEADLINE: AlarmClock,
                      UPDATE: Sparkles
                    };
                    return iconMap[type] || Sparkles;
                  };

                  return allNews.map((update, index) => {
                    const Icon = getIcon(update.type);
                    const isBreaking = update.breaking;
                    
                    // Alternate between green and blue, but red for breaking
                    let borderColor, badgeBg, badgeText, iconColor, buttonBg, headlineColor;
                    
                    if (isBreaking) {
                      // Red for breaking
                      borderColor = '#ef4444';
                      badgeBg = 'linear-gradient(to right, #dc2626, #b91c1c)';
                      badgeText = 'Breaking';
                      iconColor = '#dc2626';
                      buttonBg = 'linear-gradient(to right, #dc2626, #b91c1c)';
                      headlineColor = '#dc2626';
                    } else {
                      // Alternate green and blue
                      const isGreen = index % 2 === 0;
                      if (isGreen) {
                        borderColor = '#10b981';
                        badgeBg = 'linear-gradient(to right, #10b981, #059669)';
                        badgeText = update.type === 'PRIVATE' ? 'Vacancies' : update.type || 'Update';
                        iconColor = '#10b981';
                        buttonBg = 'linear-gradient(to right, #10b981, #059669)';
                        headlineColor = '#059669';
                      } else {
                        borderColor = '#2563eb';
                        badgeBg = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                        badgeText = update.type === 'GOVT' ? 'Government' : update.type || 'Update';
                        iconColor = '#2563eb';
                        buttonBg = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                        headlineColor = '#1d4ed8';
                      }
                    }
                    
                    return (
                      <Card
                        key={update.id}
                        className="relative h-full cursor-pointer overflow-hidden rounded-2xl border-2 p-5 md:p-6 shadow-md transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-xl focus-visible:-translate-y-2 focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200 group"
                        style={{
                          background: '#ffffff',
                          borderColor: borderColor,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => update.fullStory ? onNavigate(`news/${update.id}`) : onNavigate('news')}
                      >
                        <div className="relative flex h-full flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span 
                                  className="!border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 rounded-md inline-flex text-white"
                                  style={{ background: badgeBg }}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {badgeText}
                                </span>
                                {isBreaking && (
                                  <Badge className="bg-red-600 text-white border-0 px-3 py-1 text-xs font-semibold">
                                    BREAKING
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <h3 
                                  className="text-lg md:text-xl font-bold group-hover:opacity-80 transition-opacity line-clamp-2"
                                  style={{ color: headlineColor }}
                                >
                                  {update.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Meta pills - Colorful */}
                          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                            <span className="inline-flex items-center gap-2 bg-blue-100/90 border border-blue-200 text-blue-700 rounded-full px-3 py-1.5 shadow-sm hover:bg-blue-200 transition-colors">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              {formatDate(update.date)}
                            </span>
                            <span className="inline-flex items-center gap-2 bg-purple-100/90 border border-purple-200 text-purple-700 rounded-full px-3 py-1.5 shadow-sm hover:bg-purple-200 transition-colors">
                              <Icon className="w-4 h-4 text-purple-600" />
                              {update.type || 'Update'}
                            </span>
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              Stay informed with the latest medical updates, policy changes, and critical notifications affecting healthcare professionals.
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3 md:flex-row md:items-center md:justify-between">
                            <span className="text-xs text-gray-500">
                              Tap to read full story
                            </span>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (update.fullStory) {
                                  onNavigate(`news/${update.id}`);
                                } else {
                                  onNavigate('news');
                                }
                              }}
                              className="inline-flex min-w-[140px] items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transition-all"
                              style={{ background: buttonBg }}
                            >
                              View Full Story
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  });
                })()}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Updates Yet</h3>
                <p className="text-gray-600 mb-6">Check back soon for the latest medical news and updates</p>
                <Button variant="outline" onClick={() => onNavigate('news')}>
                  View News Page
                </Button>
              </Card>
            )}
          </div>
        </section>
      )}


      {/* Why Choose Us - More Interactive */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-gray-900 mb-3">Why Choose MedExJob.com?</h2>
            <p className="text-gray-600">Your trusted partner in medical career advancement</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-t-4 border-t-blue-600">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                <Shield className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Verified Employers</h3>
              <p className="text-gray-600">All employers are verified to ensure authentic job postings</p>
            </Card>

            <Card className="p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-t-4 border-t-green-600">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-green-600 transition-all duration-300">
                <TrendingUp className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Latest Opportunities</h3>
              <p className="text-gray-600">Get instant alerts for the latest government and private jobs</p>
            </Card>

            <Card className="p-8 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-t-4 border-t-purple-600">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-300">
                <Users className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Direct Applications</h3>
              <p className="text-gray-600">Apply directly and track your application status in real-time</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with Animation */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl mb-4 animate-fade-in-up">Ready to Start Your Medical Career?</h2>
          <p className="text-xl text-blue-100 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Join thousands of medical professionals who found their dream jobs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={() => onNavigate('register')}
            >
              Register as Candidate
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={() => onNavigate('register')}
            >
              Register as Employer
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
