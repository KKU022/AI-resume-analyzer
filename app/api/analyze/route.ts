import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Resume from '@/lib/db/models/Resume';
import Analysis from '@/lib/db/models/Analysis';
import { extractText } from '@/lib/utils/parser';
import { analyzeResumeText } from '@/lib/ai/analyze-resume';

type ApiError = {
  error: string;
  code?: string;
};

function jsonError(status: number, payload: ApiError) {
  return NextResponse.json(payload, { status });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return jsonError(400, { error: 'Missing id parameter' });
    }

    await connectDB();
    const analysis = await Analysis.findOne({
      _id: id,
      userId: session.user.id,
    })
      .select({
        score: 1,
        skillMatch: 1,
        experienceStrength: 1,
        atsCompatibility: 1,
        ats: 1,
        skills: 1,
        extracted: 1,
        insights: 1,
        nextSteps: 1,
        problems: 1,
        improvements: 1,
        opportunities: 1,
        careerPaths: 1,
        skillsDetected: 1,
        missingSkills: 1,
        suggestions: 1,
        jobRecommendations: 1,
        careerRoadmap: 1,
        interviewQuestions: 1,
        fileName: 1,
        createdAt: 1,
      })
      .lean();

    if (!analysis) {
      return jsonError(404, { error: 'Analysis not found' });
    }

    return NextResponse.json(analysis, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
      },
    });
  } catch (error: unknown) {
    console.error('Analysis fetch error:', error);
    return jsonError(500, { error: 'Failed to fetch analysis' });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, { error: 'Unauthorized' });
    }

    const userId = session.user.id;
    let resumeText = '';
    let fileName = '';
    let resumeId = '';

    const contentType = request.headers.get('content-type') || '';

    await connectDB();

    if (contentType.includes('application/json')) {
      const body = (await request.json()) as { resumeId?: string };
      resumeId = body.resumeId || '';

      if (!resumeId) {
        return jsonError(400, { error: 'Missing resumeId', code: 'MISSING_RESUME_ID' });
      }

      const resume = await Resume.findOne({ _id: resumeId, userId })
        .select({ resumeText: 1, fileName: 1 })
        .lean();
      if (!resume) {
        return jsonError(404, { error: 'Resume not found', code: 'RESUME_NOT_FOUND' });
      }

      resumeText = resume.resumeText;
      fileName = resume.fileName;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const fileEntry = formData.get('file');

      if (!(fileEntry instanceof File)) {
        return jsonError(400, { error: 'No file provided', code: 'MISSING_FILE' });
      }

      const arrayBuffer = await fileEntry.arrayBuffer();
      resumeText = await extractText(Buffer.from(arrayBuffer), fileEntry.name, fileEntry.type);
      fileName = fileEntry.name;

      const analysisPreview = await analyzeResumeText(resumeText);
      const resume = await Resume.create({
        userId,
        fileName,
        resumeText,
        extractedSkills: analysisPreview.extracted?.skills || analysisPreview.skills?.matched || [],
        extractedProjects: analysisPreview.extracted?.projectLines || [],
        extractedExperience: analysisPreview.extracted?.experienceLines || [],
        analysisScore: analysisPreview.score,
      });
      resumeId = resume._id.toString();

      const analysis = await Analysis.create({
        resumeId,
        userId,
        fileName,
        ...analysisPreview,
      });

      return NextResponse.json({
        success: true,
        analysisId: analysis._id.toString(),
        ...analysisPreview,
      });
    } else {
      return jsonError(400, { error: 'Invalid request format', code: 'INVALID_REQUEST_FORMAT' });
    }

    if (!resumeText.trim()) {
      return jsonError(400, { error: 'Resume content is empty', code: 'EMPTY_RESUME' });
    }

    const analysisData = await analyzeResumeText(resumeText);

    const analysis = await Analysis.create({
      resumeId,
      userId,
      fileName,
      ...analysisData,
    });

    return NextResponse.json({
      success: true,
      analysisId: analysis._id.toString(),
      ...analysisData,
    });
  } catch (error: unknown) {
    console.error('Final analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown analysis error';

    if (message.toLowerCase().includes('extract')) {
      return jsonError(422, {
        error: 'Unable to extract text from this file. Please upload another resume format.',
        code: 'EXTRACTION_FAILED',
      });
    }

    return jsonError(500, {
      error: 'Pipeline processing failed. Please try again.',
      code: 'ANALYSIS_PIPELINE_FAILED',
    });
  }
}
