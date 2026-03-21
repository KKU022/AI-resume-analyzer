import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';

type SearchItem = {
  title: string;
  description: string;
  route: string;
  tags: string[];
};

const SEARCH_INDEX: SearchItem[] = [
  {
    title: 'Dashboard overview',
    description: 'See current resume health and latest progress.',
    route: '/dashboard',
    tags: ['dashboard', 'overview', 'analysis'],
  },
  {
    title: 'Analysis report',
    description: 'Open your detailed resume insights and fixes.',
    route: '/dashboard/analysis',
    tags: ['analysis', 'report', 'resume tips', 'improve resume'],
  },
  {
    title: 'Skill gap',
    description: 'Find missing skills for your target role.',
    route: '/dashboard/skill-gap',
    tags: ['skill gap', 'skills', 'roadmap'],
  },
  {
    title: 'History',
    description: 'Browse and compare previous analysis reports.',
    route: '/dashboard/history',
    tags: ['history', 'reports', 'analysis'],
  },
  {
    title: 'Learning hub',
    description: 'Practical resume and career resources.',
    route: '/dashboard/resume-templates',
    tags: ['resume tips', 'learning', 'career guidance'],
  },
  {
    title: 'Role recommendations',
    description: 'See suggested roles and what to improve next.',
    route: '/dashboard/jobs',
    tags: ['roles', 'career role recommendation', 'match'],
  },
];

function scoreItem(item: SearchItem, q: string) {
  const text = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
  if (text.includes(q)) return 3;
  return item.tags.some((tag) => tag.includes(q) || q.includes(tag)) ? 2 : 0;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ results: SEARCH_INDEX.slice(0, 5) });
    }

    const staticResults = SEARCH_INDEX.map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    await connectDB();
    const history = await Analysis.find({ userId: session.user.id, fileName: { $regex: q, $options: 'i' } })
      .select({ _id: 1, fileName: 1, score: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const historyResults = history.map((item) => ({
      title: `History: ${item.fileName}`,
      description: `Open saved report (${item.score}% score).`,
      route: `/dashboard/analysis?id=${String(item._id)}`,
      tags: ['history', 'analysis'],
    }));

    return NextResponse.json({
      results: [...staticResults, ...historyResults].slice(0, 8),
    });
  } catch (error) {
    console.error('Search GET error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
