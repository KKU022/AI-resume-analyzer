'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BriefcaseBusiness,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

type RoleItem = {
  role: string;
  match: number;
  whyItFits: string;
  missingSkills: string[];
  nextSteps: string[];
};

type RolesResponse = {
  roles: RoleItem[];
  userSkills: string[];
};

export default function JobsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/roles');
      if (!res.ok) {
        throw new Error('Failed to load role recommendations');
      }

      const payload = (await res.json()) as RolesResponse;
      setRoles(payload.roles || []);
      setUserSkills(payload.userSkills || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-space-grotesk text-white">Career Role Recommendation</h1>
          <p className="text-slate-400 mt-2">
            Realistic role suggestions based on your current resume evidence.
          </p>
          <p className="text-xs text-[#38BDF8] mt-2">
            Detected profile skills: {userSkills.length > 0 ? userSkills.slice(0, 8).join(', ') : 'No skills detected yet. Upload a resume to get accurate role fit.'}
          </p>
        </div>
        <Button onClick={() => void loadRoles()} className="bg-[#6366F1] hover:bg-[#4f52e2] text-white rounded-xl h-12">
          Refresh Recommendations
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl">
          <p className="text-red-200 text-sm font-bold">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin" /> Building role recommendations from your latest analysis...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role.role} className="bg-white/5 border-white/10 rounded-3xl">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <BriefcaseBusiness className="w-5 h-5 text-[#6366F1]" /> {role.role}
                  </CardTitle>
                  <span className="text-[#22C55E] font-black text-lg">{role.match}%</span>
                </div>
                <p className="text-sm text-slate-300">{role.whyItFits}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#F59E0B] mb-2">
                    <AlertTriangle className="w-3 h-3" /> Missing skills
                  </div>
                  <div className="text-sm text-slate-300">
                    {role.missingSkills.length > 0 ? role.missingSkills.join(', ') : 'No major missing skills for this role.'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#38BDF8] mb-2">
                    <Compass className="w-3 h-3" /> Next steps
                  </div>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {role.nextSteps.map((step) => (
                      <li key={step} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-[#22C55E]" /> {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          {roles.length === 0 && (
            <Card className="col-span-full bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <BriefcaseBusiness className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h4 className="text-white font-bold">No role recommendations yet</h4>
                <p className="text-xs text-slate-500">Upload and analyze your resume first to generate role intelligence.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="p-10 rounded-[40px] bg-gradient-to-r from-[#6366F1]/10 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold font-space-grotesk text-white leading-tight">Want higher role-fit scores?</h3>
          <p className="text-slate-400 text-sm max-w-lg">Apply resume fixes from your analysis report, then refresh this page to see role match improvements.</p>
        </div>
        <Link href="/dashboard/analysis" prefetch>
          <Button className="bg-white text-[#0B1120] hover:bg-slate-200 px-8 py-6 rounded-full font-bold text-md">
            Open Resume Improvements
          </Button>
        </Link>
      </div>
    </div>
  );
}
