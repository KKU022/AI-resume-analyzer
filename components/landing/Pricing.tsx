'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const tiers = [
  {
    name: "Free",
    price: "0",
    desc: "Everything you need to get started.",
    features: ["1 Resume Analysis", "Basic ATS Scoring", "Skill Extraction", "Community Access"],
    button: "Get Started",
    pro: false
  },
  {
    name: "Pro",
    price: "19",
    desc: "Advanced AI power for serious seekers.",
    features: ["Unlimited Analysis", "Career Roadmap", "Resume Rewriting", "Priority AI Processing"],
    button: "Go Pro",
    pro: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For universities and recruitment firms.",
    features: ["Bulk Processing", "Custom Branding", "API Access", "Dedicated Support"],
    button: "Contact Sales",
    pro: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk text-white">Simple, Transparent <span className="text-[#6366F1]">Pricing</span></h2>
          <p className="text-slate-400">Choose the plan that's right for your career stage.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl border ${tier.pro ? 'bg-white/10 border-[#6366F1] shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10'} relative`}
            >
              {tier.pro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> MOST POPULAR
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price === 'Custom' ? '' : '$'}{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-slate-400">/mo</span>}
                </div>
                <p className="text-slate-400 text-sm mt-4">{tier.desc}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-[#22C55E]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button className={`w-full py-6 rounded-xl font-bold ${tier.pro ? 'bg-[#6366F1] hover:bg-[#4f52e2]' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  {tier.button}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
