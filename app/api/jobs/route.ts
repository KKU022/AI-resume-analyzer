import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';
import SavedJob from '@/lib/db/models/SavedJob';

type ResumeSkill = { name: string; level: number };

type NormalizedJob = {
  externalId: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  url: string;
  skills: string[];
  match: number;
};

const SKILL_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'JavaScript', pattern: /\bjavascript\b/i },
  { name: 'TypeScript', pattern: /\btypescript\b/i },
  { name: 'React', pattern: /\breact(?:\.js)?\b/i },
  { name: 'Next.js', pattern: /\bnext\.?js\b/i },
  { name: 'Node.js', pattern: /\bnode\.?js\b/i },
  { name: 'Express', pattern: /\bexpress\b/i },
  { name: 'MongoDB', pattern: /\bmongodb\b/i },
  { name: 'PostgreSQL', pattern: /\bpostgres(?:ql)?\b/i },
  { name: 'REST API', pattern: /\brest(?:ful)?\b|\bapi\b/i },
  { name: 'GraphQL', pattern: /\bgraphql\b/i },
  { name: 'Tailwind CSS', pattern: /\btailwind\b/i },
  { name: 'Docker', pattern: /\bdocker\b/i },
  { name: 'AWS', pattern: /\baws\b|amazon web services/i },
  { name: 'CI/CD', pattern: /\bci\/?cd\b|continuous integration/i },
  { name: 'Python', pattern: /\bpython\b/i },
  { name: 'Java', pattern: /\bjava\b/i },
  { name: 'Testing', pattern: /\bjest\b|\bcypress\b|\bunit test/i },
];

function detectSkills(text: string): string[] {
  const matches = SKILL_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.name);
  return Array.from(new Set(matches));
}

function computeMatch(userSkills: string[], jobSkills: string[]): number {
  if (jobSkills.length === 0 || userSkills.length === 0) {
    return 0;
  }

  const userSet = new Set(userSkills);
  const matched = jobSkills.filter((skill) => userSet.has(skill)).length;
  return Math.max(0, Math.min(100, Math.round((matched / jobSkills.length) * 100)));
}

