'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Moon, Sun } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

type SearchResult = {
  title: string;
  description: string;
  route: string;
};

type NotificationEvent = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type ActiveSessionResponse = {
  session: {
    id: string;
    analysisId: string | null;
    resumeId: string | null;
    fileName: string | null;
    startedAt: string;
    updatedAt: string;
  } | null;
};

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [endingSession, setEndingSession] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sessionBlink, setSessionBlink] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const userName = profileName || session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = profileImage ?? (session?.user?.image || '');
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/dashboard/upload');
    router.prefetch('/dashboard/analysis');
    router.prefetch('/dashboard/history');
    router.prefetch('/dashboard/jobs');
    router.prefetch('/dashboard/interview');
    router.prefetch('/dashboard/skill-gap');
    router.prefetch('/dashboard/settings');
  }, [router]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { results?: SearchResult[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch('/api/user/profile');
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { name?: string; image?: string };
      setProfileName(typeof data.name === 'string' ? data.name : null);
      setProfileImage(typeof data.image === 'string' ? data.image : null);
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as {
        notificationsEnabled?: boolean;
        events?: NotificationEvent[];
      };
      setNotificationsEnabled(data.notificationsEnabled !== false);
      setNotifications(Array.isArray(data.events) ? data.events : []);
    }

    void loadNotifications();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = window.localStorage.getItem('theme-mode');
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : root.classList.contains('dark');

    root.classList.toggle('dark', shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    const syncThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const onThemeChanged = () => syncThemeState();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme-mode') {
        syncThemeState();
      }
    };

    window.addEventListener('app-theme-change', onThemeChanged as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('app-theme-change', onThemeChanged as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;

    const loadActiveSession = async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as ActiveSessionResponse;
        const currentlyActive = Boolean(data.session);

        if (!isMounted) {
          return;
        }

        setHasActiveSession((prev) => {
          if (!prev && currentlyActive) {
            setSessionBlink(true);
            if (blinkTimeout) {
              clearTimeout(blinkTimeout);
            }
            blinkTimeout = setTimeout(() => setSessionBlink(false), 1400);
          }
          return currentlyActive;
        });
      } catch {
      }
    };

    void loadActiveSession();
    const interval = setInterval(() => {
      void loadActiveSession();
    }, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadActiveSession();
      }
    };

    window.addEventListener('focus', loadActiveSession);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isMounted = false;
      if (blinkTimeout) {
        clearTimeout(blinkTimeout);
      }
      clearInterval(interval);
      window.removeEventListener('focus', loadActiveSession);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname]);

  const endSession = async () => {
    setEndingSession(true);
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (!res.ok) {
        return;
      }
      setHasActiveSession(false);
      setSessionBlink(false);
      router.push('/dashboard/history');
    } finally {
      setEndingSession(false);
    }
  };

  const toggleThemeMode = () => {
    const nextDarkMode = !isDarkMode;
    setIsDarkMode(nextDarkMode);
    document.documentElement.classList.toggle('dark', nextDarkMode);
    window.localStorage.setItem('theme-mode', nextDarkMode ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('app-theme-change', { detail: { dark: nextDarkMode } }));
  };

  return (
    <header className={`h-20 border-b flex items-center justify-between px-8 backdrop-blur-xl sticky top-0 z-40 transition-colors ${
      isDarkMode
        ? 'bg-[#0B1120]/40 border-white/5'
        : 'bg-white/80 border-slate-200/80 shadow-sm'
    }`}>
      <div className="flex-1 max-w-xl">
        <div className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
          isDarkMode
            ? 'border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#7DD3FC]'
            : 'border-sky-300/60 bg-sky-100 text-sky-700'
        }`}>
          Medha Copilot
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-[#6366F1]' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
          </div>
          <input 
            type="text" 
            placeholder="Search analysis, skill gap, resume tips..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) {
                router.push(results[0].route);
                setQuery('');
                setResults([]);
              }
            }}
            className={`w-full rounded-2xl py-2.5 px-12 text-sm transition-all duration-300 font-inter focus:outline-none ${
              isDarkMode
                ? 'bg-white/[0.03] border border-white/5 text-white placeholder:text-slate-500 focus:border-[#6366F1]/50 focus:bg-white/[0.07] focus:shadow-[0_0_24px_rgba(99,102,241,0.15)]'
                : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_18px_rgba(79,70,229,0.15)]'
            }`}
          />
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-tighter ${
            isDarkMode ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <span>⌘</span><span>K</span>
          </div>
          {(results.length > 0 || isSearching) && (
            <div className={`absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border backdrop-blur-xl p-2 shadow-2xl z-50 ${
              isDarkMode ? 'border-white/10 bg-[#0f172a]/95' : 'border-slate-200 bg-white/95'
            }`}>
              {isSearching ? (
                <div className="px-3 py-2 text-xs text-slate-400">Searching...</div>
              ) : (
                results.map((item) => (
                  <button
                    key={`${item.title}-${item.route}`}
                    onClick={() => {
                      router.push(item.route);
                      setQuery('');
                      setResults([]);
                    }}
                    className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}
                  >
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleThemeMode}
          className={`group relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
            isDarkMode
              ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
          title={isDarkMode ? 'Switch to day mode' : 'Switch to night mode'}
          aria-label={isDarkMode ? 'Switch to day mode' : 'Switch to night mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-[#7dd3fc]" />}
          <span className="hidden text-[10px] font-black uppercase tracking-wider md:inline">
            {isDarkMode ? 'Day' : 'Night'}
          </span>
          <span className={`pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wider shadow-lg group-hover:block ${
            isDarkMode ? 'border-white/10 bg-[#0b1120]/95 text-slate-300' : 'border-slate-200 bg-white text-slate-600'
          }`}>
            {isDarkMode ? 'Switch To Day' : 'Switch To Night'}
          </span>
        </motion.button>
        {hasActiveSession && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            animate={sessionBlink ? { opacity: [0.45, 1, 0.6, 1], scale: [1, 1.04, 1] } : undefined}
            transition={sessionBlink ? { duration: 1.2, ease: 'easeInOut' } : undefined}
            onClick={() => void endSession()}
            disabled={endingSession}
            className="px-3 py-2 rounded-xl border border-red-500/25 text-red-300 hover:bg-red-500/10 transition-colors text-xs font-bold"
          >
            {endingSession ? 'Ending...' : 'End Session'}
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={async () => {
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            await fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ markAllRead: true }),
            });
          }}
          className={`relative p-2.5 rounded-xl transition-all ${
            isDarkMode
              ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
              : 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          <Bell className="w-5 h-5" />
          {notificationsEnabled && unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-[#6366F1] rounded-full border border-[#0B1120] text-[9px] text-white font-black flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
        
        <div className={`h-8 w-px mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

        <DropdownMenu>
          <DropdownMenuTrigger className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all border border-transparent ${
            isDarkMode ? 'hover:bg-white/5 hover:border-white/5' : 'hover:bg-slate-100 hover:border-slate-200'
          }`}>
            <Avatar className={`h-9 w-9 shadow-lg ${isDarkMode ? 'border border-white/10' : 'border border-slate-200'}`}>
              <AvatarImage src={userImage} />
              <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#38BDF8] text-white text-xs font-black">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userName}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <div className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest">Active Member</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className={`w-64 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl ${
            isDarkMode ? 'bg-[#111827] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="px-4 py-3">
              <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authenticated as</div>
              <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userEmail}</div>
            </div>
            <DropdownMenuSeparator className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} mx-2`} />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className={`cursor-pointer rounded-xl py-2.5 px-3 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                <Settings className="w-4 h-4 mr-3 text-slate-400" /> 
                <span className="text-sm font-bold">Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className={`cursor-pointer rounded-xl py-2.5 px-3 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
               <User className="w-4 h-4 mr-3 text-slate-400" /> 
               <span className="text-sm font-bold">Public Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} mx-2`} />
            <div className="px-3 py-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Latest Notifications</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.slice(0, 3).map((item) => (
                  <div key={item.id} className={`rounded-lg border px-2 py-1.5 ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-xs text-slate-500">No recent events yet.</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} mx-2`} />
            <DropdownMenuItem 
              className="text-red-400 hover:bg-red-500/10 cursor-pointer rounded-xl py-2.5 px-3"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-3" /> 
              <span className="text-sm font-bold">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

