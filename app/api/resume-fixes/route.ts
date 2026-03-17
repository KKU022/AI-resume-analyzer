import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';
import ResumeFix from '@/lib/db/models/ResumeFix';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    await connectDB();

    const query: Record<string, string> = { userId: session.user.id };
    if (analysisId) {
      query.analysisId = analysisId;
    }

    const fixes = await ResumeFix.find(query)
      .sort({ appliedAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ fixes });
  } catch (error) {
    console.error('Resume fixes GET error:', error);
    return NextResponse.json({ error: 'Failed to load resume fixes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      analysisId?: string;
      originalBullet?: string;
      improvedBullet?: string;
    };

    if (!body.analysisId || !body.originalBullet || !body.improvedBullet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const analysis = await Analysis.findOne({
      _id: body.analysisId,
      userId: session.user.id,
    })
      .select({ resumeId: 1 })
      .lean();

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const currentVersion = await ResumeFix.findOne({
      userId: session.user.id,
      resumeId: analysis.resumeId,
    })
      .sort({ version: -1 })
      .select({ version: 1 })
      .lean();

    const nextVersion = (currentVersion?.version || 0) + 1;

    const created = await ResumeFix.create({
      userId: session.user.id,
      resumeId: analysis.resumeId,
      analysisId: body.analysisId,
      version: nextVersion,
      originalBullet: body.originalBullet,
      improvedBullet: body.improvedBullet,
      appliedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      fix: {
        _id: created._id.toString(),
        version: created.version,
        originalBullet: created.originalBullet,
        improvedBullet: created.improvedBullet,
        appliedAt: created.appliedAt,
      },
    });
  } catch (error) {
    console.error('Resume fixes POST error:', error);
    return NextResponse.json({ error: 'Failed to apply resume fix' }, { status: 500 });
  }
}