'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle2, Trophy, MoveHorizontal } from 'lucide-react';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[10px] font-black text-[#6366F1] uppercase tracking-[0.25em]">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Before & After Comparison
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-space-grotesk text-white tracking-tight">
          See the <span className="text-[#38BDF8]">Grok + Gemini</span> Transformation
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Drag the slider to compare an unoptimized draft against an AI-calibrated, recruiter-ready resume.
        </p>
      </div>

      {/* Main Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative h-[480px] sm:h-[520px] rounded-[36px] overflow-hidden border border-white/10 select-none cursor-ew-resize shadow-2xl bg-[#090d16]"
      >
        {/* AFTER (Recruiter-Ready) - Full background layer */}
        <div className="absolute inset-0 bg-[#0c1322] p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> After: Recruiter-Ready (Elite Tier)
              </span>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-black font-mono text-emerald-300">ATS Score: 96%</span>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h3 className="text-2xl font-black text-white font-space-grotesk">Alex Morgan</h3>
              <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mt-0.5">
                Senior Full Stack Engineer • Cloud Architecture Lead
              </p>
            </div>

            {/* Calibrated Bullet Points */}
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20 text-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  Accomplishment & Scale
                </span>
                <p>
                  • <strong>Engineered 14 REST endpoints</strong> in Node.js & TypeScript, slashing average payload latency by <strong>32%</strong> across 10k daily requests.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20 text-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  System Architecture
                </span>
                <p>
                  • <strong>Architected zero-downtime CI/CD deployment pipelines</strong> on AWS ECS & Docker, shrinking release cycle duration from 4 days to <strong>22 minutes</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/20 text-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  Engineering Leadership
                </span>
                <p>
                  • <strong>Mentored 5 junior engineers</strong> in test-driven development, elevating unit test coverage to <strong>94%</strong> and cutting regression escape rate by <strong>40%</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold">✓ High ATS Velocity</span> • Fortune 500 Ready • Quantitative Proof
          </div>
        </div>

        {/* BEFORE (Unoptimized) - Clipped Overlay */}
        <div
          className="absolute inset-0 bg-[#130f14] p-6 sm:p-10 flex flex-col justify-between overflow-hidden border-r-2 border-[#38BDF8]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="space-y-6 w-full min-w-[340px] sm:min-w-[500px]">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Before: Unoptimized Draft
              </span>
              <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                <span className="text-xs font-black font-mono text-rose-400">ATS Score: 48%</span>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h3 className="text-2xl font-black text-slate-300 font-space-grotesk">Alex Morgan</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Software Developer
              </p>
            </div>

            {/* Unoptimized Bullet Points */}
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/20 text-slate-400 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  Weak Phrasing • Missing Metrics
                </span>
                <p>
                  • Built backend APIs using Node.js and Express for our app.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/20 text-slate-400 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  No Quantified Impact
                </span>
                <p>
                  • Helped set up CI/CD pipelines and worked with Docker containers on AWS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/20 text-slate-400 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  Passive Responsibility Phrasing
                </span>
                <p>
                  • Responsible for helping teammates write tests and fixing reported bugs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-rose-400/80">
            <span>⚠ Filtered Out by ATS Parsers</span> • 0 Quantifiable Metrics
          </div>
        </div>

        {/* Central Draggable Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#38BDF8] via-white to-[#6366F1] shadow-[0_0_15px_rgba(56,189,248,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.9)] pointer-events-auto cursor-ew-resize">
            <MoveHorizontal className="w-5 h-5 text-[#38BDF8]" />
          </div>
        </div>
      </div>

      {/* Instructional helper below slider */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-4 px-2">
        <span>← Drag left for Before</span>
        <span className="font-mono text-[11px] text-slate-400">Position: {sliderPosition.toFixed(0)}%</span>
        <span>Drag right for After →</span>
      </div>
    </div>
  );
}
