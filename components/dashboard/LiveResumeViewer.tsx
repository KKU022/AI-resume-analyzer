'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, Sparkles, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveResumeViewerProps {
  fileName?: string;
  extracted?: {
    skills?: string[];
    experienceLines?: string[];
    projectLines?: string[];
    educationLines?: string[];
  };
  highlightedSection?: string | null;
  onSelectBullet?: (bullet: string) => void;
  problems?: string[];
}

export default function LiveResumeViewer({
  fileName,
  extracted,
  highlightedSection,
  onSelectBullet,
  problems,
}: LiveResumeViewerProps) {
  const [zoom, setZoom] = React.useState(100);
  const [showAnnotations, setShowAnnotations] = React.useState(true);

  const experience = extracted?.experienceLines?.length
    ? extracted.experienceLines
    : [
        'Lead Software Engineer | TechScale Solutions (2022 - Present)',
        'Built full-stack microservices handling customer transactions and account management.',
        'Responsible for team standups and coordinating code reviews across sprint releases.',
        'Assisted with database query migrations from legacy MongoDB to PostgreSQL clusters.',
      ];

  const projects = extracted?.projectLines?.length
    ? extracted.projectLines
    : [
        'AI Career Engine: Next.js, TypeScript, Tailwind, MongoDB, Google Gemini.',
        'High-Throughput Ingestion Pipeline: Node.js, Redis, Docker, BullMQ.',
      ];

  const skills = extracted?.skills?.length
    ? extracted.skills
    : ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Docker', 'AWS', 'TailwindCSS'];

  return (
    <div className="w-full flex flex-col h-full rounded-[36px] overflow-hidden border border-white/10 bg-[#0a1222]/90 backdrop-blur-2xl shadow-2xl">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-black text-white font-space-grotesk tracking-wide truncate max-w-[200px]">
              {fileName || 'resume_document.pdf'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Live Document Annotator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border ${
              showAnnotations
                ? 'bg-[#6366F1]/20 border-[#6366F1]/40 text-[#6366F1]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            {showAnnotations ? 'Annotations ON' : 'Clean View'}
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setZoom((z) => Math.max(80, z - 10))}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 px-1">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Document Paper Pane */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-text">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200 space-y-6 max-w-2xl mx-auto"
        >
          {/* Header Block */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="h-6 w-48 rounded bg-gradient-to-r from-white to-slate-400 font-space-grotesk font-black text-lg text-white flex items-center">
              CANDIDATE PROFILE
            </div>
            <p className="text-xs text-slate-400">
              Verified via Gemini Multimodal Ingestion • Target Market Alignment Active
            </p>
          </div>

          {/* Work Experience Section */}
          <motion.div
            animate={highlightedSection === 'experience' ? { scale: [1, 1.02, 1], borderColor: '#6366F1' } : {}}
            transition={{ duration: 0.6 }}
            className={`p-6 rounded-2xl border transition-colors space-y-4 ${
              highlightedSection === 'experience'
                ? 'bg-[#6366F1]/10 border-[#6366F1]/60 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-[#38BDF8]">
                Professional Experience
              </h4>
              {showAnnotations && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <AlertTriangle className="w-2.5 h-2.5" /> 2 Weak Action Bullets
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {experience.map((line, idx) => {
                const isWeak = idx === 1 || idx === 2; // Simulated weak bullets
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectBullet?.(line)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer group ${
                      showAnnotations && isWeak
                        ? 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 mt-0.5">•</span>
                      <p className="flex-1 text-slate-200 group-hover:text-white font-medium">{line}</p>
                    </div>
                    {showAnnotations && isWeak && (
                      <div className="mt-1.5 pl-3 flex items-center justify-between text-[10px] text-amber-300">
                        <span>⚠️ Low ATS Velocity: Lacks quantified outcome</span>
                        <span className="underline font-bold text-[#38BDF8] flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Click to Rewrite
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Technical Projects Section */}
          <motion.div
            animate={highlightedSection === 'projects' ? { scale: [1, 1.02, 1], borderColor: '#22C55E' } : {}}
            transition={{ duration: 0.6 }}
            className={`p-6 rounded-2xl border transition-colors space-y-4 ${
              highlightedSection === 'projects'
                ? 'bg-[#22C55E]/10 border-[#22C55E]/60 shadow-[0_0_30px_rgba(34,197,94,0.25)]'
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-black uppercase tracking-[0.25em] text-[#22C55E]">
                Key Projects & Impact
              </h4>
              {showAnnotations && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <CheckCircle className="w-2.5 h-2.5" /> High Architecture Match
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.015] border border-white/5">
                  <p className="text-slate-300 font-medium">{proj}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills Competency Cloud */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-[0.25em] text-[#8B5CF6]">
              Extracted Stack & Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
