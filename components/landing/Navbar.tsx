'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

type NavbarProps = {
  isAuthenticated?: boolean;
};

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Launchpad', href: '#launchpad' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass-panel rounded-full px-8 py-3 flex items-center justify-between border-white/10 transition-all duration-500 ${
          isScrolled ? 'bg-white/10 backdrop-blur-xl shadow-2xl' : 'bg-transparent border-transparent'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#6366F1] to-[#38BDF8] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black font-space-grotesk text-white tracking-tighter">
              <span className="bg-gradient-to-r from-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">MEDHA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-bold text-slate-400 hover:text-white transition-all duration-300 tracking-wide uppercase hover:-translate-y-0.5"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" prefetch>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full px-6 font-bold">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                  <Link href="/auth/login" prefetch>
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-full px-6 font-bold">
                    Login
                  </Button>
                </Link>
                <Button 
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-full px-6 flex items-center gap-2 group shadow-[0_0_30px_rgba(99,102,241,0.4)] font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Join Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-full left-0 right-0 p-6 md:hidden"
          >
            <div className="glass-panel rounded-[32px] p-8 space-y-8 flex flex-col items-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-2xl font-black text-white tracking-tight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-full h-px bg-white/10" />
              <div className="w-full space-y-4">
                <Link href="/auth/login" prefetch className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-white/10 text-white rounded-2xl py-7 text-lg font-bold">
                    Login
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    signIn('google', { callbackUrl: '/dashboard' });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#6366F1] text-white rounded-2xl py-7 text-lg font-bold shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                >
                  Join with Google
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
