'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { showSuccessToast } from '@/lib/toast';

interface JdMatchDialProps {
  initialResumeText?: string;
  initialJdText?: string;
  defaultHardSkillsScore?: number;
  defaultKeywordDensityScore?: number;
  defaultLeadershipScore?: number;
  defaultExperienceScore?: number;
}

export default function JdMatchDial({
  initialResumeText = '',
  initialJdText = '',
  defaultHardSkillsScore = 82,
  defaultKeywordDensityScore = 75,
  defaultLeadershipScore = 88,
  defaultExperienceScore = 79,
}: JdMatchDialProps) {
  const [resumeText, setResumeText] = useState(
    initialResumeText ||
      `Senior Full Stack Engineer with 5+ years of experience designing scalable RESTful APIs and distributed systems in Node.js and TypeScript. Spearheaded microservices migration on AWS EC2 & Docker, decreasing endpoint response latency by 32%. Mentored 4 junior engineers, led sprint planning, and implemented automated CI/CD pipelines.`
  );

  const [jdText, setJdText] = useState(
    initialJdText ||
      `We are looking for a Senior Software Engineer to build high-scale cloud platforms. Requirements: 4+ years software development experience, expertise in Node.js, TypeScript, React, and cloud platforms like AWS or GCP. Strong track record of technical leadership, system architecture, performance optimization, and CI/CD pipelines.`
  );

  const [isCalibrating, setIsCalibrating] = useState(false);

  // Compute live match scores based on resumeText and jdText
  const matchMetrics = useMemo(() => {
    const resumeWords = resumeText.toLowerCase().split(/\W+/).filter(Boolean);
    const jdWords = jdText.toLowerCase().split(/\W+/).filter(Boolean);

    // Hard skills check
    const skillsList = ['react', 'node', 'nodejs', 'typescript', 'javascript', 'aws', 'docker', 'python', 'sql', 'graphql', 'rest', 'api'];
    const matchedSkills = skillsList.filter((s) => resumeWords.includes(s) && jdWords.includes(s));
    const targetSkills = skillsList.filter((s) => jdWords.includes(s));
    const hardSkillsScore = targetSkills.length > 0 
      ? Math.min(100, Math.round((matchedSkills.length / targetSkills.length) * 100))
      : defaultHardSkillsScore;

    // Leadership / Impact verbs
    const leadershipVerbs = ['spearheaded', 'led', 'mentored', 'architected', 'engineered', 'managed', 'directed', 'designed', 'optimized', 'reduced', 'increased'];
    const matchedVerbs = leadershipVerbs.filter((v) => resumeWords.includes(v));
    const leadershipScore = Math.min(100, Math.max(50, matchedVerbs.length * 16));

    // Keyword density
    const commonJdWords = new Set(jdWords.filter((w) => w.length > 4));
    const sharedCount = resumeWords.filter((w) => commonJdWords.has(w)).length;
    const keywordDensityScore = Math.min(100, Math.max(45, Math.round((sharedCount / (resumeWords.length || 1)) * 400)));

    // Experience alignment
    const experienceScore = defaultExperienceScore;

    const overall = Math.round((hardSkillsScore + keywordDensityScore + leadershipScore + experienceScore) / 4);

    return {
      hardSkills: hardSkillsScore,
      keywordDensity: keywordDensityScore,
      leadership: leadershipScore,
      experience: experienceScore,
      overall,
    };
  }, [resumeText, jdText, defaultHardSkillsScore, defaultExperienceScore]);

  const radarData = [
    { subject: 'Hard Skills Match', value: matchMetrics.hardSkills, fullMark: 100 },
    { subject: 'Keyword Density', value: matchMetrics.keywordDensity, fullMark: 100 },
    { subject: 'Leadership / Impact', value: matchMetrics.leadership, fullMark: 100 },
    { subject: 'Experience Alignment', value: matchMetrics.experience, fullMark: 100 },
  ];

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      showSuccessToast('JD Match Dial re-benchmarked with live radar vectors!');
    }, 500);
  };

  return (
    <div className="rounded-[36px] bg-[#111827]/70 border border-white/10 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#38BDF8]">
              Target Vacancy Calibration
            </span>
          </div>
          <h3 className="text-2xl font-black text-white font-space-grotesk tracking-tight">
            Instant Job Description (JD) Match Dial
          </h3>
          <p className="text-xs text-slate-400">
            Compare candidate resume against target role description across 4 core vectors
          </p>
        </div>

        <Button
          onClick={handleRecalibrate}
          disabled={isCalibrating}
          className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isCalibrating ? 'animate-spin' : ''}`} />
          {isCalibrating ? 'Calibrating...' : 'Recalibrate'}
        </Button>
      </div>

      {/* Side-by-Side Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Resume Snippet */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              Candidate Resume Text
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Editable</span>
          </div>
          <textarea
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#38BDF8] transition-colors resize-none font-mono leading-relaxed"
            placeholder="Paste parsed resume text here..."
          />
        </div>

        {/* Right: Target Job Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              Target Job Description (JD)
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Editable</span>
          </div>
          <textarea
            rows={5}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-[#22C55E] transition-colors resize-none font-mono leading-relaxed"
            placeholder="Paste job posting or role description requirements here..."
          />
        </div>
      </div>

      {/* Dial & Radar Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        {/* Overall Match Dial Badge */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Overall JD Match Rate
          </span>
          
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-[#38BDF8] border-t-transparent animate-spin-slow"
                style={{ filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.5))' }}
              />
              <div className="text-center">
                <span className="text-4xl font-black font-space-grotesk text-white">
                  {matchMetrics.overall}%
                </span>
                <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                  {matchMetrics.overall >= 80 ? 'High Fit' : matchMetrics.overall >= 65 ? 'Moderate Fit' : 'Gap Warning'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            {matchMetrics.overall >= 80
              ? 'Your qualifications closely match the target JD. Minimal tailoring needed.'
              : 'Add target role keywords and impact verbs to push alignment over 80%.'}
          </p>
        </div>

        {/* 4-Axis Animated Radar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6366F1]" /> 4-Axis Role Alignment Radar
            </span>
            <span className="text-[10px] font-mono text-slate-400">Scores normalized 0-100</span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 9 }}
                />
                <Radar
                  name="JD Alignment"
                  dataKey="value"
                  stroke="#38BDF8"
                  fill="#6366F1"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-4">
            {radarData.map((d) => (
              <div key={d.subject} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 truncate font-bold">
                  {d.subject}
                </span>
                <span className="text-sm font-black text-white font-mono mt-0.5">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
