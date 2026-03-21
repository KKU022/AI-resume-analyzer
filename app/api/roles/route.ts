import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';

type RoleTemplate = {
  role: string;
  requiredSkills: string[];
  rationale: string;
  nextSteps: string[];
};

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    role: 'Frontend Engineer',
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Testing'],
    rationale: 'Your profile shows product-facing implementation and UI delivery potential.',
    nextSteps: ['Add one performance-focused project bullet', 'Show reusable component architecture', 'Highlight testing outcomes'],
  },
  {
    role: 'Full Stack Engineer',
    requiredSkills: ['React', 'Node.js', 'REST API', 'MongoDB', 'TypeScript'],
    rationale: 'You have cross-layer signals across API work and front-end delivery.',
    nextSteps: ['Add one end-to-end project with metrics', 'Clarify backend ownership scope', 'Include deployment details'],
  },
  {
    role: 'Backend Engineer',
    requiredSkills: ['Node.js', 'REST API', 'PostgreSQL', 'Docker', 'System Design'],
    rationale: 'Your resume can be positioned for service reliability and API depth.',
    nextSteps: ['Add latency or throughput metrics', 'Show DB design decisions', 'Include observability or monitoring tools'],
  },
  {
    role: 'Data Analyst',
    requiredSkills: ['SQL', 'Python', 'Data Visualization', 'Excel', 'Statistics'],
    rationale: 'You can align your profile to insight generation and business decision support.',
    nextSteps: ['Add one dashboard project result', 'Quantify decisions influenced', 'List analysis tools used'],
  },
  {
    role: 'Product Engineer',
    requiredSkills: ['React', 'Experimentation', 'Analytics', 'A/B Testing', 'Communication'],
    rationale: 'You show practical build-and-ship potential with user-impact framing.',
    nextSteps: ['Add user impact metrics', 'Show collaboration with product/design', 'Call out iteration speed wins'],
  },
];

function normalizedSkills(latest: any): string[] {
  const explicit = Array.isArray(latest?.skills?.matched) ? latest.skills.matched : [];
  const detected = Array.isArray(latest?.skillsDetected)
    ? latest.skillsDetected.map((item: { name: string }) => item.name)
    : [];
  return Array.from(new Set([...explicit, ...detected]));
}

function calculateMatch(userSkills: string[], roleSkills: string[]) {
  if (roleSkills.length === 0) {
    return { match: 0, missing: [] as string[] };
  }
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const matched = roleSkills.filter((s) => userSet.has(s.toLowerCase()));
  const missing = roleSkills.filter((s) => !userSet.has(s.toLowerCase()));
  return {
    match: Math.round((matched.length / roleSkills.length) * 100),
    missing,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const latest = await Analysis.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select({ skills: 1, skillsDetected: 1 })
      .lean();

    const userSkills = normalizedSkills(latest);

    const roles = ROLE_TEMPLATES.map((item) => {
      const { match, missing } = calculateMatch(userSkills, item.requiredSkills);
      return {
        role: item.role,
        match,
        whyItFits: item.rationale,
        missingSkills: missing,
        nextSteps: item.nextSteps,
      };
    })
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);

    return NextResponse.json({
      userSkills,
      roles,
    });
  } catch (error) {
    console.error('Roles GET error:', error);
    return NextResponse.json({ error: 'Failed to load role recommendations' }, { status: 500 });
  }
}
