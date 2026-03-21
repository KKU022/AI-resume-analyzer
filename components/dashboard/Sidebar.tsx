'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  Target, 
  BriefcaseBusiness, 
  History, 
  Settings,
  Sparkles,
  LayoutTemplate,
  ChevronLeft,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Upload Resume', icon: UploadCloud, href: '/dashboard/upload' },
  { label: 'Analysis Report', icon: FileText, href: '/dashboard/analysis' },
  { label: 'Skill Gap', icon: Target, href: '/dashboard/skill-gap' },
  { label: 'Career Roles', icon: BriefcaseBusiness, href: '/dashboard/jobs' },
  { label: 'Learning Hub', icon: LayoutTemplate, href: '/dashboard/resume-templates' },
  { label: 'Interview Prep', icon: Zap, href: '/dashboard/interview' },
  { label: 'History', icon: History, href: '/dashboard/history' },
];

const secondaryItems = [
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    const routes = [...menuItems, ...secondaryItems].map((item) => item.href);
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  React.useEffect(() => {
    const syncThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    syncThemeState();
    window.addEventListener('app-theme-change', syncThemeState as EventListener);
    return () => window.removeEventListener('app-theme-change', syncThemeState as EventListener);
  }, []);

  return (
    <aside className={`h-full w-72 border-r flex flex-col z-50 overflow-hidden relative transition-colors ${
      isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'
    }`}>
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#6366F1]/5 blur-[60px] rounded-full pointer-events-none" />

      <div className={`p-8 border-b flex items-center justify-between relative z-10 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#38BDF8] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black font-space-grotesk tracking-tight bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">Medha</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto relative z-10">
        <div className="space-y-2">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Main Navigation</div>
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden hover:translate-x-1",
                pathname === item.href 
                  ? isDarkMode
                    ? "bg-[#6366F1]/10 text-white border border-[#6366F1]/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
              )}
            >
              {pathname === item.href && (
                <motion.div 
                   layoutId="active-nav"
                   className={`absolute left-0 w-1 h-6 rounded-r-full ${isDarkMode ? 'bg-[#6366F1]' : 'bg-indigo-500'}`}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors duration-300",
                pathname === item.href
                  ? isDarkMode
                    ? "text-[#6366F1]"
                    : "text-indigo-600"
                  : isDarkMode
                    ? "text-slate-500 group-hover:text-slate-300"
                    : "text-slate-500 group-hover:text-slate-700"
              )} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Account</div>
          {secondaryItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group hover:translate-x-1",
                pathname === item.href 
                  ? isDarkMode
                    ? "bg-white/10 text-white border border-white/10"
                    : "bg-slate-100 text-slate-900 border border-slate-200"
                  : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
              )}
            >
              <item.icon className={`w-5 h-5 ${isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-6 relative z-10">
        {/* Core free features focused */}
      </div>
    </aside>
  );
}

