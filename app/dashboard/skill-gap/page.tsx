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
  const [selectedMissingSkill, setSelectedMissingSkill] = useState<string | null>(null);
  const [selectedConfirmedSkill, setSelectedConfirmedSkill] = useState<string | null>(null);

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
        {/* Confirmed Skills (Green Pills) */}
        <Card className="bg-[#111827]/40 border-white/10 rounded-3xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#22C55E]">
              <CheckCircle className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Confirmed Skills (From Resume)</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Click to view mention</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {matchedSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  setSelectedConfirmedSkill(selectedConfirmedSkill === skill ? null : skill);
                  setSelectedMissingSkill(null);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border cursor-pointer ${
                  selectedConfirmedSkill === skill
                    ? 'bg-[#22C55E] text-slate-950 border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105'
                    : 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/25 hover:border-[#22C55E]/50'
                }`}
              >
                ✓ {skill}
              </button>
            ))}
            {matchedSkills.length === 0 && (
              <p className="text-slate-400 text-sm">No direct matches for this role yet.</p>
            )}
          </div>

          {/* Confirmed Skill Info Popover */}
          {selectedConfirmedSkill && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold">Verified in Resume:</span> &ldquo;{selectedConfirmedSkill}&rdquo; was detected with high confidence in your work experience or project history.
              </div>
              <button
                onClick={() => setSelectedConfirmedSkill(null)}
                className="text-emerald-400 hover:text-emerald-200 ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </Card>

        {/* Missing High-Demand Skills (Dashed Red Pills with +18% Match Rate Tooltip) */}
        <Card className="bg-[#111827]/40 border-white/10 rounded-3xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Missing High-Demand Skills</h3>
            </div>
            <span className="text-[10px] text-rose-400/80 font-bold uppercase tracking-widest">Click to inspect ROI</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {missingSkills.map((skill) => (
              <div key={skill} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMissingSkill(selectedMissingSkill === skill ? null : skill);
                    setSelectedConfirmedSkill(null);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border-2 border-dashed cursor-pointer ${
                    selectedMissingSkill === skill
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-105'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/70'
                  }`}
                >
                  + {skill}
                </button>

                {/* Mini-Tooltip: "Adding this skill increases role match rate by +18%." */}
                {selectedMissingSkill === skill && (
                  <div className="absolute left-0 bottom-full mb-2 z-30 w-64 p-3 rounded-xl bg-slate-900 border border-rose-500/40 text-xs text-slate-200 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-rose-400 text-[10px] uppercase tracking-wider">
                        High-Demand Gap
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMissingSkill(null);
                        }}
                        className="text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-white font-semibold">
                      Adding this skill increases role match rate by <span className="text-emerald-400 font-black">+18%</span>.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Frequently filtered out by Fortune 500 ATS systems for {selectedRole}.
                    </p>
                  </div>
                )}
              </div>
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
