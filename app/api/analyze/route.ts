import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Resume from '@/lib/db/models/Resume';
import Analysis from '@/lib/db/models/Analysis';
import UserSession from '@/lib/db/models/UserSession';
import NotificationEvent from '@/lib/db/models/NotificationEvent';
import { extractText } from '@/lib/utils/parser';
import { analyzeResume, buildDashboardAnalysisPayload } from '@/lib/ai/analyzeResume';

// CRITICAL: Force Node.js runtime for Vercel (pdf-parse, mammoth require Node.js)
export const runtime = 'nodejs';

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
  console.log('[ANALYZE] Request received - starting analysis');
  
  try {
    console.log('[ANALYZE] Getting session');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[ANALYZE] Unauthorized - no session');
      return jsonError(401, { error: 'Unauthorized' });
    }

    const userId = session.user.id;
    let resumeText = '';
    let fileName = '';
    let resumeId = '';

    const contentType = request.headers.get('content-type') || '';
    console.log('[ANALYZE] Content-Type:', contentType);

    try {
      await connectDB();
      console.log('[ANALYZE] Database connected');
    } catch (dbError) {
      console.error('[ANALYZE] Database connection failed:', dbError);
      return jsonError(502, { error: 'Database connection failed', code: 'DB_ERROR' });
    }

    try {
      if (contentType.includes('application/json')) {
        console.log('[ANALYZE] Parsing JSON body');
        const body = (await request.json()) as { resumeId?: string };
        resumeId = body.resumeId || '';

        if (!resumeId) {
          console.log('[ANALYZE] Missing resumeId');
          return jsonError(400, { error: 'Missing resumeId', code: 'MISSING_RESUME_ID' });
        }

        const resume = await Resume.findOne({ _id: resumeId, userId })
          .select({ resumeText: 1, fileName: 1 })
          .lean();
        if (!resume) {
          console.log('[ANALYZE] Resume not found:', resumeId);
          return jsonError(404, { error: 'Resume not found', code: 'RESUME_NOT_FOUND' });
        }

        resumeText = resume.resumeText;
        fileName = resume.fileName;
      } else if (contentType.includes('multipart/form-data')) {
        console.log('[ANALYZE] Processing multipart form data');
        const formData = await request.formData();
        const fileEntry = formData.get('file');

        if (!(fileEntry instanceof File)) {
          console.log('[ANALYZE] No file in form data');
          return jsonError(400, { error: 'No file provided', code: 'MISSING_FILE' });
        }

        console.log(`[ANALYZE] File received - name: ${fileEntry.name}, size: ${fileEntry.size} bytes`);

        const arrayBuffer = await fileEntry.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        console.log(`[ANALYZE] Buffer created - size: ${fileBuffer.length} bytes`);

        try {
          resumeText = await extractText(fileBuffer, fileEntry.name, fileEntry.type);
          console.log(`[ANALYZE] Extraction successful - text length: ${resumeText.length} chars`);
        } catch (extractErr) {
          console.error('[ANALYZE] Text extraction failed:', extractErr);
          return jsonError(422, { 
            error: 'Unable to extract text from this file. Please upload another resume format.',
            code: 'EXTRACTION_FAILED'
          });
        }

        fileName = fileEntry.name;

        try {
          console.log('[ANALYZE] Starting AI analysis');
          const coreAnalysis = await analyzeResume(resumeText);
          const analysisPreview = buildDashboardAnalysisPayload(resumeText, coreAnalysis);

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
          console.log('[ANALYZE] Resume created:', resumeId);

          const analysis = await Analysis.create({
            resumeId,
            userId,
            fileName,
            ...analysisPreview,
          });
          console.log('[ANALYZE] Analysis created:', analysis._id.toString());

          await UserSession.updateMany(
            { userId, active: true },
            { $set: { active: false, endedAt: new Date() } }
          );

          await UserSession.create({
            userId,
            active: true,
            analysisId: analysis._id.toString(),
            resumeId,
            fileName,
          });
          console.log('[ANALYZE] Session created');

          await NotificationEvent.create({
            userId,
            type: 'resume_analyzed',
            title: 'Resume analyzed',
            message: `${fileName} was analyzed and is ready to review.`,
          });

          console.log('[ANALYZE] Success - returning analysis');
          return NextResponse.json({
            success: true,
            analysisId: analysis._id.toString(),
            analysis: coreAnalysis,
            ...analysisPreview,
          });
        } catch (aiErr) {
          console.error('[ANALYZE] AI analysis failed:', aiErr);
          return jsonError(502, {
            error: 'AI analysis failed. Please try again.',
            code: 'AI_ANALYSIS_FAILED'
          });
        }
      } else {
        console.log('[ANALYZE] Invalid content type:', contentType);
        return jsonError(400, { error: 'Invalid request format', code: 'INVALID_REQUEST_FORMAT' });
      }
    } catch (parseErr) {
      console.error('[ANALYZE] Request parsing error:', parseErr);
      return jsonError(400, { error: 'Invalid request', code: 'INVALID_REQUEST' });
    }

    // Handle JSON body case
    if (!resumeText.trim()) {
      console.log('[ANALYZE] Resume content is empty');
      return jsonError(400, { error: 'Resume content is empty', code: 'EMPTY_RESUME' });
    }

    try {
      console.log('[ANALYZE] Analyzing resume from JSON');
      const coreAnalysis = await analyzeResume(resumeText);
      const analysisData = buildDashboardAnalysisPayload(resumeText, coreAnalysis);

      const analysis = await Analysis.create({
        resumeId,
        userId,
        fileName,
        ...analysisData,
      });

      await UserSession.updateMany(
        { userId, active: true },
        { $set: { active: false, endedAt: new Date() } }
      );

      await UserSession.create({
        userId,
        active: true,
        analysisId: analysis._id.toString(),
        resumeId,
        fileName,
      });

      await NotificationEvent.create({
        userId,
        type: 'suggestions_ready',
        title: 'Suggestions ready',
        message: 'Resume improvements and next steps are now available.',
      });

      console.log('[ANALYZE] Success');
      return NextResponse.json({
        success: true,
        analysisId: analysis._id.toString(),
        analysis: coreAnalysis,
        ...analysisData,
      });
    } catch (analysisErr) {
      console.error('[ANALYZE] Final analysis error:', analysisErr);
      return jsonError(500, {
        error: 'Pipeline processing failed. Please try again.',
        code: 'ANALYSIS_PIPELINE_FAILED'
      });
    }
  } catch (error: unknown) {
    console.error('[ANALYZE] CRITICAL ERROR:', error);
    
    // Ensure we always return JSON, never let error bubble up as HTML
    return jsonError(500, {
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
}
