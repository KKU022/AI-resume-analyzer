import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import NotificationEvent from '@/lib/db/models/NotificationEvent';
import User from '@/lib/db/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [user, events] = await Promise.all([
      User.findById(session.user.id).select({ notificationsEnabled: 1 }).lean(),
      NotificationEvent.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    return NextResponse.json({
      notificationsEnabled: user?.notificationsEnabled !== false,
      events: events.map((event) => ({
        id: String(event._id),
        type: event.type,
        title: event.title,
        message: event.message,
        read: event.read,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      notificationsEnabled?: boolean;
      markAllRead?: boolean;
    };

    await connectDB();

    if (typeof body.notificationsEnabled === 'boolean') {
      await User.updateOne(
        { _id: session.user.id },
        { $set: { notificationsEnabled: body.notificationsEnabled } }
      );
    }

    if (body.markAllRead) {
      await NotificationEvent.updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
