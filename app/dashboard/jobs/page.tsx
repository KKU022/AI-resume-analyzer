'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  ArrowRight,
  Building2,
  MapPin,
  DollarSign,
  Rocket,
  Bookmark,
  Loader2,
  BookmarkCheck,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';


type JobItem = {
  externalId: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  url: string;
  skills: string[];
  match: number;
  saved: boolean;
};

type JobsResponse = {
  jobs: JobItem[];
  userSkills: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [query, setQuery] = useState('frontend developer');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleJobs = useMemo(() => {
    if (!remoteOnly) {
      return jobs;
    }
    return jobs.filter((job) => /remote/i.test(job.location));
  }, [jobs, remoteOnly]);

  const loadJobs = async (searchValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(searchValue)}`);
      if (!res.ok) {
        throw new Error('Failed to load jobs');
      }

      const payload = (await res.json()) as JobsResponse;
      setJobs(payload.jobs || []);
      setUserSkills(payload.userSkills || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs('frontend developer');
  }, []);

  const toggleSave = async (job: JobItem) => {
    setSavingId(job.externalId);
    try {
      if (job.saved) {
        const res = await fetch(`/api/jobs?externalId=${encodeURIComponent(job.externalId)}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to unsave job');
        }
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job),
        });
        if (!res.ok) {
          throw new Error('Failed to save job');
        }
      }

      setJobs((prev) =>
        prev.map((item) =>
          item.externalId === job.externalId ? { ...item, saved: !item.saved } : item
        )
      );
      
      const action = job.saved ? 'removed from' : 'saved to';
      showSuccessToast(`Job ${action} your list`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update saved state';
      setError(message);
      showErrorToast(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk text-white">Real Job Matching</h1>
          <p className="text-slate-400 mt-2">
            Live jobs matched against your extracted resume skills. Apply directly or save for later.
          </p>
          <p className="text-xs text-[#38BDF8] mt-2">
            Detected profile skills: {userSkills.length > 0 ? userSkills.slice(0, 8).join(', ') : 'No skills detected yet. Upload a resume to improve matching.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role (frontend, node, react...)"
            className="h-12 min-w-[260px] rounded-xl border border-white/10 bg-[#111827]/60 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1]/50"
          />
          <Button
            onClick={() => void loadJobs(query)}
            className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl h-12"
          >
            Analyze Jobs
          </Button>
          <Button
            variant="outline"
            onClick={() => setRemoteOnly((prev) => !prev)}
            className="border-white/10 text-white hover:bg-white/5 rounded-xl h-12"
          >
            {remoteOnly ? 'Showing Remote' : 'Remote Only'}
          </Button>
          <Link href="/dashboard/saved-jobs" prefetch>
            <Button
              variant="outline"
              className="border-[#38BDF8]/30 text-[#38BDF8] hover:bg-[#38BDF8]/10 rounded-xl h-12"
            >
              Saved Jobs
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
          <p className="text-red-200 text-sm font-bold">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin" /> Fetching real jobs and matching your skills...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleJobs.map((job) => {
            const missingCount = Math.max(0, job.skills.length - Math.round((job.match / 100) * job.skills.length));

            return (
              <Card key={job.externalId} className="bg-white/5 border-white/5 hover:border-white/10 transition-all flex flex-col group relative">
                <div className="absolute top-4 right-4 text-[#22C55E] flex items-center gap-1 font-black text-sm">
                  <Rocket className="w-4 h-4" /> {job.match}%
                </div>

                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#6366F1]/30 transition-colors">
                    <Building2 className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl group-hover:text-[#6366F1] transition-colors">{job.title}</CardTitle>
                    <CardDescription className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                      {job.company} • <MapPin className="w-3 h-3" /> {job.location}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  <p className="text-sm text-slate-300">
                    You match {job.match}% of required skills. Missing {missingCount} key skills.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm text-[#22C55E] font-bold">
                      <DollarSign className="w-4 h-4" /> {job.salary}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <Button
                      variant="outline"
                      onClick={() => void toggleSave(job)}
                      disabled={savingId === job.externalId}
                      className="border-white/10 text-white hover:bg-white/5 rounded-xl text-xs h-10"
                    >
                      {savingId === job.externalId ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : job.saved ? (
                        <BookmarkCheck className="w-3 h-3 mr-2" />
                      ) : (
                        <Bookmark className="w-3 h-3 mr-2" />
                      )}
                      {job.saved ? 'Saved' : 'Save'}
                    </Button>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl text-xs h-10">
                        Apply Now <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {visibleJobs.length === 0 && (
            <Card className="col-span-full bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Briefcase className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h4 className="text-white font-bold">No jobs found for this filter</h4>
                <p className="text-xs text-slate-500">Try another role query or disable remote-only filter.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="p-10 rounded-[40px] bg-gradient-to-r from-[#6366F1]/10 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold font-space-grotesk text-white leading-tight">Need better match rates?</h3>
          <p className="text-slate-400 text-sm max-w-lg">Use one-click resume fixes, then refresh jobs to see improved role alignment.</p>
        </div>
        <Link href="/dashboard/analysis" prefetch>
          <Button className="bg-white text-[#0B1120] hover:bg-slate-200 px-8 py-6 rounded-full font-bold text-md">
            Open Resume Fix Suggestions
          </Button>
        </Link>
      </div>
    </div>
  );
}
