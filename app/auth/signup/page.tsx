'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles, ArrowRight, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create the account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Auto sign in after successful signup
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Account created! Please log in manually.');
        router.push('/auth/login');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#6366F1]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#38BDF8]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-lg w-full glass-panel p-10 rounded-[40px] border border-white/10 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="text-center space-y-4 mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold font-space-grotesk text-white">
            <Sparkles className="w-8 h-8 text-[#6366F1]" />
            <span>Resume<span className="text-[#38BDF8]">AI</span></span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Start your climb</h1>
            <p className="text-slate-400 text-sm">Join 10,000+ pros building the future with AI.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">First Name</Label>
                <Input 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#6366F1]/50" 
                />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Last Name</Label>
                <Input 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#6366F1]/50" 
                />
             </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Work Email</Label>
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
            <Label className="text-slate-400 text-xs uppercase font-bold tracking-widest ml-1">Password</Label>
            <Input 
              type="password" 
              placeholder="Min 8 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:border-[#6366F1]/50" 
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/10">
             <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0" />
             <p className="text-[10px] text-slate-400 leading-relaxed">By signing up, you agree to our processing of personal data in accordance with our Privacy Policy and GDPR standards.</p>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] hover:bg-[#4f52e2] text-white h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#111827] px-4 text-slate-500">Sign up with</span></div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            onClick={handleGoogleSignIn}
            className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-11 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Sign up with Google
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          Already have an account? <Link href="/auth/login" className="text-[#6366F1] font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
