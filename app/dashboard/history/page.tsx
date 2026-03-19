'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Trash2,
  Calendar,
  Loader2,
  Plus,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type HistoryItem = {
  _id: string;
  fileName: string;
  score: number;
  atsCompatibility?: number;
  skillMatch?: number;
  createdAt: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return history;
    }
    return history.filter((item) => item.fileName.toLowerCase().includes(q));
  }, [history, query]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) {
        throw new Error('Failed to load history');
      }
      const data = (await res.json()) as HistoryItem[];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  const deleteHistory = async (id: string) => {
    const confirmed = window.confirm('Delete this analysis record permanently?');
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError(null);

    const previous = history;
    setHistory((prev) => prev.filter((item) => item._id !== id));

    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not delete record';
      setError(message);
      setHistory(previous);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading real analysis history...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-space-grotesk text-white tracking-tight">Analysis History</h1>
          <p className="text-slate-400 mt-2">Your Medha intelligence timeline: track progress, compare scores, and prune outdated records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by file name"
              className="bg-[#111827]/40 border border-white/5 rounded-2xl h-12 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#6366F1]/50 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.18)] w-64"
            />
          </div>
          <Link href="/dashboard/upload" prefetch>
            <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl h-12 px-6 font-black">
              <Plus className="w-4 h-4 mr-2" /> New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-200 text-sm font-bold">
          {error}
        </Card>
      )}

      {filteredHistory.length === 0 ? (
        <Card className="bg-[#111827]/40 border-white/5 rounded-3xl p-12 text-center">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-white">No analysis history found</h3>
          <p className="text-slate-400 mt-2">Upload a resume to generate your first real analysis record.</p>
        </Card>
      ) : (
        <Card className="bg-[#111827]/40 border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-slate-400">Resume</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Overall</TableHead>
                  <TableHead className="text-slate-400">ATS</TableHead>
                  <TableHead className="text-slate-400">Skill Match</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item._id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell>
                      <div className="font-bold text-white">{item.fileName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">ID {item._id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn('font-black', item.score >= 75 ? 'text-[#22C55E]' : 'text-[#F59E0B]')}>
                        {item.score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300">{item.atsCompatibility ?? 0}%</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300">{item.skillMatch ?? 0}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/analysis?id=${item._id}`} prefetch>
                          <Button className="h-9 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs">
                            View <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => void deleteHistory(item._id)}
                          disabled={deletingId === item._id}
                          className="h-9 bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs"
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-3 h-3 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
