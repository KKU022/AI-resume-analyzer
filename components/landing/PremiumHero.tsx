'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroFrameAnimation from '@/components/landing/HeroFrameAnimation';

const TYPING_LINES = [
  'Analyzing your resume...',
  'Finding your best career path...',
  'Matching real opportunities...',
];

const FLOATING_SKILLS = ['React', 'TypeScript', 'ATS', 'Leadership', 'Next.js', 'Node.js'];

export default function PremiumHero() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentLine = TYPING_LINES[lineIndex];
  const visibleText = useMemo(() => currentLine.slice(0, charIndex), [currentLine, charIndex]);

  useEffect(() => {
    const speed = isDeleting ? 35 : 65;
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentLine.length) {
        setCharIndex((prev) => prev + 1);
        return;
      }

      if (!isDeleting && charIndex === currentLine.length) {
        setTimeout(() => setIsDeleting(true), 700);
        return;
      }

      if (isDeleting && charIndex > 0) {
        setCharIndex((prev) => prev - 1);
        return;
      }

      setIsDeleting(false);
      setLineIndex((prev) => (prev + 1) % TYPING_LINES.length);
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, currentLine.length, isDeleting]);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6 lg:pt-36 lg:pb-28">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1024] via-[#161032] to-[#081526]"
          animate={{
            background: [
              'linear-gradient(135deg, #0a1024 0%, #161032 52%, #081526 100%)',
              'linear-gradient(135deg, #071629 0%, #24103a 52%, #0b1c2e 100%)',
              'linear-gradient(135deg, #0a1024 0%, #161032 52%, #081526 100%)',
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-28 left-1/4 h-80 w-80 rounded-full bg-[#0ea5e9]/20 blur-[120px]"
          animate={{ x: [0, 60, -30, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-[#f59e0b]/10 blur-[140px]"
          animate={{ x: [0, -50, 20, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-[#6366f1]/20 blur-[140px]"
          animate={{ x: [0, -35, 15, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#7dd3fc]">
            <Sparkles className="h-4 w-4" /> Humanized Career Intelligence
          </div>

          <div className="space-y-5">
            <h1 className="text-6xl font-black leading-tight tracking-tight md:text-8xl font-space-grotesk">
              <span className="bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">Medha</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-300 md:text-2xl">
              Smarter resumes. Better careers. Real opportunities.
            </p>
          </div>

          <motion.div
            className="rounded-2xl border border-[#38bdf8]/35 bg-[#0b172f]/75 px-4 py-3 backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.15)]"
            animate={{ boxShadow: ['0 0 20px rgba(56,189,248,0.10)', '0 0 34px rgba(56,189,248,0.22)', '0 0 20px rgba(56,189,248,0.10)'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7dd3fc]">Live AI Status</div>
            <div className="mt-2 h-8 font-mono text-lg text-white md:text-xl">
              {visibleText}
              <motion.span
                className="inline-block w-3"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                |
              </motion.span>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard/upload">
              <Button className="h-12 rounded-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] px-7 font-black text-white shadow-[0_0_34px_rgba(99,102,241,0.42)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_48px_rgba(56,189,248,0.52)] active:scale-[0.98]">
                Upload Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/analysis?demo=true">
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-transparent px-7 font-black text-white transition-all duration-300 hover:scale-[1.04] hover:bg-gradient-to-r hover:from-[#1d4ed8]/30 hover:via-[#7c3aed]/30 hover:to-[#0891b2]/30 hover:border-[#38BDF8]/45 active:scale-[0.98]"
              >
                Try Demo
              </Button>
            </Link>
          </div>

          <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Step 1: Upload resume</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Step 2: AI analyzes</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Step 3: Insights appear</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Step 4: Best jobs matched</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="relative rounded-[32px] border border-white/15 bg-white/[0.05] p-5 shadow-[0_30px_90px_rgba(2,6,23,0.6)] backdrop-blur-2xl">
            <motion.div
              className="absolute inset-0 rounded-[32px] border border-[#38bdf8]/20"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.01, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">AI Pipeline</div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#060c1a]/70 p-4">
              <HeroFrameAnimation />

              <motion.div
                className="absolute inset-x-3 top-0 h-20 bg-gradient-to-b from-[#38bdf8]/20 to-transparent"
                animate={{ y: ['-20%', '380%'], opacity: [0, 0.9, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>

          {FLOATING_SKILLS.map((skill, index) => (
            <motion.span
              key={skill}
              className="pointer-events-none absolute rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl"
              style={{
                top: `${8 + (index % 3) * 30}%`,
                left: index % 2 === 0 ? '-10px' : 'auto',
                right: index % 2 === 0 ? 'auto' : '-10px',
              }}
              animate={{ y: [0, -8, 0], x: [0, index % 2 === 0 ? 5 : -5, 0] }}
              transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {skill}
            </motion.span>
          ))}

          <motion.div
            className="absolute -bottom-4 left-8 rounded-2xl border border-[#38bdf8]/40 bg-[#0b172f]/90 px-4 py-3 text-white backdrop-blur-xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText className="h-4 w-4 text-[#38bdf8]" /> Resume Health
            </div>
            <div className="text-lg font-black">A+</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
