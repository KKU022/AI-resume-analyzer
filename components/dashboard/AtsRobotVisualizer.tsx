'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Bot, AlertTriangle, CheckCircle, FileText, Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { showSuccessToast } from '@/lib/toast';

interface AtsRobotVisualizerProps {
  fileName?: string;
  extracted?: {
    skills?: string[];
    experienceLines?: string[];
    projectLines?: string[];
    educationLines?: string[];
  };
  rawText?: string;
}

export default function AtsRobotVisualizer({
  fileName = 'Resume_Document.pdf',
  extracted,
  rawText,
}: AtsRobotVisualizerProps) {
  const [viewMode, setViewMode] = useState<'human' | 'robot'>('human');
  const [copied, setCopied] = useState(false);

  // Generate the raw ATS Robot string
  const robotParsedText = rawText || [
    `=== BEGIN ATS PARSER DUMP [RFC-4180 / RAW MONOSPACE STREAM] ===`,
    `TARGET_FILE: ${fileName}`,
    `STATUS: PARSED_WITHOUT_CSS_OR_GEOMETRY`,
    ``,
    `>>> SECTION: CANDIDATE_METRICS`,
    ...(extracted?.experienceLines && extracted.experienceLines.length > 0
      ? extracted.experienceLines.map((line, i) => `[EXP_BLK_${i + 1}] ${line}`)
      : [
          `[EXP_BLK_1] Senior Software Engineer | Enterprise Cloud Solutions | 2021-Present`,
          `[EXP_BLK_2] Engineered distributed REST endpoints in Node.js, slashing payload latency by 32%`,
          `[EXP_BLK_3] Orchestrated Kubernetes clusters and Docker containers across AWS EC2 instances`,
        ]),
    ``,
    `>>> SECTION: CORE_SKILLS_TOKENS`,
    (extracted?.skills && extracted.skills.length > 0
      ? extracted.skills.join(' | ')
      : 'React | TypeScript | Node.js | Python | AWS | Docker | REST API | SQL | CI/CD | System Design'),
    ``,
    `>>> SECTION: PROJECT_EXTRACTS`,
    ...(extracted?.projectLines && extracted.projectLines.length > 0
      ? extracted.projectLines.map((line, i) => `[PRJ_REF_${i + 1}] ${line}`)
      : [
          `[PRJ_REF_1] High-Throughput Analytics Dashboard - React 18, Next.js, TailwindCSS`,
          `[PRJ_REF_2] Auth0 Role-Based Access Control Module - Zero-Trust Token Auth`,
        ]),
    ``,
    `>>> SECTION: EDUCATION_CREDENTIALS`,
    ...(extracted?.educationLines && extracted.educationLines.length > 0
      ? extracted.educationLines.map((line, i) => `[EDU_REC_${i + 1}] ${line}`)
      : [`[EDU_REC_1] B.S. in Computer Science - Honors | Magna Cum Laude`]),
    ``,
    `=== END ATS TEXT STREAM: COLUMN BOUNDARIES REMOVED, TABLES FLATTENED ===`,
  ].join('\n');

  const copyRobotStream = () => {
    navigator.clipboard.writeText(robotParsedText);
    setCopied(true);
    showSuccessToast('Raw ATS Robot stream copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[32px] bg-[#111827]/70 border border-white/10 p-6 sm:p-8 space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#38BDF8]">
              ATS Transparency Engine
            </span>
          </div>
          <h3 className="text-xl font-black text-white font-space-grotesk tracking-tight">
            ATS Live Visualizer
          </h3>
          <p className="text-xs text-slate-400">
            Compare candidate-facing layout against raw recruiter parsing algorithms
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('human')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
              viewMode === 'human'
                ? 'bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            What You See
          </button>
          <button
            type="button"
            onClick={() => setViewMode('robot')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300',
              viewMode === 'robot'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            What the ATS Robot Sees
          </button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'human' ? (
          <motion.div
            key="human-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{fileName}</h4>
                    <p className="text-[11px] text-slate-400">Human Recruiter Formatted View</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  Visual Layout Active
                </span>
              </div>

              {/* Styled Mock Resume Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-[#38BDF8] uppercase tracking-wider mb-2">
                      Experience Highlights
                    </h5>
                    <div className="space-y-2">
                      {(extracted?.experienceLines || [
                        'Engineered 14 REST endpoints in Node.js, slashing average payload latency by 32% across 10k daily requests.',
                        'Architected zero-downtime CI/CD deployment pipelines on AWS ECS.',
                        'Spearheaded migration of legacy monolith to microservices architecture.',
                      ]).slice(0, 3).map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-black text-[#6366F1] uppercase tracking-wider mb-2">
                      Projects
                    </h5>
                    <div className="space-y-2">
                      {(extracted?.projectLines || [
                        'High-Performance Resume Analyzer with Gemini Multimodal and Grok ATS calibration.',
                        'Enterprise Micro-Frontend Architecture with module federation.',
                      ]).slice(0, 2).map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-black text-[#22C55E] uppercase tracking-wider mb-2">
                      Extracted Competencies
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {(extracted?.skills || [
                        'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL', 'Python', 'PostgreSQL'
                      ]).slice(0, 10).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[11px] font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Education</span>
                    <p className="text-xs font-bold text-white">B.S. in Computer Science</p>
                    <p className="text-[11px] text-slate-400">GPA 3.8 / 4.0</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="robot-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                <span className="font-bold">Why the ATS Robot View matters:</span> Applicant Tracking Systems
                strip away multi-column graphical styling, icons, and text boxes into this raw monospace text block.
                If critical skills are embedded in image graphics or sidebars, ATS parsers can misread or skip them completely.
              </div>
            </div>

            {/* Terminal Monospace Stream */}
            <div className="relative rounded-2xl bg-[#090d16] border border-emerald-500/30 p-6 overflow-hidden shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  <span>PARSER_STREAM // RAW_OUTPUT_TEXT_ONLY</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRobotStream}
                  className="h-7 px-3 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[10px] font-mono"
                >
                  {copied ? (
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Copy className="w-3 h-3" /> Copy Raw Stream</span>
                  )}
                </Button>
              </div>

              {/* Monospace Code Output */}
              <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto selection:bg-emerald-500/30 selection:text-white">
                {robotParsedText}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
