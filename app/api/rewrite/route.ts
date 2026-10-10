import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rewriteBulletWithGrok } from '@/lib/ai/grok';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { originalBullet?: string; targetRole?: string };
    const originalBullet = body.originalBullet?.trim();

    if (!originalBullet) {
      return NextResponse.json({ error: 'originalBullet is required' }, { status: 400 });
    }

    const rewriteResult = await rewriteBulletWithGrok(originalBullet, body.targetRole);
    return NextResponse.json({ success: true, ...rewriteResult });
  } catch (error) {
    console.error('[REWRITE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite bullet' },
      { status: 500 }
    );
  }
}
