'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FileText, Sparkles, TrendingUp } from 'lucide-react';

const mockChartData = [
  { name: 'v1.0', score: 45 },
  { name: 'v1.1', score: 52 },
  { name: 'v1.2', score: 48 },
  { name: 'v2.0', score: 65 },
  { name: 'v2.1', score: 78 },
  { name: 'v3.0', score: 84 },
  { name: 'v3.1', score: 92 },
];

export default function DashboardPreview() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-panel rounded-[50px] p-1 border-white/20 shadow-2xl overflow-hidden relative"
      >
        {/* Dashboard Header Bar */}
        <div className="bg-white/5 border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-400/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
            <div className="w-3 h-3 rounded-full bg-green-400/50" />
            <div className="ml-4 h-6 w-px bg-white/10" />
            <span className="ml-4 text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">ai_career_copilot_v4.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: ['0%', '85%'] }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#38BDF8]" 
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-1 p-1">
          {/* Sidebar Mock */}
          <div className="lg:col-span-3 bg-white/[0.02] p-8 space-y-8 hidden lg:block">
            <div className="space-y-4">
              <div className="w-full h-10 bg-[#6366F1]/20 rounded-xl border border-[#6366F1]/30 flex items-center px-4 gap-3">
                <FileText className="w-4 h-4 text-[#6366F1]" />
                <div className="w-20 h-2 bg-[#6366F1]/40 rounded-full" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-10 hover:bg-white/5 rounded-xl flex items-center px-4 gap-3 transition-colors">
                  <div className="w-4 h-4 bg-white/10 rounded" />
                  <div className="w-16 h-2 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-9 bg-[#0B1120]/40 p-8 lg:p-12 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h4 className="text-3xl font-black text-white font-space-grotesk tracking-tight">Resume Optimization</h4>
                <p className="text-slate-500 font-medium">Deep analysis across 42 key performance metrics.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overall Score</div>
                  <div className="text-2xl font-black text-[#22C55E]">92%</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/20 flex items-center justify-center border border-[#22C55E]/30">
                  <Sparkles className="w-6 h-6 text-[#22C55E]" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Chart Optimization */}
              <div className="glass-panel p-8 rounded-[40px] border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-white font-space-grotesk uppercase text-xs tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
                    Score History
                  </h5>
                  <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-1 rounded-lg">+14% Growth</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="glass-panel p-8 rounded-[40px] border-white/10 space-y-6">
                 <h5 className="font-black text-white font-space-grotesk uppercase text-xs tracking-widest">Market Alignment</h5>
                 <div className="space-y-4">
                   {[
                     { label: 'Technical Proficiency', score: '94%', color: 'from-[#6366F1] to-[#38BDF8]' },
                     { label: 'ATS Keywords', score: '88%', color: 'from-[#38BDF8] to-[#22C55E]' },
                     { label: 'Soft Skills', score: '76%', color: 'from-[#F59E0B] to-[#EC4899]' },
                   ].map((skill) => (
                     <div key={skill.label} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">{skill.label}</span>
                          <span className="text-white">{skill.score}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: skill.score }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={`h-full bg-gradient-to-r ${skill.color}`} 
                          />
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
            
            {/* Live Feed Mock */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 border-dashed flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">System_log: Generating dynamic cover letter for Google_Staff_Eng...</span>
              </div>
              <span className="text-[10px] font-black text-slate-700 font-mono">12:42:04</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
