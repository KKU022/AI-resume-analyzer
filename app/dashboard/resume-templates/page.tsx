import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code2, Palette, GraduationCap, ArrowUpRight, type LucideIcon } from 'lucide-react';

type TemplateItem = {
  name: string;
  style: string;
  bestFor: string;
  sections: string[];
  tips: string[];
  sampleLink: string;
};

const templates: Array<{
  category: string;
  icon: LucideIcon;
  color: string;
  items: TemplateItem[];
}> = [
  {
    category: 'Developer',
    icon: Code2,
    color: '#38BDF8',
    items: [
      {
        name: 'Impact-First Engineer Resume',
        style: 'Single-column ATS-safe',
        bestFor: 'Frontend/Backend/Full-stack roles',
        sections: ['Summary', 'Skills Matrix', 'Projects with metrics', 'Experience', 'Education'],
        tips: [
          'Keep skills grouped by language, framework, and cloud tooling.',
          'Use quantified outcomes in every project bullet.',
          'Put strongest tech stack in the top third of the page.',
        ],
        sampleLink: '/dashboard/analysis',
      },
    ],
  },
  {
    category: 'Fresher',
    icon: GraduationCap,
    color: '#22C55E',
    items: [
      {
        name: 'Early-Career ATS Resume',
        style: 'Project-heavy one-page layout',
        bestFor: 'Internships and entry-level roles',
        sections: ['Career Objective', 'Projects', 'Internships', 'Skills', 'Education'],
        tips: [
          'Prioritize capstone and internship outcomes over tool lists.',
          'Add class projects that mirror real job requirements.',
          'Use concise action verbs and one-line impact statements.',
        ],
        sampleLink: '/dashboard/analysis?demo=true',
      },
    ],
  },
  {
    category: 'Designer',
    icon: Palette,
    color: '#F59E0B',
    items: [
      {
        name: 'Portfolio-Linked Designer Resume',
        style: 'ATS-safe with portfolio callouts',
        bestFor: 'Product, UX, UI, and visual design roles',
        sections: ['Profile', 'Selected Case Studies', 'Design Stack', 'Experience', 'Education'],
        tips: [
          'Link 2-3 case studies with measurable business outcomes.',
          'Mention collaboration with PM/engineering explicitly.',
          'Include accessibility and research methods where relevant.',
        ],
        sampleLink: '/dashboard/jobs',
      },
    ],
  },
];

export default function ResumeTemplatesPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-black text-white font-space-grotesk tracking-tight">Resume Templates</h1>
        <p className="text-slate-400 mt-2">
          Choose a template strategy by role, then adapt with your real analysis insights and ATS keywords.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {templates.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.category} className="bg-[#111827]/50 border-white/10 rounded-3xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{ borderColor: `${group.color}55`, background: `${group.color}22` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: group.color }} />
                  </div>
                  <CardTitle className="text-white text-xl">{group.category}</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Real-world format guidance designed to work with ATS parsing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {group.items.map((template) => (
                  <div key={template.name} className="space-y-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div>
                      <h3 className="text-white font-bold">{template.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{template.style}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Best For</p>
                      <p className="text-sm text-slate-300">{template.bestFor}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {template.sections.map((section) => (
                        <Badge key={section} variant="outline" className="border-white/15 text-slate-300 bg-white/[0.03]">
                          {section}
                        </Badge>
                      ))}
                    </div>

                    <ul className="space-y-1">
                      {template.tips.map((tip) => (
                        <li key={tip} className="text-sm text-slate-400">- {tip}</li>
                      ))}
                    </ul>

                    <Link href={template.sampleLink}>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl">
                        Open Relevant Workspace <ArrowUpRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
