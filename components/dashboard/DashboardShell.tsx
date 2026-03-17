'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import ChatWidget from '@/components/chat/ChatWidget';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex overflow-hidden lg:flex-row flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0B1120] z-50">
        <div className="flex items-center gap-2 text-xl font-bold font-space-grotesk text-white">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <span className="text-white text-lg italic">R</span>
          </div>
          <span>Resume<span className="text-[#38BDF8]">AI</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6366F1]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#38BDF8]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}
