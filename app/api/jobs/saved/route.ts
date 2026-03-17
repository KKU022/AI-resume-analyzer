import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import SavedJob from '@/lib/db/models/SavedJob';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const savedJobs = await SavedJob.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ savedJobs });
  } catch (error) {
    console.error('Saved jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to load saved jobs' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      externalId?: string;
      applied?: boolean;
    };

    if (!body.externalId) {
      return NextResponse.json({ error: 'Missing externalId' }, { status: 400 });
    }

    await connectDB();

    const nextApplied = Boolean(body.applied);
    const updated = await SavedJob.findOneAndUpdate(
      { userId: session.user.id, externalId: body.externalId },
      {
        $set: {
          applied: nextApplied,
          status: nextApplied ? 'applied' : 'saved',
          appliedAt: nextApplied ? new Date() : null,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Saved job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, savedJob: updated });
  } catch (error) {
    console.error('Saved jobs PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update applied status' }, { status: 500 });
  }
}
