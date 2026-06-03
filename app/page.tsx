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
    <div className="min-h-[500vh] selection:bg-[#7dd3fc]/25">
      <ScrollProgressBar />
      
      <Navbar />

      <PremiumHero />

      {/* Main Content Sections */}
      <main className="relative z-20">
        <section className="px-6 py-14 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {[
              {
                title: 'What breaks first',
                body: 'Strong resumes still get filtered out when impact, structure, and role keywords do not land fast enough.',
              },
              {
                title: 'What Medha changes',
                body: 'Medha turns your resume into a guided workspace with clear scores, visible gaps, and concrete next moves.',
              },
              {
                title: 'What happens next',
                body: 'Upload once, review the signal, and move into the dashboard with a plan instead of guesswork.',
              },
            ].map((item, index) => (
              <div key={item.title} className="surface-panel p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-black text-white">
                  0{index + 1}
                </div>
                <h3 className="text-lg font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div id="features">
          <DeferredSection minHeightClassName="min-h-[360px]">
            <Features />
          </DeferredSection>
        </div>

        <DeferredSection minHeightClassName="min-h-[440px]">
          <InteractiveDemo />
        </DeferredSection>

        <div className="py-20 lg:py-40">
           <div className="mb-24 space-y-4 px-6 text-center">
              <div className="inline-block rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#38BDF8]">
                Demo Preview
              </div>
              <h2 className="text-5xl font-black text-white md:text-7xl">See how <span className="text-[#38BDF8]">Medha</span> guides you</h2>
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
           
            <div className="max-w-6xl mx-auto glass-panel p-12 md:p-20 rounded-[44px] text-center space-y-12 relative overflow-hidden border border-white/10 group hover:border-[#6366F1]/30 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E] mb-2">
                Career Launchpad
              </div>
              
              <h2 className="text-5xl font-black font-space-grotesk text-white leading-tight tracking-tighter md:text-7xl">
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

