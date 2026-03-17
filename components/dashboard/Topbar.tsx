'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Sparkles } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function Topbar() {
  const { data: session } = useSession();
  
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || '';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B1120]/40 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#6366F1] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search reports, jobs, or skills..." 
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 px-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6366F1]/40 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition-all font-inter"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            <span>⌘</span><span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#6366F1] rounded-full border-2 border-[#0B1120] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        </motion.button>
        
        <div className="h-8 w-px bg-white/10 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-all border border-transparent hover:border-white/5">
            <Avatar className="h-9 w-9 border border-white/10 shadow-lg">
              <AvatarImage src={userImage} />
              <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#38BDF8] text-white text-xs font-black">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-sm font-black text-white tracking-tight">{userName}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <div className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest">Active Member</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111827] border-white/10 text-white w-64 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl">
            <div className="px-4 py-3">
              <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authenticated as</div>
              <div className="text-sm font-bold text-white truncate">{userEmail}</div>
            </div>
            <DropdownMenuSeparator className="bg-white/5 mx-2" />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="hover:bg-white/5 cursor-pointer rounded-xl py-2.5 px-3">
                <Settings className="w-4 h-4 mr-3 text-slate-400" /> 
                <span className="text-sm font-bold">Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer rounded-xl py-2.5 px-3">
               <User className="w-4 h-4 mr-3 text-slate-400" /> 
               <span className="text-sm font-bold">Public Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 mx-2" />
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

