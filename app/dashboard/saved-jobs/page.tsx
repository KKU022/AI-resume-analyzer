'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ExternalLink, Loader2, CheckCircle2, Clock3, BookmarkX } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';


type SavedJob = {
  _id: string;
  externalId: string;
  title: string;
  company: string;
  salary?: string;
  location?: string;
  url: string;
  skills: string[];
  match: number;
  applied?: boolean;
  appliedAt?: string;
  status?: 'saved' | 'applied';
  createdAt: string;
};

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const applied = jobs.filter((job) => job.applied || job.status === 'applied').length;
    return {
      total: jobs.length,
      applied,
      pending: Math.max(0, jobs.length - applied),
    };
  }, [jobs]);

  const loadSavedJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jobs/saved');
      if (!res.ok) {
        throw new Error('Failed to load saved jobs');
      }

      const payload = (await res.json()) as { savedJobs?: SavedJob[] };
      setJobs(Array.isArray(payload.savedJobs) ? payload.savedJobs : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSavedJobs();
  }, []);

  const markApplied = async (externalId: string, applied: boolean) => {
    setUpdatingId(externalId);
    setError(null);

    try {
      const res = await fetch('/api/jobs/saved', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId, applied }),
      });

      if (!res.ok) {
        throw new Error('Failed to update job status');
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.externalId === externalId
            ? {
                ...job,
                applied,
                status: applied ? 'applied' : 'saved',
                appliedAt: applied ? new Date().toISOString() : undefined,
              }
            : job
        )
      );
      
      showSuccessToast(applied ? 'Marked as applied!' : 'Unmarked as applied');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update status';
      setError(message);
      showErrorToast(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeSaved = async (externalId: string) => {
    setUpdatingId(externalId);
    setError(null);

    try {
      const res = await fetch(`/api/jobs?externalId=${encodeURIComponent(externalId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove saved job');
      }

      setJobs((prev) => prev.filter((job) => job.externalId !== externalId));
      showSuccessToast('Job removed from saved list');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not remove saved job';
      setError(message);
      showErrorToast(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading saved jobs...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white font-space-grotesk tracking-tight">Saved Jobs Tracker</h1>
          <p className="text-slate-400 mt-2">Track what you saved, what you applied to, and what is still pending.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white/5 border border-white/10 text-white">Total: {stats.total}</Badge>
          <Badge className="bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">Applied: {stats.applied}</Badge>
          <Badge className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">Pending: {stats.pending}</Badge>
        </div>
      </div>

      {error && <Card className="bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200">{error}</Card>}

      {jobs.length === 0 ? (
        <Card className="bg-[#111827]/40 border-white/10 rounded-3xl p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white">No saved jobs yet</h2>
          <p className="text-slate-400 mt-2">Go to Job Matching and save roles you want to track.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const isApplied = Boolean(job.applied || job.status === 'applied');
            return (
              <Card key={job.externalId} className="bg-[#111827]/50 border-white/10 rounded-3xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{job.title}</h3>
                    <p className="text-slate-400 text-sm">{job.company} • {job.location || 'Remote'}</p>
                  </div>
                  {isApplied ? (
                    <Badge className="bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Applied
                    </Badge>
                  ) : (
                    <Badge className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
                      <Clock3 className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(job.skills || []).slice(0, 6).map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-white/5 border-white/10 text-slate-300">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-slate-300">
                  Match: <span className="font-black text-[#38BDF8]">{job.match}%</span>
                  {job.appliedAt ? (
                    <span className="text-slate-500"> • Applied on {new Date(job.appliedAt).toLocaleDateString()}</span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="sm:col-span-1">
                    <Button className="w-full bg-[#6366F1] hover:bg-[#4f52e2] text-white">
                      Apply <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => void markApplied(job.externalId, !isApplied)}
                    disabled={updatingId === job.externalId}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    {updatingId === job.externalId ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                    )}
                    {isApplied ? 'Mark Pending' : 'Mark Applied'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void removeSaved(job.externalId)}
                    disabled={updatingId === job.externalId}
                    className="border-red-400/30 text-red-300 hover:bg-red-500/10"
                  >
                    <BookmarkX className="w-3 h-3 mr-2" /> Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
