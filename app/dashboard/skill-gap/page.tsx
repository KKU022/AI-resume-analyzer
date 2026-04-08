'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Target, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type HistoryItem = {
  _id?: string;
  skills?: { matched?: string[] };
  skillsDetected?: Array<{ name: string; level: number }>;
  missingSkills?: Array<{ name: string }>;
};

type AnalysisDetails = {
  skills?: { matched?: string[]; missing?: string[] };
  skillsDetected?: Array<{ name: string; level: number }>;
  missingSkills?: Array<{ name: string }>;
};

type SessionPayload = {
  session?: {
    analysisId?: string | null;
  } | null;
};

const ROLE_SKILL_MAP: Record<string, string[]> = {
  'Frontend Developer': ['React', 'JavaScript', 'CSS', 'HTML', 'REST API', 'Git'],
  'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'REST API', 'Docker', 'TypeScript'],
  'Backend Developer': ['Node.js', 'PostgreSQL', 'REST API', 'Docker', 'CI/CD', 'System Design'],
};

function titleFromKey(key: string) {
  return key;
}

function normalizeSkillName(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function mergeSkillsFromAnalysis(source: {
  skills?: { matched?: string[] };
  skillsDetected?: Array<{ name: string }>;
  missingSkills?: Array<{ name: string }>;
}): string[] {
  const explicit = Array.isArray(source.skills?.matched) ? source.skills?.matched || [] : [];
  const detected = Array.isArray(source.skillsDetected)
    ? source.skillsDetected.map((s) => s.name).filter(Boolean)
    : [];
  const combined = [...explicit, ...detected].map((s) => s.trim()).filter(Boolean);

  return Array.from(new Set(combined));
}

export default function SkillGapPage() {
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_SKILL_MAP>('Frontend Developer');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalysisData, setHasAnalysisData] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let collectedSkills: string[] = [];

        // Prefer active session analysis because it contains the latest, full analysis payload.
        const sessionRes = await fetch('/api/session');
        if (sessionRes.ok) {
          const sessionData = (await sessionRes.json()) as SessionPayload;
          const activeAnalysisId = sessionData.session?.analysisId;

          if (activeAnalysisId) {
            const analyzeRes = await fetch(`/api/analyze?id=${activeAnalysisId}`);
            if (analyzeRes.ok) {
              const latestAnalysis = (await analyzeRes.json()) as AnalysisDetails;
              collectedSkills = mergeSkillsFromAnalysis(latestAnalysis);
            }
          }
        }

        // Fallback to history when no active session is available.
        if (collectedSkills.length === 0) {
          const res = await fetch('/api/history');
          if (!res.ok) {
            throw new Error('Failed to load latest analysis');
          }

          const list = (await res.json()) as HistoryItem[];
          const latest = list[0];
          collectedSkills = latest ? mergeSkillsFromAnalysis(latest) : [];
        }

        setUserSkills(collectedSkills);
        setHasAnalysisData(collectedSkills.length > 0);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setHasAnalysisData(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const roleSkills = ROLE_SKILL_MAP[selectedRole];

  const normalizedUserSkills = useMemo(
    () => new Set(userSkills.map((skill) => normalizeSkillName(skill))),
    [userSkills]
  );

  const matchedSkills = useMemo(
    () => roleSkills.filter((skill) => normalizedUserSkills.has(normalizeSkillName(skill))),
    [normalizedUserSkills, roleSkills]
  );

  const missingSkills = useMemo(
    () => roleSkills.filter((skill) => !normalizedUserSkills.has(normalizeSkillName(skill))),
    [normalizedUserSkills, roleSkills]
  );

  const matchPercent = Math.round((matchedSkills.length / roleSkills.length) * 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-300 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your real skills...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-white font-space-grotesk">Skill Gap Analyzer</h1>
        <p className="text-slate-400">
          Real role comparison using extracted resume skills. No synthetic skills are added.
        </p>
      </div>

      {error && (
        <Card className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-200 text-sm font-bold">
          {error}
        </Card>
      )}

      {!error && !hasAnalysisData && (
        <Card className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-100 text-sm font-bold">
          No analysis data found yet. Upload and analyze a resume first to view your skill-gap insights.
          <div className="mt-3">
            <Link href="/dashboard/upload" className="underline underline-offset-4 text-amber-200 hover:text-amber-100">
              Go to Resume Upload
            </Link>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {(Object.keys(ROLE_SKILL_MAP) as Array<keyof typeof ROLE_SKILL_MAP>).map((role) => (
          <Button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={
              selectedRole === role
                ? 'bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-xl'
            }
          >
            {titleFromKey(role)}
          </Button>
        ))}
      </div>

      <Card className="bg-[#111827]/50 border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Role Skill Match</p>
            <h2 className="text-2xl font-black text-white">{selectedRole}</h2>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-[#22C55E]">{matchPercent}%</p>
            <p className="text-xs text-slate-400">{matchedSkills.length} / {roleSkills.length} skills matched</p>
          </div>
        </div>
        <Progress value={matchPercent} className="h-2 bg-white/10" />
        <p className="text-sm text-slate-300">
          You match {matchPercent}% of required skills for this role. Missing {missingSkills.length} key skills.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827]/40 border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4 text-[#22C55E]">
            <CheckCircle className="w-4 h-4" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Detected Skills (From Resume)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 text-xs font-bold rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">
                {skill}
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <p className="text-slate-400 text-sm">No direct matches for this role yet.</p>
            )}
          </div>
        </Card>

        <Card className="bg-[#111827]/40 border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4 text-[#F59E0B]">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Missing Skills (Not Found)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 text-xs font-bold rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B]">
                {skill}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <p className="text-slate-300 text-sm">Excellent. No major gap for this role.</p>
            )}
          </div>
        </Card>
      </div>

      {userSkills.length > 0 && (
        <Card className="bg-[#111827]/35 border-white/10 rounded-3xl p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300 mb-3">
            All Extracted Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs font-bold rounded-full bg-white/5 border border-white/10 text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card className="bg-[#0f172a]/70 border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-3 text-[#38BDF8]">
          <Target className="w-4 h-4" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Next Steps Panel</h3>
        </div>
        <ol className="list-decimal pl-5 space-y-2 text-slate-200 text-sm">
          <li>Add one project bullet proving {missingSkills[0] || 'backend/API'} usage with measurable impact.</li>
          <li>Update summary with your strongest 3 matched skills: {matchedSkills.slice(0, 3).join(', ') || 'React, JavaScript, REST API'}.</li>
          <li>Re-run analysis after resume update and track score progression.</li>
        </ol>
        <div className="mt-4">
          <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl">
            One-click Resume Fix Suggestions <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
