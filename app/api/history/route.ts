import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const analyses = await Analysis.find({ userId: session.user.id })
      .select({
        fileName: 1,
        score: 1,
        skillMatch: 1,
        createdAt: 1,
        atsCompatibility: 1,
        skills: 1,
        skillsDetected: 1,
        missingSkills: 1,
        nextSteps: 1,
        careerPaths: 1,
        jobRecommendations: 1,
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(analyses, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=45',
      },
    });
  } catch (error: unknown) {
    console.error('History fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
