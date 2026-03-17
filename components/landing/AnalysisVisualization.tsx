'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, Database, BarChart3, Search, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: "Resume Ingest",
    description: "Neural parsers analyze document structure and metadata.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    delay: 0
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Large Language Models identify core competencies and roles.",
    color: "text-[#6366F1]",
    bg: "bg-[#6366F1]/10",
    delay: 0.2
  },
  {
    icon: Database,
    title: "Data Extraction",
    description: "Experience, education, and skills are indexed into vector data.",
    color: "text-[#38BDF8]",
    bg: "bg-[#38BDF8]/10",
    delay: 0.4
  },
  {
    icon: BarChart3,
    title: "Skill Analysis",
    description: "Benchmarking against 50M+ job descriptions for market fit.",
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
    delay: 0.6
  }
];

export default function AnalysisVisualization() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-32 relative">
      {/* Central Scanning Beam Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#6366F1]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center mb-24 space-y-4">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-black font-space-grotesk text-white tracking-tighter"
        >
          Visualizing <span className="text-gradient">Intelligence</span>
        </motion.h2>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          Experience the granular precision of our AI career optimization engine.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: step.delay }}
            className="group relative p-8 rounded-[40px] glass-panel card-lift overflow-hidden"
          >
            {/* Animated Scanning Light */}
            <motion.div 
              animate={{ top: ['110%', '-10%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent z-0 opacity-0 group-hover:opacity-100"
            />

            <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
              <step.icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 font-space-grotesk">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {step.description}
            </p>

            {/* Connection line indicator */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 w-8 h-px bg-white/10" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Holographic Resume Card Visualization */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-32 relative aspect-[21/9] w-full max-w-5xl mx-auto rounded-[60px] overflow-hidden glass-panel border border-white/20 p-1 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/10 via-transparent to-[#38BDF8]/10" />
        
        <div className="relative h-full w-full rounded-[58px] overflow-hidden flex items-center justify-center p-12">
           <div className="grid grid-cols-3 gap-12 w-full">
              {/* Left Column: Data Extraction */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <Search className="w-4 h-4 text-[#38BDF8]" />
                  Extraction_Log
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <motion.div 
                      key={i}
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                      className="h-2 bg-white/5 rounded-full relative overflow-hidden"
                    >
                      <motion.div 
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Center Column: Neural Scanning */}
              <div className="flex flex-col items-center justify-center relative">
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-48 h-48 rounded-full border border-dashed border-[#6366F1]/30 flex items-center justify-center"
                 >
                    <motion.div 
                       animate={{ rotate: -360 }}
                       transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                       className="w-32 h-32 rounded-full border border-[#38BDF8]/20 flex items-center justify-center bg-white/5"
                    >
                       <Cpu className="w-12 h-12 text-[#6366F1] animate-pulse" />
                    </motion.div>
                 </motion.div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6366F1]/20 blur-[60px] rounded-full" />
              </div>

              {/* Right Column: Validation */}
              <div className="space-y-6 flex flex-col justify-center items-end text-right">
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest">Integrity Check</div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-3xl font-black text-white tracking-tighter">Verified</span>
                    <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 w-full">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Skill Matrix Mapping</div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {['React', 'Next.js', 'AI', 'Cloud'].map(s => (
                      <span key={s} className="px-3 py-1 bg-[#6366F1]/20 rounded-lg text-[10px] text-white font-bold border border-[#6366F1]/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Scanning beam effect */}
        <motion.div 
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-[50%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-12"
        />
      </motion.div>
    </div>
  );
}
