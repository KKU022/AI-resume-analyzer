import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import PremiumHero from '@/components/landing/PremiumHero';
import Footer from '@/components/landing/Footer';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import DeferredSection from '@/components/landing/DeferredSection';

const Features = dynamic(() => import('@/components/landing/Features'), {
  loading: () => <div className="h-72" />,
});

const InteractiveDemo = dynamic(
  () => import('@/components/landing/InteractiveDemo'),
  { loading: () => <div className="h-96" /> }
);

const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'), {
  loading: () => <div className="h-80" />,
});

const DashboardPreview = dynamic(
  () => import('@/components/landing/DashboardPreview'),
  { loading: () => <div className="h-96" /> }
);

export default function Home() {
  return (
    <div className="bg-[#0B1120] min-h-[500vh] selection:bg-[#6366F1]/30">
      <ScrollProgressBar />
      
      <Navbar />

      <PremiumHero />

      {/* Main Content Sections */}
      <main className="relative z-20 bg-[#0B1120]">
        {/* Divider Glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <section className="px-6 py-14 lg:py-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'The Problem',
                body: 'Most resumes sound strong but fail in screening because impact and role-signal are unclear.',
              },
              {
                title: 'What Medha Solves',
                body: 'Medha turns your resume into a clear report: what is working, what is missing, and what to fix first.',
              },
              {
                title: 'What You Can Do Next',
                body: 'Use role recommendations, skill-gap guidance, and improvement steps to move toward interviews faster.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <h3 className="text-white font-black text-lg">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div id="features">
        <DeferredSection minHeightClassName="min-h-[360px]">
          <Features />
        </DeferredSection>
        </div>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <DeferredSection minHeightClassName="min-h-[440px]">
          <InteractiveDemo />
        </DeferredSection>

        <div className="py-20 lg:py-40">
           <div className="text-center mb-24 space-y-4 px-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8]">
                Demo Preview
              </div>
              <h2 className="text-5xl md:text-7xl font-black font-space-grotesk text-white">See How <span className="text-[#38BDF8]">Medha</span> Guides You</h2>
           </div>
           <DeferredSection minHeightClassName="min-h-[420px]">
             <DashboardPreview />
           </DeferredSection>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works">
        <DeferredSection minHeightClassName="min-h-[420px]">
          <HowItWorks />
        </DeferredSection>
        </div>
        
        {/* Launchpad Section */}
        <section id="launchpad" className="py-40 px-6 relative overflow-hidden">
           {/* Background Glows */}
           <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/10 blur-[120px] rounded-full" />
           <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#38BDF8]/10 blur-[120px] rounded-full" />
           
           <div className="max-w-6xl mx-auto glass-panel p-12 md:p-20 rounded-[60px] text-center space-y-12 relative overflow-hidden border border-white/10 group hover:border-[#6366F1]/30 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E] mb-2">
                Career Launchpad
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black font-space-grotesk text-white leading-tight tracking-tighter">
                Build a smarter path <br />
                <span className="text-gradient">from analysis to interviews</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium">
                Turn insights into action with guided checkpoints, role alignment, and interview-readiness milestones.
              </p>

              <div className="grid md:grid-cols-3 gap-4 text-left">
                {[
                  {
                    title: '90-Second Resume Signal',
                    body: 'See clarity, impact, and ATS strength in one focused snapshot before you apply.',
                  },
                  {
                    title: 'Role Match Navigator',
                    body: 'Map your profile to the best-fit job families and prioritize opportunities with confidence.',
                  },
                  {
                    title: 'Weekly Skill Sprint',
                    body: 'Get a practical upskilling sequence so your resume and interviews improve together.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl hover:bg-white/[0.07] transition-colors duration-300">
                    <h3 className="text-white font-black text-lg">{item.title}</h3>
                    <p className="text-slate-300 text-sm mt-3 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-6">
                <a 
                  href="/auth/login" 
                  className="px-16 py-8 bg-[#6366F1] hover:bg-[#4f52e2] text-white font-black text-2xl rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(99,102,241,0.5)] inline-block group"
                >
                  Open Your Launchpad <span className="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
                </a>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

