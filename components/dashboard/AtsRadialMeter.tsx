'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Trophy, Sparkles } from 'lucide-react';

interface AtsRadialMeterProps {
  score: number;
  label?: string;
}

export default function AtsRadialMeter({ score, label = 'Overall ATS Quality' }: AtsRadialMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Clamp score
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine Tier
  const tier =
    clampedScore >= 80
      ? {
          name: 'Elite Tier',
          glow: 'rgba(34, 197, 94, 0.45)',
          stroke: '#22C55E',
          bgBadge: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
          textColor: 'text-emerald-400',
          icon: Trophy,
          description: 'Recruiter-ready! Passes 98% of Fortune 500 ATS filters.',
        }
      : clampedScore >= 60
      ? {
          name: 'Competitive Contender',
          glow: 'rgba(56, 189, 248, 0.45)',
          stroke: '#38BDF8',
          bgBadge: 'bg-sky-500/20 border-sky-500/50 text-sky-300',
          textColor: 'text-sky-400',
          icon: CheckCircle2,
          description: 'Solid profile. Refine impact metrics to unlock Elite tier.',
        }
      : {
          name: 'Needs Calibration',
          glow: 'rgba(249, 115, 22, 0.45)',
          stroke: '#F97316',
          bgBadge: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
          textColor: 'text-amber-400',
          icon: ShieldAlert,
          description: 'High ATS rejection risk. Fix missing metrics and keywords.',
        };

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * clampedScore);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (clampedScore >= 80) {
          setShowConfetti(true);
        }
      }
    };

    requestAnimationFrame(animate);
  }, [clampedScore]);

  // SVG Radial circle math
  const size = 220;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const TierIcon = tier.icon;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Confetti Micro-Animation for Elite Tier */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex items-center justify-center">
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i / 28) * 360;
              const distance = 80 + (i % 5) * 22;
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * distance;
              const y = Math.sin(rad) * distance;
              const colors = ['#22C55E', '#38BDF8', '#6366F1', '#F59E0B', '#EC4899'];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    scale: [0, 1.2, 0.8],
                    x,
                    y,
                    rotate: 360 * ((i % 2 === 0 ? 1 : -1)),
                  }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  className="absolute w-2.5 h-2.5 rounded-sm"
                  style={{ background: colors[i % colors.length] }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tier.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: `drop-shadow(0 0 12px ${tier.glow})`,
            }}
          />
        </svg>

        {/* Inner Score Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-baseline">
              <span className="text-6xl font-black font-space-grotesk tracking-tighter text-white">
                {animatedScore}
              </span>
              <span className="text-xl font-bold text-slate-500 font-mono ml-0.5">%</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-1">
              ATS Score
            </span>
          </motion.div>
        </div>
      </div>

      {/* Tier Badge */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black tracking-wider uppercase shadow-lg ${tier.bgBadge}`}
        >
          <TierIcon className="w-3.5 h-3.5" />
          <span>{tier.name}</span>
          {clampedScore >= 80 && <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-300" />}
        </div>
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          {tier.description}
        </p>
      </motion.div>
    </div>
  );
}
