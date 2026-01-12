import { MapPin, Briefcase, Calendar, Star, Building2, ArrowUpRight, Gift, Shield, BriefcaseIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onViewDetails: (jobId: string) => void;
  onSaveJob?: (jobId: string) => void;
  isSaved?: boolean;
}

export function JobCard({ job, onViewDetails, onSaveJob, isSaved }: JobCardProps) {
  // Default to 'private' if sector is missing
  const sector = job.sector || 'private';
  const isGovernment = sector === 'government';
  const daysLeft = Math.ceil((new Date(job.lastDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const locationText = job.location || [
    (job as any).city,
    (job as any).state
  ].filter(Boolean).join(', ');
  
  return (
    <Card
      className={`relative h-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl focus-visible:-translate-y-2 focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200 group`}
    >
      <div
        className={`${
          isGovernment ? 'bg-blue-500' : 'bg-emerald-500'
        } pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-100 transform transition-transform duration-300 group-hover:scale-x-110`}
      />
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute right-6 top-8 h-16 w-16 rounded-full bg-slate-100/50 blur-lg transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      <div className="relative flex h-full flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span 
                className={`${
                  isGovernment 
                    ? '!bg-gradient-to-r !from-blue-500 !to-blue-600 !text-white' 
                    : '!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white'
                } !border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 rounded-md inline-flex`}
                style={{
                  background: isGovernment 
                    ? 'linear-gradient(to right, rgb(59 130 246), rgb(37 99 235))' 
                    : 'linear-gradient(to right, rgb(16 185 129), rgb(5 150 105))',
                  color: 'white'
                }}
              >
                {isGovernment ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    Government
                  </>
                ) : (
                  <>
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    Private
                  </>
                )}
              </span>
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold">{job.category}</Badge>
              {job.featured && (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 text-xs font-semibold" variant="outline">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h3 
                className="text-lg md:text-xl text-gray-900 group-hover:text-slate-950 transition-colors line-clamp-2"
                onClick={() => onViewDetails(job.id)}
              >
                {job.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4" />
              <span className="truncate">{job.organization}</span>
            </div>
          </div>
          
          {onSaveJob && (
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0 text-slate-500 hover:text-yellow-500"
              onClick={(e) => {
                e.stopPropagation();
                onSaveJob(job.id);
              }}
            >
              <Star className={`w-5 h-5 ${isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          <span className="inline-flex items-center gap-2 bg-white/80 border border-white/60 rounded-full px-3 py-1 shadow-sm">
            <MapPin className="w-4 h-4 text-slate-600" />
            {locationText || 'Location'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white/80 border border-white/60 rounded-full px-3 py-1 shadow-sm">
            <Briefcase className="w-4 h-4 text-slate-600" />
            {job.numberOfPosts} Post{job.numberOfPosts > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-2 bg-white/80 border border-white/60 rounded-full px-3 py-1 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-600" />
            Apply by {new Date(job.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="inline-flex items-center gap-2 bg-white/80 border border-white/60 rounded-full px-3 py-1 shadow-sm">
            <Gift className="w-4 h-4 text-slate-600" />
            Qualification: {job.qualification}
          </span>
        </div>

        {/* Salary & Experience */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {job.salary && (
            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">
              💰 {job.salary}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-slate-700 bg-white/80 border border-white/60 rounded-full px-3 py-1">
            📊 Experience: {job.experience}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{job.views} views</span>
            <span>{job.applications} applications</span>
            {daysLeft > 0 && daysLeft <= 7 && (
              <Badge variant="destructive" className="text-[11px]">
                {daysLeft} days left
              </Badge>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => onViewDetails(job.id)}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          >
            View Details
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
