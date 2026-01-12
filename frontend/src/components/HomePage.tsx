import { useState, useEffect } from 'react';
import { Search, TrendingUp, Shield, Users, ChevronRight, MapPin, Briefcase as BriefcaseIcon, Building2, UserCheck, Calendar, Landmark, GraduationCap, AlarmClock, Sparkles, Newspaper } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { JobCard } from './JobCard';
// AI assisted development
import { fetchJobs, fetchJobsMeta } from '../api/jobs';
import { fetchPulseUpdates, PulseUpdate } from '../api/news';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { JobCategoryButtons } from './JobCategoryButtons';

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
      <div className="flex items-center justify-center mb-2">
        <Icon className="w-8 h-8 text-blue-600 mr-2" />
        <div className="text-4xl text-blue-600">{count.toLocaleString()}{suffix}</div>
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [governmentJobs, setGovernmentJobs] = useState<any[]>([]);
  const [privateJobs, setPrivateJobs] = useState<any[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<PulseUpdate[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  // Category buttons now provided by JobCategoryButtons component

  useEffect(() => {
    // Load featured, latest, government, private jobs and news
    (async () => {
      try {
        const [feat, latest, gov, priv, meta, news] = await Promise.all([
          fetchJobs({ featured: true, size: 6 }).then(r => r.content ?? []),
          fetchJobs({ size: 6, sort: 'createdAt,desc' }).then(r => r.content ?? []),
          fetchJobs({ sector: 'government', size: 3 }).then(r => r.content ?? []),
          fetchJobs({ sector: 'private', size: 3 }).then(r => r.content ?? []),
          fetchJobsMeta(),
          fetchPulseUpdates(),
        ]);

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
        
        setGovernmentJobs(Array.isArray(gov) ? gov : []);
        setPrivateJobs(Array.isArray(priv) ? priv : []);
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

  const handleSearch = () => {
    onNavigate('jobs');
  };

  const handleCategoryClick = (category: string) => {
    // In a real app, this would filter by category
    onNavigate('jobs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Better Visible Background */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 overflow-hidden">
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

            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-full p-3 shadow-2xl animate-fade-in-up hover:shadow-3xl transition-shadow duration-300" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    className="pl-10 border-0 focus-visible:ring-0 text-gray-900 h-12 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="pl-10 border-0 focus:ring-0 text-gray-900 h-12 rounded-full">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 px-8 h-12 rounded-full transform hover:scale-105 transition-transform"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* Category Buttons */}
            <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <JobCategoryButtons onCategoryClick={handleCategoryClick} />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 bg-white border-b relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
        
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
            {/* Government Jobs */}
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-6">
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
              {governmentJobs.length > 0 ? (
                <div className="space-y-4">
                  {governmentJobs.map((job, index) => (
                    <Card 
                      key={job.id} 
                      className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-600 animate-fade-in-right" 
                      onClick={() => onNavigate('job-detail', job.id)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors" variant="outline">
                        Government
                      </Badge>
                      <h3 className="text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        {job.organization}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{job.numberOfPosts} Posts</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No government jobs available at the moment</p>
                </Card>
              )}
            </div>

            {/* Private Jobs */}
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-6">
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
              {privateJobs.length > 0 ? (
                <div className="space-y-4">
                  {privateJobs.map((job, index) => (
                    <Card 
                      key={job.id} 
                      className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-green-600 animate-fade-in-left" 
                      onClick={() => onNavigate('job-detail', job.id)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Badge className="bg-green-100 text-green-700 border-green-200 mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors" variant="outline">
                        Private
                      </Badge>
                      <h3 className="text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        {job.organization}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{job.salary}</span>
                      </div>
                    </Card>
                  ))}
                </div>
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

      {/* ================= PROFESSIONAL LATEST NEWS ================= */}
      {newsUpdates.length > 0 && (
        <section className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
          <div className="absolute -left-20 top-10 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute -right-24 bottom-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                  Fresh updates
                </div>
                <h2 className="text-3xl font-semibold text-gray-900">Latest News & Updates</h2>
                <p className="text-gray-600">Official medical notifications, exams, and policy updates</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-slate-300 text-gray-700 hover:bg-gray-900 hover:text-white"
                  onClick={() => onNavigate('news')}
                >
                  View All News <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* News Grid */}
            {newsUpdates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const cardMeta: Record<string, { label: string; badge: string; ring: string; bg: string; hover: string; sub: string; icon: any; iconBg: string; iconColor: string; iconRing: string; border: string; hoverBorder: string; accent: string }> = {
                  GOVT: { label: 'Government', badge: 'bg-blue-100 text-blue-800 border-blue-200', ring: 'ring-blue-100', bg: 'from-blue-50 to-white', hover: 'hover:shadow-[0_20px_48px_-28px_rgba(59,130,246,0.45)]', sub: 'Govt notice', icon: Landmark, iconBg: 'from-blue-500/25 via-blue-400/15 to-blue-300/15', iconColor: 'text-blue-700', iconRing: 'ring-blue-200/70', border: 'border-blue-200', hoverBorder: 'hover:border-blue-300', accent: 'from-blue-500 to-blue-300' },
                  EXAM: { label: 'Exam', badge: 'bg-purple-100 text-purple-800 border-purple-200', ring: 'ring-purple-100', bg: 'from-purple-50 to-white', hover: 'hover:shadow-[0_20px_48px_-28px_rgba(126,34,206,0.45)]', sub: 'Exam update', icon: GraduationCap, iconBg: 'from-purple-500/25 via-purple-400/15 to-purple-300/15', iconColor: 'text-purple-700', iconRing: 'ring-purple-200/70', border: 'border-purple-200', hoverBorder: 'hover:border-purple-300', accent: 'from-purple-500 to-purple-300' },
                  PRIVATE: { label: 'Private', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', ring: 'ring-emerald-100', bg: 'from-emerald-50 to-white', hover: 'hover:shadow-[0_20px_48px_-28px_rgba(16,185,129,0.45)]', sub: 'Private sector', icon: BriefcaseIcon, iconBg: 'from-emerald-500/25 via-emerald-400/15 to-emerald-300/15', iconColor: 'text-emerald-700', iconRing: 'ring-emerald-200/70', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-300', accent: 'from-emerald-500 to-emerald-300' },
                  DEADLINE: { label: 'Deadline', badge: 'bg-amber-100 text-amber-800 border-amber-200', ring: 'ring-amber-100', bg: 'from-amber-50 to-white', hover: 'hover:shadow-[0_20px_48px_-28px_rgba(245,158,11,0.45)]', sub: 'Deadline alert', icon: AlarmClock, iconBg: 'from-amber-500/25 via-amber-400/15 to-amber-300/15', iconColor: 'text-amber-700', iconRing: 'ring-amber-200/70', border: 'border-amber-200', hoverBorder: 'hover:border-amber-300', accent: 'from-amber-500 to-amber-300' },
                  UPDATE: { label: 'Update', badge: 'bg-slate-100 text-slate-800 border-slate-200', ring: 'ring-slate-100', bg: 'from-slate-50 to-white', hover: 'hover:shadow-[0_20px_48px_-28px_rgba(51,65,85,0.35)]', sub: 'General update', icon: Sparkles, iconBg: 'from-slate-500/25 via-slate-400/15 to-slate-300/15', iconColor: 'text-slate-700', iconRing: 'ring-slate-200/70', border: 'border-slate-200', hoverBorder: 'hover:border-slate-300', accent: 'from-slate-500 to-slate-300' },
                };
                const formatDate = (dateStr: string) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  if (Number.isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                };

                return newsUpdates.map((update, index) => {
                  const meta = cardMeta[update.type] ?? cardMeta.UPDATE;
                  const Icon = meta.icon;
                  return (
                    <Card
                      key={update.id}
                      className={`relative overflow-hidden p-5 md:p-6 bg-gradient-to-br ${meta.bg} border ${meta.border} rounded-2xl transition-all duration-300 cursor-pointer group ring-1 ${meta.ring} ${meta.hover} hover:-translate-y-2 ${meta.hoverBorder} hover:shadow-[0_28px_60px_-35px_rgba(15,23,42,0.45)]`}
                      style={{ animationDelay: `${index * 0.04}s` }}
                      onClick={() => onNavigate('news')}
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-80">
                        <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${meta.accent} opacity-90`} />
                        <div className="absolute -right-10 -top-14 w-32 h-32 bg-white/60 blur-3xl" />
                        <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/60" />
                        <div className="absolute left-0 bottom-0 h-[3px] w-full bg-gradient-to-r from-transparent via-sky-300/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -left-8 -bottom-12 w-40 h-40 bg-gradient-to-br from-blue-200/40 via-emerald-200/40 to-amber-200/40 rounded-full blur-3xl rotate-[-8deg]" />
                        <div className="absolute -right-6 bottom-6 w-28 h-28 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.25),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.25),transparent_55%)] opacity-70" />
                      </div>

                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br ${meta.iconBg} border border-white/60 shadow-sm ring-1 ${meta.iconRing}`}>
                              <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                            </span>
                            <Badge variant="outline" className={`${meta.badge} px-3 py-1 text-xs font-semibold`}>{meta.label}</Badge>
                            <span className="hidden md:inline-flex items-center text-[11px] text-slate-600 bg-white/80 border border-white/60 rounded-full px-3 py-1 shadow-sm">{meta.sub}</span>
                          </div>
                          {update.breaking && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-70" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                              </span>
                              Breaking
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 bg-white/80 border border-white/60 rounded-full px-3 py-1.5 w-fit shadow-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDate(update.date)}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">{update.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">Stay current on critical medical updates and notices.</p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-slate-500">Tap to view full story</span>
                          <Button variant="ghost" className="h-9 px-3 text-blue-700 hover:text-white hover:bg-blue-600 transition-colors gap-1">
                            View →
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
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
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
