'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Rocket,
  Target,
  BookOpen,
  Briefcase,
  FileText,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface NextStepsProps {
  score: number;
  atsScore: number;
  skillsDetected: string[];
  missingSkills: string[];
  jobMatches?: Array<{ title: string; match: number }>;
}

export default function NextStepsPanel({ score, atsScore, skillsDetected, missingSkills, jobMatches }: NextStepsProps) {
  // Generate human-friendly, actionable next steps based on profile state
  const generateSteps = () => {
    const steps: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
      action: string;
      actionHref?: string;
    }> = [];

    // Step 1: ATS optimization if needed
    if (atsScore < 75) {
      steps.push({
        icon: <Zap className="w-5 h-5 text-[#F59E0B]" />,
        title: 'Improve ATS Score',
        description: `Your ATS score is ${atsScore}%. Add 3-5 role-specific keywords from job descriptions to increase visibility.`,
        action: 'View ATS Tips',
        actionHref: '/dashboard/analysis',
      });
    }

    // Step 2: Missing skills
    if (missingSkills.length > 0) {
      steps.push({
        icon: <BookOpen className="w-5 h-5 text-[#38BDF8]" />,
        title: `Learn Missing Skills (${missingSkills.length})`,
        description: `Add ${missingSkills[0]} to your resume within 2 weeks. This will match you for ${Math.round((skillsDetected.length / (skillsDetected.length + missingSkills.length)) * 100)}-90% of available roles.`,
        action: 'View Skill Roadmap',
        actionHref: '/dashboard/skill-gap',
      });
    }

    // Step 3: Apply to jobs strategy
    if (jobMatches && jobMatches.length > 0) {
      const topMatch = jobMatches[0];
      steps.push({
        icon: <Briefcase className="w-5 h-5 text-[#22C55E]" />,
        title: 'Apply to Top Matches',
        description: `Apply to 5-10 roles like "${topMatch.title}" this week. Your profile matches ${topMatch.match}% of top roles.`,
        action: 'Best Job Matches',
        actionHref: '/dashboard/jobs',
      });
    }

    // Step 4: Optimize impact (for mid-range scores)
    if (score >= 60 && score < 85) {
      steps.push({
        icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
        title: 'Add Measurable Impact',
        description: 'Rewrite 3 resume bullets to include metrics (% improvement, users impacted, time saved). This increases interview callbacks significantly.',
        action: 'Fix Resume',
        actionHref: '/dashboard/analysis',
      });
    }

    // Step 5: Interview prep if score is high
    if (score >= 75) {
      steps.push({
        icon: <Target className="w-5 h-5 text-pink-400" />,
        title: 'Prepare for Interviews',
        description: 'Practice 5 behavioral and 3 technical questions. Focus on storytelling with metrics and learnings.',
        action: 'Start Interview Prep',
        actionHref: '/dashboard/analysis?interviewing=true',
      });
    }

    // Step 6: Networking angle
    if (steps.length < 4) {
      steps.push({
        icon: <FileText className="w-5 h-5 text-[#38BDF8]" />,
        title: 'Pick a Resume Template',
        description: 'Use a role-specific template to improve readability and ATS extraction before your next application batch.',
        action: 'Browse Templates',
        actionHref: '/dashboard/resume-templates',
      });
    }

    if (steps.length < 4) {
      steps.push({
        icon: <Rocket className="w-5 h-5 text-[#6366F1]" />,
        title: 'Strategic Networking',
        description: 'Connect with hiring managers at 3 target companies. LinkedIn outreach converts 5-10% faster than cold applications.',
        action: 'Network Tips',
      });
    }

    return steps.slice(0, 4);
  };

  const steps = generateSteps();

  return (
    <Card className="bg-gradient-to-br from-[#6366F1]/10 to-[#38BDF8]/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center border border-[#6366F1]/30">
            <Rocket className="w-5 h-5 text-[#6366F1]" />
          </div>
          <CardTitle className="text-2xl font-black text-white font-space-grotesk">Your Action Plan</CardTitle>
        </div>
        <p className="text-slate-400 text-sm font-medium">Next steps tailored to your profile strength</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start gap-4">
              <div className="mt-1">{step.icon}</div>
              <div className="flex-1">
                <h4 className="font-black text-white text-sm mb-1">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{step.description}</p>
                {step.actionHref ? (
                  <Link href={step.actionHref}>
                    <Button
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 px-4 rounded-lg transition-all group-hover:bg-[#6366F1]/20"
                    >
                      {step.action} →
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs h-8 px-4 rounded-lg transition-all"
                  >
                    {step.action} →
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
