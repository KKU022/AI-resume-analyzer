'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockAnalysisData } from '@/data/mock-analysis-data';
import NextStepsPanel from '@/components/dashboard/NextStepsPanel';
import { 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Loader2, 
  Zap, 
  BrainCircuit,
  ArrowRight,
  BriefcaseBusiness,
  Map,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

interface AnalysisData {
  _id?: string;
  score: number;
  atsScore?: number;
  skillMatch?: number;
  experienceStrength?: number;
  atsCompatibility: number;
  analysis?: {
    atsScore?: number;
    skillMatch?: number;
    experienceStrength?: number;
    improvements?: string[];
    problems?: string[];
    recommendedRoles?: string[];
    provider?: string;
  };
  ats?: {
    score: number;
    explanation: string;
    improvements: string[];
  };
  skills?: {
    matched: string[];
    missing: string[];
    inferred: string[];
  };
  extracted?: {
    skills: string[];
    experienceLines: string[];
    projectLines: string[];
    educationLines: string[];
  };
  insights?: string[];
  nextSteps?: string[];
  problems?: string[];
  improvements?: string[];
  opportunities?: string[];
  careerPaths?: string[];
  skillsDetected: { name: string; level: number }[];
  missingSkills: { name: string; priority: string; resources: string[] }[];
  suggestions: { original: string; improved: string }[];
  jobRecommendations: { title: string; company: string; match: number; salary: string; skills: string[] }[];
  careerRoadmap: { step: string; description: string; duration: string }[];
  interviewQuestions: { question: string; category: string; target: string }[];
  fileName?: string;
  createdAt?: string;
}

type ResumeFixItem = {
  _id: string;
  version: number;
  originalBullet: string;
  improvedBullet: string;
  appliedAt: string;
};

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('id');
  const isDemo = searchParams.get('demo') === 'true';
  const [resolvedAnalysisId, setResolvedAnalysisId] = useState<string | null>(analysisId);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [explainText, setExplainText] = useState<string | null>(null);
  const [fixHistory, setFixHistory] = useState<ResumeFixItem[]>([]);
  const [applyingFixIndex, setApplyingFixIndex] = useState<number | null>(null);
  const [fixError, setFixError] = useState<string | null>(null);
  const [showFixSuggestions, setShowFixSuggestions] = useState(false);

  const loadMockData = () => {
    setData({
      score: mockAnalysisData.score,
      skillMatch: mockAnalysisData.skillMatch,
      experienceStrength: mockAnalysisData.experienceStrength,
      atsCompatibility: mockAnalysisData.atsCompatibility,
      ats: mockAnalysisData.ats,
      skills: mockAnalysisData.skills,
      extracted: mockAnalysisData.extracted,
      insights: mockAnalysisData.insights,
      nextSteps: mockAnalysisData.nextSteps,
      problems: mockAnalysisData.problems,
      improvements: mockAnalysisData.improvements,
      opportunities: mockAnalysisData.opportunities,
      careerPaths: mockAnalysisData.careerPaths,
      skillsDetected: mockAnalysisData.skillsDetected,
      missingSkills: mockAnalysisData.missingSkills,
      suggestions: mockAnalysisData.suggestions,
      jobRecommendations: mockAnalysisData.jobRecommendations,
      careerRoadmap: mockAnalysisData.careerRoadmap,
      interviewQuestions: mockAnalysisData.interviewQuestions,
      fileName: isDemo ? 'demo_resume.pdf' : 'resume_final.pdf',
    });
    setLoading(false);
  };

  useEffect(() => {
    // Demo mode — load mock data instantly without network call
    if (isDemo) {
      loadMockData();
      return;
    }

    async function fetchAnalysis() {
      try {
        let effectiveId = analysisId;

        if (!effectiveId) {
          const sessionRes = await fetch('/api/session');
          if (sessionRes.ok) {
            const payload = (await sessionRes.json()) as {
              session?: { analysisId?: string | null } | null;
            };
            effectiveId = payload.session?.analysisId || null;
            setResolvedAnalysisId(effectiveId);
          }
        } else {
          setResolvedAnalysisId(effectiveId);
        }

        if (!effectiveId) {
          setData(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/analyze?id=${effectiveId}`);
        const resClone = res.clone();
        if (res.ok) {
          try {
            const found = (await res.json()) as AnalysisData;
            const normalizedAts =
              typeof found.atsCompatibility === 'number'
                ? found.atsCompatibility
                : found.analysis?.atsScore ?? found.ats?.score ?? 0;
            const normalizedSkillMatch =
              typeof found.skillMatch === 'number' ? found.skillMatch : found.analysis?.skillMatch ?? 0;
            const normalizedExperience =
              typeof found.experienceStrength === 'number'
                ? found.experienceStrength
                : found.analysis?.experienceStrength ?? 0;
            const normalizedScore =
              typeof found.score === 'number'
                ? found.score
                : Math.round(normalizedAts * 0.45 + normalizedSkillMatch * 0.35 + normalizedExperience * 0.2);

            setData({
              ...found,
              score: normalizedScore,
              atsScore: found.analysis?.atsScore ?? found.ats?.score ?? normalizedAts,
              atsCompatibility: normalizedAts,
              skillMatch: normalizedSkillMatch,
              experienceStrength: normalizedExperience,
              improvements:
                (found.improvements && found.improvements.length > 0)
                  ? found.improvements
                  : found.analysis?.improvements || [],
              problems:
                (found.problems && found.problems.length > 0)
                  ? found.problems
                  : found.analysis?.problems || [],
              opportunities:
                (found.opportunities && found.opportunities.length > 0)
                  ? found.opportunities
                  : found.analysis?.recommendedRoles || found.careerPaths || [],
            });
            setLoading(false);
            return;
          } catch (jsonErr) {
            console.error('[ANALYSIS PAGE] Failed to parse JSON response:', jsonErr);
            try {
              const text = await resClone.text();
              console.error('[ANALYSIS PAGE] Response was:', text.substring(0, 200));
            } catch {
              console.error('[ANALYSIS PAGE] Could not read response');
            }
          }
        } else {
          console.error('[ANALYSIS PAGE] API returned error status:', res.status);
          try {
            const text = await resClone.text();
            console.error('[ANALYSIS PAGE] Error response:', text.substring(0, 200));
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        console.error('[ANALYSIS PAGE] Failed to fetch analysis:', err);
      }
      setData(null);
      setLoading(false);
    }
    fetchAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, isDemo]);

  useEffect(() => {
    if (!resolvedAnalysisId || isDemo) {
      setFixHistory([]);
      return;
    }

    const currentAnalysisId = resolvedAnalysisId;

    async function fetchFixHistory() {
      try {
        const res = await fetch(`/api/resume-fixes?analysisId=${encodeURIComponent(currentAnalysisId)}`);
        if (!res.ok) {
          return;
        }
        const payload = (await res.json()) as { fixes?: ResumeFixItem[] };
        setFixHistory(Array.isArray(payload.fixes) ? payload.fixes : []);
      } catch {
        setFixHistory([]);
      }
    }

    void fetchFixHistory();
  }, [resolvedAnalysisId, isDemo]);

  const exportReportPdf = async () => {
    if (!data) {
      return;
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const lines = [
      `Resume Report: ${data.fileName || 'Resume'}`,
      `Overall score: ${data.score}%`,
      `ATS compatibility: ${data.atsCompatibility}%`,
      '',
      'Top improvements:',
      ...(data.improvements || data.ats?.improvements || []).slice(0, 6).map((item) => `- ${item}`),
      '',
      'Next steps:',
      ...(data.nextSteps || []).slice(0, 6).map((item) => `- ${item}`),
    ];

    let y = 20;
    doc.setFontSize(12);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save(`medha-report-${Date.now()}.pdf`);
  };

  const applyFix = async (original: string, improved: string, index: number) => {
    if (!analysisId || isDemo) {
      return;
    }

    setApplyingFixIndex(index);
    setFixError(null);

    try {
      const res = await fetch('/api/resume-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          originalBullet: original,
          improvedBullet: improved,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to apply resume fix');
      }

      const payload = (await res.json()) as { fix?: ResumeFixItem };
      if (payload.fix) {
        setFixHistory((prev) => [payload.fix as ResumeFixItem, ...prev]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not apply fix';
      setFixError(message);
    } finally {
      setApplyingFixIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border-t-2 border-b-2 border-[#6366F1] flex items-center justify-center"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-[#6366F1] animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white font-space-grotesk tracking-tight">Deciphering Your Profile</h2>
          <p className="text-slate-500 font-medium">Running neural matching algorithms...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="bg-[#111827]/50 border-white/10 rounded-3xl p-10 max-w-xl text-center">
          <h3 className="text-xl font-black text-white">No analysis found</h3>
          <p className="text-slate-400 mt-2">Upload and analyze a resume first to view real insights.</p>
          <div className="mt-6">
            <Link href="/dashboard/upload" prefetch>
              <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white">Go to Upload</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const scoreLabel = data.score >= 90 ? 'Elite' : data.score >= 80 ? 'Superior' : data.score >= 70 ? 'Optimal' : 'Standard';
  const scoreColor = data.score >= 70 ? '#22C55E' : data.score >= 40 ? '#F59E0B' : '#EF4444';
  const atsScoreValue = data.atsScore ?? data.ats?.score ?? data.atsCompatibility ?? 0;
  const skillMatchValue = data.skillMatch ?? 0;
  const experienceStrengthValue = data.experienceStrength ?? 0;

  const gaugeData = [
    { value: data.score },
    { value: 100 - data.score }
  ];

  const skillData = data.skillsDetected.slice(0, 6).map(s => ({
    subject: s.name,
    A: s.level,
    fullMark: 100,
  }));

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#1B253B]/50 backdrop-blur-2xl border border-white/10 p-10 rounded-[50px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent opacity-30" />
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-20 h-20 rounded-[30px] bg-gradient-to-br from-[#6366F1] to-[#38BDF8] flex items-center justify-center shadow-[0_20px_40px_rgba(99,102,241,0.4)]">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-5xl font-black font-space-grotesk text-white tracking-tighter">Career <span className="text-[#6366F1]">Intelligence</span></h1>
              <div className="px-4 py-1.5 bg-[#6366F1]/10 rounded-full border border-[#6366F1]/20">
                <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.3em]">Neural Report V2.0</span>
              </div>
            </div>
            <p className="text-slate-500 font-medium tracking-tight">
               Analyzed <span className="text-white font-bold">{data.fileName || 'profile.data'}</span> • {data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Live Stream'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <Button
            variant="outline"
            onClick={() => void exportReportPdf()}
            className="h-14 px-8 rounded-2xl border-white/5 bg-white/5 text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
          >
            <Download className="w-4 h-4 mr-3" /> Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => setExplainText(data.ats?.explanation || 'This score reflects keyword coverage, role match, and evidence quality in your resume.')}
            className="h-14 px-8 rounded-2xl border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-all font-black uppercase tracking-widest text-[10px]"
          >
            Explain This
          </Button>
          <Link href="/dashboard/upload">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setShowFixSuggestions(true);
              }}
              className="h-14 px-8 rounded-2xl bg-[#22C55E] hover:bg-[#16a34a] text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl"
            >
              Fix Resume
            </Button>
          </Link>
          <Link href="/dashboard/upload">
            <Button className="h-14 px-10 rounded-2xl bg-[#6366F1] text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl">
              <RefreshCw className="w-4 h-4 mr-3" /> New Sequence
            </Button>
          </Link>
        </div>
      </div>

      {explainText && (
        <Card className="bg-[#0f172a]/70 border border-[#38BDF8]/30 rounded-[32px] p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#38BDF8] mb-2">AI Explanation</p>
              <p className="text-slate-200 text-sm leading-relaxed">{explainText}</p>
            </div>
            <Button variant="ghost" onClick={() => setExplainText(null)} className="text-slate-400 hover:text-white">Close</Button>
          </div>
        </Card>
      )}

      {fixError && (
        <Card className="bg-red-500/10 border border-red-500/30 rounded-[24px] p-4">
          <p className="text-red-200 text-sm font-bold">{fixError}</p>
        </Card>
      )}

      {showFixSuggestions && (
        <Card className="bg-[#0f172a]/90 border border-[#22C55E]/25 rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xl font-black text-white">Quick Resume Fix Suggestions</h3>
            <Button variant="ghost" onClick={() => setShowFixSuggestions(false)} className="text-slate-400 hover:text-white">Close</Button>
          </div>
          <ul className="space-y-2 text-sm text-slate-200 list-disc pl-5">
            {(data.suggestions || []).slice(0, 5).map((item) => (
              <li key={`${item.original}-${item.improved}`}>{item.improved}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'ATS Score',
            value: atsScoreValue,
            description: data.ats?.explanation || `Your resume passes about ${atsScoreValue}% of ATS filters.`,
            hint: 'Add role keywords to improve visibility.',
          },
          {
            title: 'Skill Match',
            value: skillMatchValue,
            description: `Strong profile areas: ${(data.skills?.matched || data.skillsDetected.map((s) => s.name)).slice(0, 3).join(', ') || 'Not enough evidence yet'}.`,
            hint: 'Close top missing skills for better role fit.',
          },
          {
            title: 'Experience Strength',
            value: experienceStrengthValue,
            description: 'Measures action verbs + quantified impact in projects and experience bullets.',
            hint: 'Add metrics like % improvement, users impacted, or time saved.',
          },
        ].map((item) => (
          <Card key={item.title} className="bg-[#111827]/60 border-white/10 rounded-[32px] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black" title={item.description}>{item.title}</p>
                <p className="text-2xl font-black text-white">{item.value}%</p>
              </div>
              <Progress value={item.value} className="h-2 bg-white/10" />
              <p className="text-sm text-slate-300">{item.description}</p>
              <p className="text-xs text-[#38BDF8]">{item.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-red-500/10 border-red-500/25 rounded-[32px] p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-300 mb-3">Problems</h3>
          <ul className="space-y-2 text-sm text-red-100 list-disc pl-5">
            {(data.problems || []).map((problem, idx) => <li key={idx}>{problem}</li>)}
          </ul>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/25 rounded-[32px] p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-200 mb-3">Improvements</h3>
          <ul className="space-y-2 text-sm text-yellow-100 list-disc pl-5">
            {(data.improvements || data.ats?.improvements || []).map((improvement, idx) => <li key={idx}>{improvement}</li>)}
          </ul>
        </Card>
        <Card className="bg-green-500/10 border-green-500/25 rounded-[32px] p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-green-200 mb-3">Opportunities</h3>
          <ul className="space-y-2 text-sm text-green-100 list-disc pl-5">
            {(data.opportunities || data.careerPaths || []).map((opportunity, idx) => <li key={idx}>{opportunity}</li>)}
          </ul>
        </Card>
      </div>

      <Card className="bg-[#0f172a]/70 border-white/10 rounded-[36px] p-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-black text-white">Next Steps</h3>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Career Coach Mode</span>
        </div>
        <ol className="space-y-3 text-slate-200 list-decimal pl-5">
          {(data.nextSteps || []).map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card className="bg-[#111827]/50 border-white/10 rounded-[36px] p-8">
        <h3 className="text-xl font-black text-white mb-4">Detected vs Suggested Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#22C55E] mb-3">Detected Skills (Found in Resume)</p>
            <div className="flex flex-wrap gap-2">
              {(data.skills?.matched || data.skillsDetected.map((s) => s.name)).map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#F59E0B] mb-3">Suggested Skills (Not Found)</p>
            <div className="flex flex-wrap gap-2">
              {(data.skills?.missing || data.missingSkills.map((s) => s.name)).map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
         {/* Neural Score Hexagon */}
         <Card className="lg:col-span-12 xl:col-span-4 min-w-0 bg-[#111827]/60 border-white/10 backdrop-blur-3xl rounded-[60px] p-10 flex flex-col items-center justify-between relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-full bg-[#6366F1]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="text-center space-y-2 relative z-10 w-full">
              <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-[0.4em]">Proprietary Quality Index</span>
              <div className="h-[300px] min-h-[300px] min-w-0 w-full relative flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={gaugeData}
                       cx="50%"
                       cy="50%"
                       innerRadius={110}
                       outerRadius={140}
                       startAngle={180}
                       endAngle={0}
                       paddingAngle={0}
                       dataKey="value"
                       stroke="none"
                     >
                        <Cell fill={scoreColor} fillOpacity={0.8} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-x-0 bottom-24 flex flex-col items-center">
                    <motion.span 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-8xl font-black text-white font-space-grotesk tracking-tighter"
                    >
                      {data.score}
                    </motion.span>
                    <span className="text-sm font-black text-[#6366F1] uppercase tracking-[0.5em]">{scoreLabel}</span>
                 </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 relative z-10 pt-8">
               <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">ATS Velocity</span>
                  <div className="text-4xl font-black text-[#22C55E] font-space-grotesk">{atsScoreValue}%</div>
               </div>
               <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Skill Density</span>
                  <div className="text-4xl font-black text-[#38BDF8] font-space-grotesk">{data.skillsDetected.length}</div>
               </div>
            </div>
         </Card>

         {/* Radar Visualization */}
         <Card className="lg:col-span-12 xl:col-span-8 min-w-0 bg-[#111827]/60 border-white/10 backdrop-blur-3xl rounded-[60px] p-10 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center gap-6 mb-12">
               <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20">
                  <BrainCircuit className="w-7 h-7 text-[#6366F1]" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white font-space-grotesk tracking-tight">Neural Competency Graph</h3>
                  <p className="text-slate-500 font-medium">Multi-axial skill distribution profile</p>
               </div>
            </div>
            
            <div className="flex-1 min-h-[400px] min-w-0">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fill="#6366F1"
                      fillOpacity={0.1}
                      animationDuration={2000}
                    />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Resume Improvement Panel */}
         <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl rounded-[48px] p-10 space-y-8">
            <div className="flex items-center gap-4">
               <Zap className="w-6 h-6 text-[#F59E0B]" />
               <h3 className="text-2xl font-black text-white font-space-grotesk">Neural Rewrites</h3>
            </div>
            <div className="space-y-6">
               {(data.suggestions || []).map((s, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5 group hover:border-[#6366F1]/30 transition-all"
                 >
                    <div className="space-y-4">
                       <p className="text-xs text-slate-500 italic">"{s.original}"</p>
                       <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-700" /></div>
                       <p className="text-sm text-white font-bold">"{s.improved}"</p>
                       {!isDemo && analysisId && (
                         <Button
                           onClick={() => void applyFix(s.original, s.improved, i)}
                           disabled={applyingFixIndex === i}
                           className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-white rounded-xl"
                         >
                           {applyingFixIndex === i ? (
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           ) : (
                             <Sparkles className="w-4 h-4 mr-2" />
                           )}
                           One-Click Apply Fix
                         </Button>
                       )}
                    </div>
                 </motion.div>
               ))}
            </div>
         </Card>

        {/* Role Intelligence Panel */}
         <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl rounded-[48px] p-10 space-y-8">
            <div className="flex items-center gap-4">
            <BriefcaseBusiness className="w-6 h-6 text-[#22C55E]" />
            <h3 className="text-2xl font-black text-white font-space-grotesk">Role Intelligence</h3>
            </div>
            <div className="space-y-6">
               {(data.jobRecommendations || []).map((job, i) => (
                 <div key={i} className="flex items-center justify-between p-6 rounded-[32px] bg-white/[0.03] border border-white/5">
                    <div>
                       <p className="text-white font-black">{job.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Why it fits: strong overlap with your detected stack</p>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-black text-[#22C55E]">{job.match}%</div>
                  <div className="text-[10px] text-slate-600 font-black tracking-widest uppercase">ROLE FIT</div>
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Career Roadmap Panel */}
         <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl rounded-[48px] p-10 space-y-8">
            <div className="flex items-center gap-4">
               <Map className="w-6 h-6 text-[#38BDF8]" />
               <h3 className="text-2xl font-black text-white font-space-grotesk">Career Roadmap</h3>
            </div>
            <div className="space-y-8 pl-4 relative">
               <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#38BDF8] to-transparent opacity-20" />
               {(data.careerRoadmap || []).map((step, i) => (
                 <div key={i} className="relative pl-10">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                    <div>
                       <p className="text-white font-black text-md">{step.step}</p>
                       <p className="text-sm text-slate-500 font-medium mb-1">{step.description}</p>
                       <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest">{step.duration}</span>
                    </div>
                 </div>
               ))}
            </div>
         </Card>

         {/* AI Interview Prep Panel */}
         <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl rounded-[48px] p-10 space-y-8">
            <div className="flex items-center gap-4">
               <MessageSquare className="w-6 h-6 text-purple-400" />
               <h3 className="text-2xl font-black text-white font-space-grotesk">Neural Interview Prep</h3>
            </div>
            <div className="space-y-4">
               {(data.interviewQuestions || []).map((q, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-white/[0.03] border border-white/5">
                    <div className="flex items-start gap-4">
                       <div className="px-2 py-1 bg-purple-500/20 rounded text-[8px] font-black text-purple-400 uppercase tracking-widest shrink-0 mt-1">{q.category}</div>
                       <p className="text-sm text-white font-bold leading-relaxed">{q.question}</p>
                    </div>
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl rounded-[48px] p-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-white font-space-grotesk">Fix Version History</h3>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Persistent Timeline</span>
        </div>
        {fixHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No fixes applied yet. Use One-Click Apply Fix to save improved bullet versions.</p>
        ) : (
          <div className="space-y-4">
            {fixHistory.slice(0, 8).map((fix) => (
              <div key={fix._id} className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#38BDF8]">Version {fix.version}</p>
                  <p className="text-[11px] text-slate-500">{new Date(fix.appliedAt).toLocaleString()}</p>
                </div>
                <p className="text-xs text-slate-500 italic">"{fix.originalBullet}"</p>
                <div className="flex justify-center my-2"><ArrowRight className="w-4 h-4 text-slate-700" /></div>
                <p className="text-sm text-white font-bold">"{fix.improvedBullet}"</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Velocity Blockers Panel */}
      <Card className="bg-gradient-to-br from-red-500/10 via-transparent to-transparent border border-red-500/20 p-12 rounded-[60px] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <AlertCircle className="w-32 h-32 text-red-500" />
         </div>
         <div className="relative z-10 space-y-8">
            <div className="space-y-4">
               <h3 className="text-4xl font-black text-white font-space-grotesk tracking-tighter">Velocity <span className="text-red-500">Blockers</span></h3>
               <p className="text-slate-500 max-w-2xl font-medium">Our neural system identified {data.missingSkills.length} critical gaps preventing you from accessing high-tier roles.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {(data.missingSkills || []).map((s, i) => (
                 <div key={i} className="p-8 rounded-[40px] bg-black/40 border border-white/5 backdrop-blur-xl space-y-4 hover:border-red-500/30 transition-all">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{s.priority} PROPELLANT</span>
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <p className="text-xl font-black text-white font-space-grotesk">{s.name}</p>
                    <div className="flex flex-wrap gap-2">
                       {s.resources.slice(0, 2).map((r, ri) => (
                         <span key={ri} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-medium text-slate-400">{r}</span>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </Card>

      <NextStepsPanel
        score={data.score || 0}
        atsScore={atsScoreValue}
        skillsDetected={(data.skills?.matched || data.skillsDetected.map((s) => s.name)) || []}
        missingSkills={(data.skills?.missing || data.missingSkills.map((s) => s.name)) || []}
        jobMatches={data.jobRecommendations || []}
      />
    </div>
  );
}

