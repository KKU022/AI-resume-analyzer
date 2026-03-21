import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import MissionProgress from '@/lib/db/models/MissionProgress';
import Analysis from '@/lib/db/models/Analysis';
import type { IMission } from '@/lib/db/models/MissionProgress';

type ApiError = {
  error: string;
  code?: string;
};

function jsonError(status: number, payload: ApiError) {
  return NextResponse.json(payload, { status });
}

function generateMissions(gap: string, bestRole: string, topSkills: string[]): IMission[] {
  const missions: IMission[] = [
    {
      day: 1,
      title: 'Resume Rewrite: Action + Scope + Metric',
      description: `Add concrete examples with metrics for ${gap}. Format: "Action verb + scope + quantified result". Start with one bullet point.`,
      completed: false,
    },
    {
      day: 2,
      title: 'Tailor Summary Section',
      description: `Rewrite your summary to highlight ${topSkills[0] || 'key skills'} and relevance to ${bestRole} roles. Keep to 2-3 sentences.`,
      completed: false,
    },
    {
      day: 3,
      title: 'Build Proof Project',
      description: `Create a small project or portfolio piece demonstrating ${gap}. Link it in your resume or GitHub profile.`,
      completed: false,
    },
    {
      day: 4,
      title: 'Mock Interview Prep',
      description: `Prepare answers for 3 behavioral questions about your ${topSkills[0] || 'strongest skill'} and experiences using the STAR method.`,
      completed: false,
    },
    {
      day: 5,
      title: 'Keyword Optimization',
      description: `Add industry keywords from ${bestRole} job postings to your resume. Use tools like jobscan or manually match JD terms.`,
      completed: false,
    },
    {
      day: 6,
      title: 'Cover Letter Personalization',
      description: `Draft a template cover letter highlighting why you're suited for ${bestRole} roles, mentioning specific achievements.`,
      completed: false,
    },
    {
      day: 7,
      title: 'Final Review & Polish',
      description: `Review entire resume for grammar, formatting consistency, and ATS-friendliness. Export to PDF and test on ATS scanners.`,
      completed: false,
    },
  ];

  return missions;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    await connectDB();

    const missionProgress = await MissionProgress.findOne({
      userId: session.user.id,
    }).lean();

    if (!missionProgress) {
      return NextResponse.json({
        missions: [],
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      });
    }

    return NextResponse.json(missionProgress);
  } catch (error: unknown) {
    console.error('Mission fetch error:', error);
    return jsonError(500, { error: 'Failed to fetch missions' });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    await connectDB();

    // Fetch latest analysis for mission generation
    const analysis = await Analysis.findOne({
      userId: session.user.id,
    })
      .select({
        missingSkills: 1,
        jobRecommendations: 1,
        skillsDetected: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!analysis) {
      return jsonError(400, {
        error: 'No resume analysis found. Please upload and analyze a resume first.',
      });
    }

    const topGap = (analysis.missingSkills?.[0] as string) || 'core skill';
    const bestRole = (analysis.jobRecommendations?.[0]?.role as string) || 'target role';
    const topSkills = (analysis.skillsDetected as string[]) || [];

    const missions = generateMissions(topGap, bestRole, topSkills);

    // Check if user already has an active mission progress
    let missionProgress = await MissionProgress.findOne({
      userId: session.user.id,
    });

    if (missionProgress) {
      // Reset missions for new 7-day cycle
      missionProgress.missions = missions;
      missionProgress.startDate = new Date();
      missionProgress.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      missionProgress = await missionProgress.save();
    } else {
      // Create new mission progress
      missionProgress = await MissionProgress.create({
        userId: session.user.id,
        missions,
        currentStreak: 0,
        longestStreak: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return NextResponse.json(missionProgress);
  } catch (error: unknown) {
    console.error('Mission creation error:', error);
    return jsonError(500, { error: 'Failed to create mission plan' });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    const body = await request.json();
    const { dayIndex } = body;

    if (typeof dayIndex !== 'number' || dayIndex < 0 || dayIndex > 6) {
      return jsonError(400, { error: 'Invalid day index' });
    }

    await connectDB();

    const missionProgress = await MissionProgress.findOne({
      userId: session.user.id,
    });

    if (!missionProgress) {
      return jsonError(404, { error: 'Mission progress not found' });
    }

    const mission = missionProgress.missions[dayIndex];
    if (!mission) {
      return jsonError(404, { error: 'Mission not found' });
    }

    const wasAlreadyCompleted = mission.completed;
    mission.completed = true;
    mission.completedAt = new Date();

    // Update streak logic
    const today = new Date().toDateString();
    const lastCompleted = missionProgress.lastCompletedDate?.toDateString();

    if (!wasAlreadyCompleted) {
      if (lastCompleted === today) {
        // Already completed one mission today, don't increase streak
      } else if (lastCompleted) {
        // Check if it was yesterday
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        if (lastCompleted === yesterday) {
          missionProgress.currentStreak += 1;
        } else {
          // Streak broken, reset
          missionProgress.currentStreak = 1;
        }
      } else {
        // First completion
        missionProgress.currentStreak = 1;
      }

      missionProgress.lastCompletedDate = new Date();

      // Update longest streak
      if (missionProgress.currentStreak > missionProgress.longestStreak) {
        missionProgress.longestStreak = missionProgress.currentStreak;
      }
    }

    await missionProgress.save();

    return NextResponse.json(missionProgress);
  } catch (error: unknown) {
    console.error('Mission update error:', error);
    return jsonError(500, { error: 'Failed to update mission' });
  }
}
