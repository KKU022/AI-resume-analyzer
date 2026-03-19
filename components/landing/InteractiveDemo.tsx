'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Cpu, CheckCircle2, ArrowRight, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DemoState = 'idle' | 'uploading' | 'processing' | 'results';

export default function InteractiveDemo() {
  const [state, setState] = useState<DemoState>('idle');
  const [progress, setProgress] = useState(0);

  const startDemo = () => {
    setState('uploading');
    setProgress(0);
  };

  useEffect(() => {
    if (state === 'uploading') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setState('processing');
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }

    if (state === 'processing') {
      const timeout = setTimeout(() => {
        setState('results');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  const resetDemo = () => {
    setState('idle');
    setProgress(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-32">
      <div className="text-center mb-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E] mb-4"
        >
          Product Experience
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black font-space-grotesk text-white">Live <span className="text-[#38BDF8]">Interactive</span> Demo</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Try the analysis engine right now. No sign up required for the trial.</p>
      </div>

      <div className="glass-panel rounded-[50px] p-1 border-white/20 shadow-2xl min-h-[500px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 via-transparent to-[#38BDF8]/5" />
        
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-8 z-10"
            >
              <div className="w-24 h-24 bg-white/5 border border-white/10 border-dashed rounded-[32px] flex items-center justify-center group-hover:border-[#6366F1] transition-colors">
                <Upload className="w-10 h-10 text-slate-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white font-space-grotesk">Ready to optimize?</h3>
                <p className="text-slate-500">Click below to simulate a resume analysis.</p>
              </div>
              <Button 
                onClick={startDemo}
                className="bg-[#6366F1] hover:bg-[#4f52e2] text-white px-10 py-7 rounded-full text-lg font-black glow-button"
              >
                Start Free Trial Analysis
              </Button>
            </motion.div>
          )}

          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 z-10 w-full max-w-xs"
            >
              <FileText className="w-16 h-16 text-[#38BDF8] animate-bounce" />
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#38BDF8]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-black text-[#38BDF8] uppercase tracking-widest font-mono">Uploading Document... {progress}%</p>
            </motion.div>
          )}

          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 z-10"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full border-4 border-[#6366F1]/20 border-t-[#6366F1]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-12 h-12 text-[#6366F1] animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white font-space-grotesk italic animate-pulse">Neural Parsing...</h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Identifying core competencies & market alignment</p>
              </div>
            </motion.div>
          )}

          {state === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid lg:grid-cols-2 gap-12 p-12 w-full z-10"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/30">
                    <CheckCircle2 className="w-7 h-7 text-[#22C55E]" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white font-space-grotesk">Analysis Complete</h4>
                    <p className="text-slate-500">Market fit detected: <span className="text-[#22C55E]">High</span></p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'ATS Compatibility', score: 94, color: 'bg-[#38BDF8]' },
                    { label: 'Role Alignment', score: 88, color: 'bg-[#6366F1]' },
                    { label: 'Keyword Density', score: 76, color: 'bg-[#8B5CF6]' },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>{stat.label}</span>
                        <span className="text-white">{stat.score}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.score}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full ${stat.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-8 rounded-[40px] border-white/10 space-y-6 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-2">
                   <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                   <h5 className="text-sm font-black text-white uppercase tracking-widest">Key Insights</h5>
                 </div>
                 <div className="space-y-4">
                   <div className="flex gap-4">
                     <div className="w-1 h-auto bg-[#22C55E] rounded-full" />
                     <p className="text-slate-300 text-sm italic">"Formatting is 100% compliant with modern ATS systems (Lever, Greenhouse)."</p>
                   </div>
                   <div className="flex gap-4">
                     <div className="w-1 h-auto bg-[#F59E0B] rounded-full" />
                     <p className="text-slate-300 text-sm italic">"Missing high-impact metrics in Experience section. Recommend adding 2-3 KPI bullet points."</p>
                   </div>
                 </div>
                 <div className="pt-4">
                    <Button 
                      onClick={resetDemo}
                      variant="ghost" 
                      className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest gap-2"
                    >
                      Reset Simulation <ArrowRight className="w-3 h-3" />
                    </Button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
