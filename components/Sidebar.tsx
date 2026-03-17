'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, MonitorPlay, LogOut, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyzer', href: '/analyzer', icon: FileText },
    { name: 'Interview Prep', href: '/interview', icon: MonitorPlay },
    { name: 'Career Chat', href: '/chat', icon: MessageSquare },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-brand-primary/95 backdrop-blur flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-space-grotesk text-white">
          <Sparkles className="w-6 h-6 text-brand-accent-ai" />
          <span>Resume<span className="text-brand-accent-data">AI</span></span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {routes.map((route) => {
          const isActive = pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-brand-accent-ai/20 text-white border border-brand-accent-ai/30" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-brand-accent-data" : "text-slate-500")} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
          <LogOut className="w-5 h-5 text-slate-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
