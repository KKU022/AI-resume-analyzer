'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit, Target, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroTextSequence() {
  const { scrollYProgress } = useScroll();

  // Sequence 1: 0 - 0.25
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [20, -20]);

  // Sequence 2: 0.25 - 0.5
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.35, 0.45, 0.5], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.25, 0.5], [20, -20]);

  // Sequence 3: 0.5 - 0.75
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.75], [20, -20]);

  // Sequence 4: 0.75 - 1.0
  const opacity4 = useTransform(scrollYProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.75, 1], [20, 0]);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto h-[400vh] pointer-events-none">
      {/* SECTION 1 */}
      <motion.div 
        style={{ opacity: opacity1, y: y1 }}
        className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="space-y-6 max-w-4xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#38BDF8]">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen AI Analysis</span>
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter">
             AI That <span className="text-gradient">Understands</span> <br /> Your Career
           </h1>
           <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
             Upload your resume and unlock intelligent AI insights.
           </p>
        </div>
      </motion.div>

      {/* SECTION 2 */}
      <motion.div 
        style={{ opacity: opacity2, y: y2 }}
        className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="space-y-6 max-w-4xl">
           <div className="w-16 h-16 bg-[#6366F1]/20 rounded-2xl flex items-center justify-center mx-auto border border-[#6366F1]/30">
              <BrainCircuit className="w-8 h-8 text-[#6366F1]" />
           </div>
           <h2 className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter">
             Instant Resume <br /> <span className="text-[#6366F1]">Intelligence</span>
           </h2>
           <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
             Advanced AI evaluates skills, experience and ATS compatibility.
           </p>
        </div>
      </motion.div>

      {/* SECTION 3 */}
      <motion.div 
        style={{ opacity: opacity3, y: y3 }}
        className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="space-y-6 max-w-4xl">
           <div className="w-16 h-16 bg-[#22C55E]/20 rounded-2xl flex items-center justify-center mx-auto border border-[#22C55E]/30">
              <Target className="w-8 h-8 text-[#22C55E]" />
           </div>
           <h2 className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter">
             Discover <br /> <span className="text-[#22C55E]">Skill Gaps</span>
           </h2>
           <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium">
             Identify missing skills and accelerate your career growth.
           </p>
        </div>
      </motion.div>

      {/* SECTION 4 */}
      <motion.div 
        style={{ opacity: opacity4, y: y4 }}
        className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="space-y-8 max-w-5xl">
           <div className="w-16 h-16 bg-[#38BDF8]/20 rounded-2xl flex items-center justify-center mx-auto border border-[#38BDF8]/30">
              <LineChart className="w-8 h-8 text-[#38BDF8]" />
           </div>
           <h2 className="text-6xl md:text-9xl font-black text-white leading-[1] tracking-tighter">
             Your AI <br /> <span className="text-gradient">Career Copilot</span>
           </h2>
           <div className="flex flex-col items-center gap-6 pointer-events-auto">
             <Link href="/login">
               <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white px-12 py-8 rounded-full text-2xl font-black shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95 group">
                 Analyze My Resume <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
               </Button>
             </Link>
             <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.3em]">
               Free to start • No credit card required
             </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
