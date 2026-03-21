import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import UserSession from '@/lib/db/models/UserSession';
import NotificationEvent from '@/lib/db/models/NotificationEvent';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const activeSession = await UserSession.findOne({
      userId: session.user.id,
      active: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      session: activeSession
        ? {
            id: String(activeSession._id),
            analysisId: activeSession.analysisId || null,
            resumeId: activeSession.resumeId || null,
            fileName: activeSession.fileName || null,
            startedAt: activeSession.startedAt,
            updatedAt: activeSession.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
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
      resumeId?: string;
      fileName?: string;
    };

    await connectDB();

    await UserSession.updateMany(
      { userId: session.user.id, active: true },
      { $set: { active: false, endedAt: new Date() } }
    );

    const created = await UserSession.create({
      userId: session.user.id,
      active: true,
      analysisId: body.analysisId,
      resumeId: body.resumeId,
      fileName: body.fileName,
      startedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      session: {
        id: String(created._id),
        analysisId: created.analysisId || null,
        resumeId: created.resumeId || null,
        fileName: created.fileName || null,
      },
    });
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const active = await UserSession.findOneAndUpdate(
      { userId: session.user.id, active: true },
      { $set: { active: false, endedAt: new Date() } },
      { new: true }
    ).lean();

    if (active) {
      await NotificationEvent.create({
        userId: session.user.id,
        type: 'session_saved',
        title: 'Session saved',
        message: 'Your latest analysis session has been saved to history.',
      });
    }

    return NextResponse.json({ success: true, ended: Boolean(active) });
  } catch (error) {
    console.error('Session DELETE error:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
