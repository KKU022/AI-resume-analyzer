import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Compass, Sparkles, ArrowRight } from 'lucide-react';

const resumeTips = [
  'Lead each bullet with action + measurable result.',
  'Keep top-third of your resume role-specific and keyword-aligned.',
  'Replace generic claims with real scope: users, revenue, latency, or time saved.',
  'Limit stack dumps. Show where each skill created impact.',
];

const skillRoadmap = [
  {
    step: 'Week 1',
    title: 'Close one critical missing skill',
    detail: 'Build one mini project proving that skill with one measurable outcome.',
  },
  {
    step: 'Week 2',
    title: 'Strengthen role language',
    detail: 'Rewrite summary and project bullets using terms from your target job descriptions.',
  },
  {
    step: 'Week 3',
    title: 'Interview-ready proof',
    detail: 'Prepare two stories: one technical deep-dive and one delivery-impact case.',
  },
];

const careerGuidance = [
  'Apply in focused batches of 10-15 roles with one tailored resume version.',
  'Track response rate weekly and adjust only one variable at a time.',
  'Ask for referrals only after sharing a clear project impact summary.',
  'Run one mock interview before every new application round.',
];

export default function LearningHubPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#38BDF8] font-black">Learning and Improvement Hub</p>
        <h1 className="text-3xl font-black text-white font-space-grotesk tracking-tight mt-2">Build a stronger resume, one practical step at a time</h1>
        <p className="text-slate-400 mt-2">
          No filler content. Just concrete actions you can apply today.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-[#111827]/50 border-white/10 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#38BDF8]" /> Resume Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {resumeTips.map((tip) => (
              <p key={tip} className="text-sm text-slate-300">- {tip}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#111827]/50 border-white/10 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Target className="w-5 h-5 text-[#22C55E]" /> Skill Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillRoadmap.map((item) => (
              <div key={item.step} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#22C55E] font-black">{item.step}</p>
                <p className="text-sm text-white font-bold">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#111827]/50 border-white/10 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Compass className="w-5 h-5 text-[#F59E0B]" /> Career Guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {careerGuidance.map((item) => (
              <p key={item} className="text-sm text-slate-300">- {item}</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-[#6366F1]/15 to-transparent border-white/10 rounded-3xl">
        <CardContent className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#38BDF8] font-black mb-2">Your next move</p>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#38BDF8]" /> Use your latest analysis to prioritize improvements
            </h2>
            <p className="text-sm text-slate-300 mt-1">Open your analysis report and apply top fixes first.</p>
          </div>
          <Link href="/dashboard/analysis">
            <Button className="bg-white text-[#0B1120] hover:bg-slate-200 font-bold">
              Open Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
