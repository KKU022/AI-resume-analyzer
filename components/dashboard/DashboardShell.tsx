'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import DashboardFloatingAnimation from '@/components/dashboard/DashboardFloatingAnimation';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const syncThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    syncThemeState();
    window.addEventListener('app-theme-change', syncThemeState as EventListener);
    return () => window.removeEventListener('app-theme-change', syncThemeState as EventListener);
  }, []);

  const toggleThemeMode = () => {
    const nextDarkMode = !isDarkMode;
    setIsDarkMode(nextDarkMode);
    document.documentElement.classList.toggle('dark', nextDarkMode);
    window.localStorage.setItem('theme-mode', nextDarkMode ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('app-theme-change', { detail: { dark: nextDarkMode } }));
  };

  return (
    <div className={`min-h-screen flex overflow-hidden lg:flex-row flex-col transition-colors ${
      isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#f4f7fc] text-slate-800'
    }`}>
      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b z-50 transition-colors ${
        isDarkMode ? 'border-white/5 bg-[#0B1120]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2 text-xl font-bold font-space-grotesk text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-white text-sm font-black">M</span>
          </div>
          <span className="bg-gradient-to-r from-[#38BDF8] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">Medha</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleThemeMode}
            className={`rounded-lg p-2 transition-colors ${
              isDarkMode ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={isDarkMode ? 'Switch to day mode' : 'Switch to night mode'}
            aria-label={isDarkMode ? 'Switch to day mode' : 'Switch to night mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-sky-500" />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={cn(
        "fixed inset-0 z-40 lg:relative lg:block transition-all duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:ml-0 overflow-x-hidden">
        <div className="hidden lg:block">
           <Topbar />
        </div>
        
        <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
          {/* Ambient Background Glows */}
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none ${isDarkMode ? 'bg-[#6366F1]/5' : 'bg-[#6366F1]/8'}`} />
          <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none ${isDarkMode ? 'bg-[#38BDF8]/5' : 'bg-[#38BDF8]/8'}`} />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <DashboardFloatingAnimation />
    </div>
  );
}
