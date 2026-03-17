'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, MousePointer2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  const [mounted, setMounted] = React.useState(false);
  const [particles, setParticles] = React.useState<{ left: string, top: string, duration: number, delay: number }[]>([]);

  React.useEffect(() => {
    setMounted(true);
    const newParticles = [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#38BDF8]/20 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        {/* Text Content */}
        <div className="text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#38BDF8]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powering 10,000+ Career Transitions</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold font-space-grotesk leading-tight text-white"
          >
            Your AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#38BDF8] to-[#22C55E]">
              Career Copilot
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-slate-300 max-w-xl leading-relaxed"
          >
            Stop guessing what recruiters want. Upload your resume and receive instant, data-driven AI-powered career insights that get you hired.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/dashboard/upload">
              <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white px-8 py-7 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-transform hover:scale-105">
                Upload Resume <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" className="border-white/10 text-white px-8 py-7 rounded-full text-lg font-bold bg-white/5 hover:bg-white/10 transition-transform hover:scale-105">
                Try Demo <MousePointer2 className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center gap-6 pt-4 grayscale opacity-50"
          >
            <div className="font-space-grotesk font-bold text-xl text-white">TrustPulse</div>
            <div className="font-space-grotesk font-bold text-xl text-white">SkyLine</div>
            <div className="font-space-grotesk font-bold text-xl text-white">CoreDev</div>
          </motion.div>
        </div>
        
        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative group perspective-1000"
        >
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/40 to-[#38BDF8]/40 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000 animate-pulse" />
          
          {/* Floating Particles */}
          {mounted && particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              animate={{
                y: [0, -100],
                x: [0, (i % 2 === 0 ? 50 : -50)],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeOut"
              }}
              style={{
                left: particle.left,
                top: particle.top,
              }}
            />
          ))}

          {/* Holographic Resume Card */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotateX: [2, -2, 2],
              rotateY: [5, -5, 5]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative glass-panel p-8 rounded-[32px] border border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden backdrop-blur-xl bg-white/5"
          >
            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative z-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500/30 border border-red-500/50" />
                  <div className="w-4 h-4 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                  <div className="w-4 h-4 rounded-full bg-green-500/30 border border-green-500/50" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <div className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">AI_ANALYZER_V2</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <motion.div 
                    animate={{ width: ['75%', '85%', '75%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-4 bg-white/10 rounded-full" 
                  />
                  <div className="h-4 bg-white/10 rounded-full w-full" />
                  <motion.div 
                    animate={{ width: ['66%', '90%', '66%'] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="h-4 bg-white/10 rounded-full" 
                  />
                  <div className="h-4 bg-white/10 rounded-full w-5/6" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative p-5 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 group/card overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  <div className="relative text-[10px] text-slate-400 mb-1 uppercase tracking-tighter font-bold">ATS Compatibility</div>
                  <div className="relative text-3xl font-black text-white">84<span className="text-sm text-[#6366F1] font-bold">%</span></div>
                </div>
                <div className="relative p-5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 group/card overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                  <div className="relative text-[10px] text-slate-400 mb-1 uppercase tracking-tighter font-bold">Skills Match</div>
                  <div className="relative text-3xl font-black text-white">92<span className="text-sm text-[#22C55E] font-bold">%</span></div>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Detected Strengths</div>
                 <div className="flex flex-wrap gap-2">
                   {['React', 'Next.js', 'AI Engine', 'Cloud Architecture'].map((s, i) => (
                     <motion.span 
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + (i * 0.1) }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white font-medium hover:border-[#6366F1]/50 hover:bg-[#6366F1]/10 cursor-default transition-all"
                      >
                        {s}
                      </motion.span>
                   ))}
                 </div>
              </div>
            </div>
            
            {/* Scanning beam animation */}
            <motion.div
              animate={{ 
                top: ['-10%', '110%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent via-[#38BDF8]/20 to-transparent z-10 pointer-events-none"
            >
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#38BDF8] shadow-[0_0_20px_#38BDF8]" />
            </motion.div>
          </motion.div>
          
          {/* Decorative floating widgets */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 p-5 rounded-3xl bg-[#111827] border border-white/10 shadow-2xl hidden md:flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center border border-[#6366F1]/40">
              <FileText className="w-5 h-5 text-[#6366F1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">Analysis</div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-10 -left-10 p-5 rounded-3xl bg-[#111827] border border-white/10 shadow-2xl hidden md:flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/40">
              <Sparkles className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">Growth</div>
              <div className="text-xs text-slate-400">+22% Optimization</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
