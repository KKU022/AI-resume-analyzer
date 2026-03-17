import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';
import SavedJob from '@/lib/db/models/SavedJob';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [latest, history, savedJobs] = await Promise.all([
      Analysis.findOne({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean(),
      Analysis.find({ userId: session.user.id })
        .select({ _id: 1, fileName: 1, score: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      SavedJob.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean(),
    ]);

    const realSkills = Array.isArray((latest as { skills?: { matched?: string[] } } | null)?.skills?.matched)
      ? ((latest as { skills?: { matched?: string[] } }).skills?.matched || [])
      : Array.isArray((latest as { skillsDetected?: Array<{ name: string }> } | null)?.skillsDetected)
        ? (((latest as { skillsDetected?: Array<{ name: string }> }).skillsDetected || []).map((item) => item.name))
        : [];

    const missingSkills = Array.isArray((latest as { skills?: { missing?: string[] } } | null)?.skills?.missing)
      ? ((latest as { skills?: { missing?: string[] } }).skills?.missing || [])
      : Array.isArray((latest as { missingSkills?: Array<{ name: string }> } | null)?.missingSkills)
        ? (((latest as { missingSkills?: Array<{ name: string }> }).missingSkills || []).map((item) => item.name))
        : [];

    const jobMatches = Array.isArray((latest as { jobRecommendations?: unknown[] } | null)?.jobRecommendations)
      ? (latest as { jobRecommendations?: unknown[] }).jobRecommendations || []
      : [];

    const nextSteps = Array.isArray((latest as { nextSteps?: string[] } | null)?.nextSteps)
      ? (latest as { nextSteps?: string[] }).nextSteps || []
      : [];

    return NextResponse.json({
      realSkills,
      missingSkills,
      jobMatches,
      nextSteps,
      savedJobs,
      history,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard summary' }, { status: 500 });
  }
}
