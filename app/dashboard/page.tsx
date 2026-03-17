'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import AnalyticsCards from '@/components/dashboard/AnalyticsCards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, Plus, Rocket, Sparkles, TrendingUp, Zap, Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ScoreHistoryChart = dynamic(
  () => import('@/components/dashboard/charts/ScoreHistoryChart'),
  {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-3xl bg-white/5" />,
  }
);

const SkillsBarChart = dynamic(
  () => import('@/components/dashboard/charts/SkillsBarChart'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse rounded-3xl bg-white/5" />,
  }
);

const COLORS = ['#6366F1', '#38BDF8', '#22C55E', '#F59E0B', '#EC4899'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    overallScore: 0,
    atsCompatibility: 0,
    skillMatch: 0,
    opportunitiesCount: 0,
    explanations: {
      overall: '',
      ats: '',
      skills: '',
      opportunities: '',
    },
  });

  const userName = session?.user?.name?.split(' ')[0] || 'Explorer';

  const latestAnalysis = analysisHistory[0] ?? null;
  const historyChartData = useMemo(
    () =>
      [...analysisHistory].reverse().map((a) => ({
        month: new Date(a.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: a.score,
        avg: 70,
      })),
    [analysisHistory]
  );

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnalysisHistory(data);
            const latest = data[0];
            const skillMatch =
              typeof latest.skillMatch === 'number'
                ? latest.skillMatch
                : Math.round((latest.jobRecommendations?.reduce((acc: number, job: any) => acc + job.match, 0) ?? 0) / (latest.jobRecommendations?.length || 1));
            setStats({
              overallScore: latest.score || 0,
              atsCompatibility: latest.atsCompatibility || 0,
              skillMatch,
              opportunitiesCount: latest.jobRecommendations?.length || 0,
              explanations: {
                overall: `Overall readiness is ${latest.score || 0}%. Focus on keyword coverage and measurable outcomes to increase interview chances.`,
                ats: `ATS fit is ${latest.atsCompatibility || 0}%. Improve by adding missing role-specific keywords naturally.`,
                skills: `Skill alignment is ${skillMatch}%. Strengthen the top 1-2 missing skills for better role fit.`,
                opportunities: `${latest.jobRecommendations?.length || 0} strong role matches are available with your current profile.`,
              },
            });
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin" />
        <p className="text-slate-400 font-medium font-space-grotesk tracking-widest uppercase text-xs">Synchronizing Neural Data...</p>
      </div>
    );
  }

  if (analysisHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="w-24 h-24 rounded-[32px] bg-[#6366F1]/10 flex items-center justify-center border border-[#6366F1]/20">
            <Zap className="w-10 h-10 text-[#6366F1]" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[#6366F1] blur-3xl rounded-full"
          />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-black font-space-grotesk text-white tracking-tight">Initialize Your Profile</h1>
          <p className="text-slate-500 font-medium">Your neural dashboard is ready. Upload your resume or try the instant demo.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard/upload">
            <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-2xl h-14 px-10 text-sm font-black shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95 glow-button">
              Analyze Resume Now <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard/analysis?demo=true">
            <Button variant="outline" className="border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10 rounded-2xl h-14 px-10 text-sm font-black transition-all hover:scale-105">
              <Play className="w-4 h-4 mr-2 fill-current" /> Try Demo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[#38BDF8] text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Zap className="w-3 h-3 fill-current" />
            System Operational
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-space-grotesk text-white tracking-tighter">
            Welcome back, <span className="text-gradient">{userName}</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Your profile intelligence is active. {analysisHistory.length} analyses completed.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-2xl h-14 px-8 text-sm font-black shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95 glow-button group">
            <Plus className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90" /> Analyze New Resume
          </Button>
        </Link>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div variants={itemVariants}>
        <AnalyticsCards data={stats} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score History Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl overflow-hidden relative rounded-[40px] p-2 h-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            <CardHeader className="pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <CardTitle className="text-2xl font-black text-white font-space-grotesk tracking-tight">Intelligence Velocity</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Neural matching score progression vs market average</CardDescription>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#6366F1]/10 rounded-lg text-[9px] text-[#6366F1] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" /> Industry
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#22C55E]/10 rounded-lg text-[9px] text-[#22C55E] font-black uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Personal
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 px-0">
              <ScoreHistoryChart data={historyChartData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Matches Widget */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl h-full flex flex-col rounded-[40px] p-2 group transition-all duration-500 hover:border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#38BDF8]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <CardHeader className="pb-6">
               <CardTitle className="text-xl font-black text-white font-space-grotesk tracking-tight flex items-center justify-between">
                 Role Alignment
                 <Sparkles className="w-5 h-5 text-[#38BDF8] animate-pulse" />
               </CardTitle>
               <CardDescription className="text-slate-500 font-medium">Neural matches for your current profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 relative z-10">
               {latestAnalysis.jobRecommendations.slice(0, 3).map((job: any, i: number) => (
                 <motion.div 
                  key={i} 
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex flex-col gap-3 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-[#38BDF8]/30 transition-all cursor-pointer group/item"
                 >
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] text-[#38BDF8] font-black uppercase tracking-[0.2em]">{job.company}</div>
                       <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#22C55E]/10 text-[9px] text-[#22C55E] font-black border border-[#22C55E]/20">
                          <Rocket className="w-3 h-3" /> {job.match}% MATCH
                       </div>
                    </div>
                    <div className="text-md font-bold text-white group-hover/item:text-[#6366F1] transition-colors">{job.title}</div>
                    <div className="flex items-center justify-between">
                       <div className="text-[10px] text-slate-500 font-mono">{job.salary}</div>
                       <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover/item:text-white transition-colors" />
                    </div>
                 </motion.div>
               ))}
               <div className="pt-4">
                  <Link href="/dashboard/history" className="block">
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest rounded-2xl h-12 border border-white/5 transition-all">
                       Explore Full History
                    </Button>
                  </Link>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Skills Breakdown */}
         <motion.div variants={itemVariants}>
          <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl overflow-hidden relative rounded-[40px] p-2 hover:border-white/10 transition-all duration-500">
              <CardHeader className="pb-8">
                 <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                    <CardTitle className="text-xl font-black text-white font-space-grotesk tracking-tight">Dynamic Profile Mapping</CardTitle>
                 </div>
                 <CardDescription className="text-slate-500 font-medium">Core proficiency levels detected by AI neural scan</CardDescription>
              </CardHeader>
                <CardContent className="relative z-20">
                 <SkillsBarChart data={latestAnalysis.skillsDetected} colors={COLORS} />
                </CardContent>
          </Card>
         </motion.div>

         {/* Skill Gap Alert */}
         <motion.div variants={itemVariants}>
          <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl h-full flex flex-col rounded-[40px] p-2 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F59E0B] to-transparent" />
              <CardHeader className="pb-6">
                 <CardTitle className="text-xl font-black text-white font-space-grotesk tracking-tight flex items-center justify-between">
                    Career Readiness Gaps
                    <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase tracking-widest border border-orange-500/20">Critical Alert</div>
                 </CardTitle>
                 <CardDescription className="text-slate-500 font-medium">Missing credentials detected for target senior roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                 {latestAnalysis.missingSkills.slice(0, 3).map((skill: any, i: number) => (
                   <motion.div 
                    key={i} 
                    whileHover={{ x: 5, backgroundColor: 'rgba(245,158,11,0.05)' }}
                    className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer group/item"
                   >
                      <div className="space-y-1.5">
                         <div className="text-md font-bold text-white group-hover/item:text-[#F59E0B] transition-colors">{skill.name}</div>
                         <div className="flex items-center gap-2">
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Suggested:</div>
                            <div className="text-[10px] text-[#38BDF8] font-black underline underline-offset-4 decoration-[#38BDF8]/30 hover:decoration-[#38BDF8] transition-all">{skill.resources?.[0]}</div>
                         </div>
                      </div>
                      <div className={cn(
                        "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm",
                        skill.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      )}>
                         {skill.priority} Priority
                      </div>
                   </motion.div>
                 ))}
                 <div className="pt-4">
                    <Link href="/dashboard/skill-gap" className="block">
                      <Button className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:scale-[1.02] text-white shadow-[0_10px_20px_rgba(245,158,11,0.2)] rounded-2xl h-14 text-sm font-black transition-all active:scale-95">
                         Build Personalized Career Roadmap
                      </Button>
                    </Link>
                 </div>
              </CardContent>
          </Card>
         </motion.div>
      </div>
    </motion.div>
  );
}


