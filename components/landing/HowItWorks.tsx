'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, Award } from 'lucide-react';

const steps = [
  {
    title: "Upload Resume",
    desc: "Simply drop your PDF or DOCX file into our secure neural analyzer.",
    icon: Upload,
    color: "text-[#6366F1]",
    bg: "bg-[#6366F1]/10",
    border: "border-[#6366F1]/20"
  },
  {
    title: "AI Analysis",
    desc: "Our advanced models dissect your experience and skills in milliseconds.",
    icon: Cpu,
    color: "text-[#38BDF8]",
    bg: "bg-[#38BDF8]/10",
    border: "border-[#38BDF8]/20"
  },
  {
    title: "Career Insights",
    desc: "Receive actionable recommendations and expert ATS compatibility scores.",
    icon: Award,
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
    border: "border-[#22C55E]/20"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 bg-[#0B1120] relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8] mb-4"
          >
            Workflow
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black font-space-grotesk text-white">How It <span className="text-[#6366F1]">Works</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg pt-4">Simplified career optimization powered by complex artificial intelligence.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative flex flex-col items-center text-center p-12 rounded-[50px] glass-panel transition-all duration-500 hover:bg-white/[0.07]"
            >
              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-[#0B1120] border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-2xl z-20 group-hover:border-[#6366F1]/50 group-hover:scale-110 transition-all">
                {i + 1}
              </div>

              <div className={`w-24 h-24 rounded-3xl ${step.bg} flex items-center justify-center mb-8 border ${step.border} shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <step.icon className={`w-12 h-12 ${step.color}`} />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black text-white font-space-grotesk tracking-tight">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg">{step.desc}</p>
              </div>
              
              {/* Decorative Connector (hidden on mobile) */}
              {i < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 translate-x-1/2 w-12 h-px bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

