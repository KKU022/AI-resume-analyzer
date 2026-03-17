'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles, ArrowRight, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (!result?.url) {
        throw new Error('Could not start Google sign-in');
      }

      const popup = window.open(
        result.url,
        'google-auth',
        'width=520,height=700,scrollbars=yes,resizable=yes'
      );

      // Popup blocked: fallback to full redirect
      if (!popup) {
        window.location.href = result.url;
        return;
      }

      pollRef.current = setInterval(async () => {
        if (popup.closed) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          if (sessionData?.user) {
            router.push('/dashboard');
          } else {
            setGoogleLoading(false);
          }
        }
      }, 500);
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6366F1]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#38BDF8]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-10 rounded-[40px] border border-white/10 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="text-center space-y-4 mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold font-space-grotesk text-white">
            <Sparkles className="w-8 h-8 text-[#6366F1]" />
            <span>Resume<span className="text-[#38BDF8]">AI</span></span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Email Address</Label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#6366F1]/50" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Password</Label>
               <Link href="#" className="text-[10px] text-[#6366F1] font-bold hover:underline">Forgot?</Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#6366F1]/50" 
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] hover:bg-[#4f52e2] text-white h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#111827] px-4 text-slate-500">Or continue with</span></div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-11 flex items-center gap-2"
          >
            {googleLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Opening Google...</>
            ) : (
              <><Mail className="w-4 h-4" /> Sign in with Google</>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-[#6366F1] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
