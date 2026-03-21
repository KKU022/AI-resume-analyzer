'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Radar, Shield, Sparkles, WandSparkles, Copy, Check, Eye } from 'lucide-react';

type SkillItem = {
  name?: string;
  level?: number;
};

type MissingSkillItem = {
  name?: string;
  priority?: string;
};

type JobItem = {
  title?: string;
  match?: number;
};

type AnalysisLike = {
  score?: number;
  atsCompatibility?: number;
  skillsDetected?: SkillItem[];
  missingSkills?: MissingSkillItem[];
  jobRecommendations?: JobItem[];
};

type Props = {
  analysis: AnalysisLike;
};

export default function SignalVault({ analysis }: Props) {
  const [revealIndex, setRevealIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const topSkills = (analysis.skillsDetected || [])
    .slice()
    .sort((a, b) => (b.level || 0) - (a.level || 0))
    .slice(0, 2)
    .map((item) => item.name)
    .filter((value): value is string => Boolean(value));

  const topGap = (analysis.missingSkills || []).find((item) => Boolean(item?.name))?.name || 'role-specific domain depth';
  const bestRole = (analysis.jobRecommendations || [])[0]?.title || 'your next target role';
  const bestMatch = (analysis.jobRecommendations || [])[0]?.match || 0;

  const vaultLines = useMemo(
    () => [
      `Strength Signature: ${topSkills.length > 0 ? topSkills.join(' + ') : 'Execution + Adaptability'}`,
      `Blind Spot Trigger: ${topGap}`,
      `Opportunity Window: ${bestRole} at ${bestMatch}% profile fit`,
      `Risk Filter: ATS ${analysis.atsCompatibility || 0}% -> raise by embedding 3 missing keywords in project bullets`,
      `Momentum Path: Move score from ${analysis.score || 0}% to ${(analysis.score || 0) + 8}% with one focused 7-day sprint`,
    ],
    [analysis.atsCompatibility, analysis.score, bestMatch, bestRole, topGap, topSkills]
  );

  const missions = useMemo(
    () => [
      `Rewrite one bullet using this formula: action + scope + metric + stack. Prioritize ${topGap}.`,
      `Tailor your resume summary to ${bestRole} and include ${topSkills[0] || 'your strongest technical skill'}.`,
      `Create one proof project in ${topGap} and add a measurable result line today.`,
      `Run one mock interview answer around ${topSkills[1] || 'system thinking'} with a real tradeoff example.`,
    ],
    [bestRole, topGap, topSkills]
  );

  const activeLine = vaultLines[revealIndex % vaultLines.length];
  const activeMission = missions[revealIndex % missions.length];

  const copyMission = async () => {
    try {
      await navigator.clipboard.writeText(activeMission);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-[#0f172a]/65 border-slate-200/80 dark:border-white/10 rounded-[40px] overflow-hidden relative group">
      <div className="absolute -top-24 -right-12 w-72 h-72 bg-[#38BDF8]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-[#6366F1]/20 blur-[120px] rounded-full pointer-events-none" />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-black uppercase tracking-[0.2em]">
              <Lock className="w-3 h-3" /> Signal Vault
            </div>
            <CardTitle className="text-slate-900 dark:text-white text-2xl font-black mt-4 font-space-grotesk tracking-tight">
              Mystery Mode: Hidden Career Signals
            </CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-300 mt-2 max-w-2xl">
              Reveal one encrypted insight at a time, then execute a mission built from your latest resume intelligence.
            </CardDescription>
          </div>
          <Sparkles className="w-6 h-6 text-[#22C55E] animate-pulse mt-2" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        <motion.div
          key={activeLine}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400 mb-2">Decrypted Insight</p>
          <p className="text-slate-900 dark:text-white text-lg font-bold leading-relaxed">{activeLine}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-black uppercase tracking-widest"><Radar className="w-3.5 h-3.5" /> Signal</div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mt-2">Best-fit role and score trajectory.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-black uppercase tracking-widest"><Shield className="w-3.5 h-3.5" /> Risk</div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mt-2">The one gap blocking higher shortlist rates.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[#22C55E] text-xs font-black uppercase tracking-widest"><WandSparkles className="w-3.5 h-3.5" /> Move</div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mt-2">A practical mission you can finish today.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#6366F1]/30 bg-[#6366F1]/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C7D2FE] font-black">Today\'s Mission</p>
            <p className="text-slate-900 dark:text-white text-sm md:text-base font-bold mt-2">{activeMission}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setRevealIndex((prev) => prev + 1)}
              className="border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" /> Reveal Next
            </Button>
            <Button
              onClick={() => void copyMission()}
              className="bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-xl"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy Mission'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
