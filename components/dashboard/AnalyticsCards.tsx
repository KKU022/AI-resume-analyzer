'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, BrainCircuit, Sparkles } from 'lucide-react';

interface AnalyticsCardsProps {
  data?: {
    overallScore: number;
    atsCompatibility: number;
    skillMatch: number;
    opportunitiesCount: number;
    explanations?: {
      overall?: string;
      ats?: string;
      skills?: string;
      opportunities?: string;
    };
  };
}

function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const stats = [
    { 
      title: "Overall Score", 
      value: data?.overallScore ?? 0,
      icon: Target, 
      description: data?.explanations?.overall || 'Overall readiness based on ATS, skills, and impact evidence.',
      color: "text-[#6366F1]",
      bg: "bg-[#6366F1]/10",
      border: "border-[#6366F1]/20"
    },
    { 
      title: "ATS Readiness", 
      value: data?.atsCompatibility ?? 0,
      icon: BrainCircuit, 
      description: data?.explanations?.ats || 'How often your resume is likely to pass automated keyword filters.',
      color: "text-[#38BDF8]",
      bg: "bg-[#38BDF8]/10",
      border: "border-[#38BDF8]/20"
    },
    { 
      title: "Skill Match", 
      value: data?.skillMatch ?? 0,
      icon: TrendingUp, 
      description: data?.explanations?.skills || 'Match against required skills for your best-fit role.',
      color: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10",
      border: "border-[#22C55E]/20"
    },
    { 
      title: "Opportunities", 
      value: data?.opportunitiesCount ?? 0,
      icon: Users, 
      description: data?.explanations?.opportunities || 'Roles where your current profile can compete strongly.',
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/20"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group"
        >
          <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-500 overflow-hidden relative h-full rounded-[32px] p-2">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="mb-3 flex items-end gap-2">
                <div className="text-4xl font-black text-white font-space-grotesk tracking-tighter">
                  {stat.title === 'Opportunities' ? stat.value : `${stat.value}%`}
                </div>
              </div>
              {stat.title !== 'Opportunities' && (
                <div className="mb-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.bg.replace('/10', '/80')}`}
                    style={{ width: `${Math.max(0, Math.min(100, Number(stat.value)))}%` }}
                  />
                </div>
              )}
              <div className="text-[11px] font-medium text-slate-400 leading-relaxed">
                {stat.description}
              </div>
              <div className="mt-2 text-[10px] font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                Explained Insight
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(AnalyticsCards);


