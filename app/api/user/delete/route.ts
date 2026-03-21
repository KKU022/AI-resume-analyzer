import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import Resume from '@/lib/db/models/Resume';
import Analysis from '@/lib/db/models/Analysis';
import SavedJob from '@/lib/db/models/SavedJob';
import ResumeFix from '@/lib/db/models/ResumeFix';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();

    // Delete all related data in parallel
    await Promise.all([
      Resume.deleteMany({ userId }),
      Analysis.deleteMany({ userId }),
      SavedJob.deleteMany({ userId }),
      ResumeFix.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully.',
    });
  } catch (error: unknown) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
