import React from 'react';
import Link from 'next/link';
import { Sparkles, Twitter, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] border-t border-white/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-space-grotesk text-white">
              <Sparkles className="w-6 h-6 text-[#6366F1]" />
              <span>Resume<span className="text-[#38BDF8]">AI</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering developers and professionals to reach their peak career potential through data-driven AI insights.
            </p>
            <div className="flex gap-4">
               <Twitter className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
               <Github className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
               <Linkedin className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/analyzer" className="hover:text-white transition-colors">Resume Analyzer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest career tips and AI updates.</p>
            <form className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] flex-1 h-10"
              />
              <Button className="bg-[#6366F1] hover:bg-[#4f52e2] text-white px-4 py-2 rounded-lg font-medium transition-colors h-10">
                Join
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 text-center text-xs text-slate-500">
          <p suppressHydrationWarning>© {new Date().getFullYear()} ResumeAI Copilot. All rights reserved. Built with ❤️ for the future of work.</p>
        </div>
      </div>
    </footer>
  );
}