async function fetchAdzunaJobs(query: string): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) return [];

  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(query)}&results_per_page=20`,
      { cache: 'no-store' }
    );

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      results?: Array<{
        id?: string;
        title?: string;
        company?: { display_name?: string };
        location?: { display_name?: string };
        salary_min?: number;
        salary_max?: number;
        description?: string;
        redirect_url?: string;
      }>;
    };

    return (payload.results || []).map((job) => {
      const description = `${job.title || ''} ${job.description || ''}`;
      const skills = detectSkills(description.toLowerCase());
      const salary =
        job.salary_min && job.salary_max
          ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
          : 'Not disclosed';

      return {
        externalId: String(job.id || `adzuna-${Date.now()}`),
        title: job.title || 'Untitled Role',
        company: job.company?.display_name || 'Unknown Company',
        salary,
        location: job.location?.display_name || 'US',
        url: job.redirect_url || '',
        skills,
        match: 0,
      };
    });
  } catch {
    return [];
  }
}

async function fetchJSearchJobs(query: string): Promise<NormalizedJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch('https://jsearch.p.rapidapi.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
      body: JSON.stringify({ query, page: 1, num_pages: 1, date_posted: 'month' }),
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      data?: Array<{
        job_id?: string;
        job_title?: string;
        employer_name?: string;
        job_city?: string;
        job_country?: string;
        job_salary_min?: number;
        job_salary_max?: number;
        job_description?: string;
        job_apply_link?: string;
      }>;
    };

    return (payload.data || []).slice(0, 20).map((job) => {
      const description = `${job.job_title || ''} ${job.job_description || ''}`;
      const skills = detectSkills(description.toLowerCase());
      const salary =
        job.job_salary_min && job.job_salary_max
          ? `$${(job.job_salary_min / 1000).toFixed(0)}k - $${(job.job_salary_max / 1000).toFixed(0)}k`
          : 'Not disclosed';

      return {
        externalId: String(job.job_id || `jsearch-${Date.now()}`),
        title: job.job_title || 'Untitled Role',
        company: job.employer_name || 'Unknown Company',
        salary,
        location: `${job.job_city || 'Remote'}, ${job.job_country || 'US'}`,
        url: job.job_apply_link || '',
        skills,
        match: 0,
      };
    });
  } catch {
    return [];
  }
}

async function fetchRemotiveJobs(query: string): Promise<NormalizedJob[]> {
  try {
    const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as {
      jobs?: Array<{
        id?: number;
        title?: string;
        company_name?: string;
        salary?: string;
        candidate_required_location?: string;
        url?: string;
        description?: string;
      }>;
    };

    return (payload.jobs || []).slice(0, 20).map((job) => {
      const description = `${job.title || ''} ${job.description || ''}`;
      const skills = detectSkills(description.toLowerCase());

      return {
        externalId: String(job.id || `remotive-${Date.now()}`),
        title: job.title || 'Untitled Role',
        company: job.company_name || 'Unknown Company',
        salary: job.salary?.trim() || 'Not disclosed',
        location: job.candidate_required_location || 'Remote',
        url: job.url || '',
        skills,
        match: 0,
      };
    });
  } catch {
    return [];
  }
}

function getFallbackJobs(query: string): NormalizedJob[] {
  const q = query.toLowerCase();
  const frontend: NormalizedJob[] = [
    {
      externalId: 'fallback-fe-1',
      title: 'Senior Frontend Engineer',
      company: 'Stripe',
      salary: '$150k - $200k',
      location: 'San Francisco, CA',
      url: 'https://stripe.com/careers',
      skills: ['React', 'TypeScript', 'Next.js', 'Testing'],
      match: 0,
    },
    {
      externalId: 'fallback-fe-2',
      title: 'React Developer',
      company: 'Vercel',
      salary: '$140k - $180k',
      location: 'Remote',
      url: 'https://vercel.com/careers',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      match: 0,
    },
  ];

  const backend: NormalizedJob[] = [
    {
      externalId: 'fallback-be-1',
      title: 'Backend Engineer',
      company: 'AWS',
      salary: '$170k - $220k',
      location: 'Remote',
      url: 'https://aws.amazon.com/careers',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      match: 0,
    },
  ];

  const fullstack: NormalizedJob[] = [
    {
      externalId: 'fallback-fs-1',
      title: 'Full Stack Engineer',
      company: 'Notion',
      salary: '$160k - $210k',
      location: 'San Francisco, CA',
      url: 'https://notion.so/careers',
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      match: 0,
    },
  ];

  if (q.includes('frontend') || q.includes('react')) return frontend;
  if (q.includes('backend') || q.includes('node')) return backend;
  if (q.includes('fullstack') || q.includes('full stack')) return fullstack;
  return [frontend[0], backend[0]];
}

async function fetchAllJobs(query: string): Promise<NormalizedJob[]> {
  const adzuna = await fetchAdzunaJobs(query);
  if (adzuna.length > 0) return adzuna;

  const jsearch = await fetchJSearchJobs(query);
  if (jsearch.length > 0) return jsearch;

  const remotive = await fetchRemotiveJobs(query);
  if (remotive.length > 0) return remotive;

  return getFallbackJobs(query);
}

async function loadUserSkills(userId: string): Promise<string[]> {
  const latest = await Analysis.findOne({ userId }).select({ skillsDetected: 1, skills: 1 }).sort({ createdAt: -1 }).lean();
  if (!latest) return [];

  const explicit = Array.isArray((latest as { skills?: { matched?: string[] } }).skills?.matched)
    ? (latest as { skills?: { matched?: string[] } }).skills?.matched || []
    : [];

  if (explicit.length > 0) return explicit;

  return Array.isArray((latest as { skillsDetected?: ResumeSkill[] }).skillsDetected)
    ? ((latest as { skillsDetected?: ResumeSkill[] }).skillsDetected || []).map((item) => item.name)
    : [];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'frontend developer';

    await connectDB();

    const [userSkills, savedJobs, remoteJobs] = await Promise.all([
      loadUserSkills(session.user.id),
      SavedJob.find({ userId: session.user.id }).select({ externalId: 1 }).lean(),
      fetchAllJobs(query),
    ]);

    const savedSet = new Set(savedJobs.map((item) => item.externalId));

    const rankedJobs = remoteJobs
      .map((job) => ({
        ...job,
        match: computeMatch(userSkills, job.skills),
        saved: savedSet.has(job.externalId),
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 12);

    return NextResponse.json(
      {
        jobs: rankedJobs,
        userSkills,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      externalId?: string;
      title?: string;
      company?: string;
      salary?: string;
      location?: string;
      url?: string;
      skills?: string[];
      match?: number;
    };

    if (!body.externalId || !body.title || !body.company || !body.url) {
      return NextResponse.json({ error: 'Missing required job fields' }, { status: 400 });
    }

    await connectDB();

    const saved = await SavedJob.findOneAndUpdate(
      { userId: session.user.id, externalId: body.externalId },
      {
        $set: {
          userId: session.user.id,
          externalId: body.externalId,
          title: body.title,
          company: body.company,
          salary: body.salary || 'Not disclosed',
          location: body.location || 'Remote',
          url: body.url,
          skills: Array.isArray(body.skills) ? body.skills : [],
          match: typeof body.match === 'number' ? body.match : 0,
          applied: false,
          status: 'saved',
          appliedAt: null,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ success: true, savedJob: saved });
  } catch (error) {
    console.error('Jobs POST error:', error);
    return NextResponse.json({ error: 'Failed to save job' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get('externalId');

    if (!externalId) {
      return NextResponse.json({ error: 'Missing externalId' }, { status: 400 });
    }

    await connectDB();
    await SavedJob.deleteOne({ userId: session.user.id, externalId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Jobs DELETE error:', error);
    return NextResponse.json({ error: 'Failed to unsave job' }, { status: 500 });
  }
}
