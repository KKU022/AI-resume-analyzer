'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  ChevronRight,
  BrainCircuit,
  BarChart3,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

const features = [
  {
    title: "AI Resume Analysis",
    description: "Multi-layered neural networks dissect your experience and skills with human-like understanding.",
    icon: BrainCircuit,
    color: "text-[#6366F1]",
    borderColor: "group-hover:border-[#6366F1]/50",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
  },
  {
    title: "ATS Compatibility Score",
    description: "Simulate top-tier recruiter software to ensure your resume never gets auto-rejected by algorithms.",
    icon: Target,
    color: "text-[#38BDF8]",
    borderColor: "group-hover:border-[#38BDF8]/50",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]"
  },
  {
    title: "Skill Gap Detection",
    description: "Identify precisely which technologies and certifications you need for your target roles.",
    icon: Zap,
    color: "text-[#22C55E]",
    borderColor: "group-hover:border-[#22C55E]/50",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]"
  },
  {
    title: "Career Recommendations",
    description: "Personalized career path suggestions based on your unique skill profile and market trends.",
    icon: BarChart3,
    color: "text-[#8B5CF6]",
    borderColor: "group-hover:border-[#8B5CF6]/50",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
  },
  {
    title: "Resume Improvement",
    description: "Context-aware phrasing improvements that turn basic tasks into high-impact achievements.",
    icon: Lightbulb,
    color: "text-[#F59E0B]",
    borderColor: "group-hover:border-[#F59E0B]/50",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
  },
  {
    title: "Security & Privacy",
    description: "Enterprise-grade encryption ensures your career data is protected and never shared without consent.",
    icon: ShieldCheck,
    color: "text-slate-400",
    borderColor: "group-hover:border-slate-400/50",
    glowColor: "group-hover:shadow-[0_0_30_rgba(148,163,184,0.2)]"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6 bg-[#0B1120] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#6366F1]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#6366F1] mb-4"
          >
            Core Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black font-space-grotesk text-white leading-tight"
          >
            Intelligence Behind <br />
            <span className="text-gradient">Every Insight</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            Powered by advanced neural networks and industry-leading recruitment data.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative p-10 rounded-[40px] glass-panel transition-all duration-500 hover:-translate-y-2 ${feature.borderColor} ${feature.glowColor}`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 font-space-grotesk">{feature.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

