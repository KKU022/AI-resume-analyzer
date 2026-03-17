'use client';

import Link from 'next/link';
import { Sparkles, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-primary/60 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-space-grotesk text-white">
          <Sparkles className="w-6 h-6 text-brand-accent-ai" />
          <span>Resume<span className="text-brand-accent-data">AI</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="/analyzer">
            <Button className="bg-brand-accent-ai hover:bg-[#4f52e2] text-white rounded-full px-6 transition-all duration-300">
              Analyze Resume
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Drawer */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="right" className="bg-brand-secondary/95 backdrop-blur-xl border-l-white/10 text-white p-6">
              <div className="flex flex-col gap-8 mt-12 text-lg">
                <Link href="#features" className="font-medium hover:text-brand-accent-data transition-colors">Features</Link>
                <Link href="#how-it-works" className="font-medium hover:text-brand-accent-data transition-colors">How it Works</Link>
                <div className="h-px w-full bg-white/10" />
                <Link href="/analyzer" className="w-full">
                  <Button className="w-full bg-brand-accent-ai hover:bg-[#4f52e2] text-white rounded-lg h-12 text-lg">
                    Analyze Resume Now
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
