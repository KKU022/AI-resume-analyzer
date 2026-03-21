import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Resume from '@/lib/db/models/Resume';
import Analysis from '@/lib/db/models/Analysis';
import UserSession from '@/lib/db/models/UserSession';
import NotificationEvent from '@/lib/db/models/NotificationEvent';
import { extractText } from '@/lib/utils/parser';
import { analyzeResumeText } from '@/lib/ai/analyze-resume';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt', 'md']);

type ApiError = {
  error: string;
  code: string;
};

function jsonError(status: number, payload: ApiError) {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonError(401, {
        error: 'Please sign in to upload and analyze a resume.',
        code: 'UNAUTHORIZED',
      });
    }

    const formData = await request.formData();
    const fileEntry = formData.get('file');

    if (!(fileEntry instanceof File)) {
      return jsonError(400, {
        error: 'No file was received. Please choose a resume file and try again.',
        code: 'MISSING_FILE',
      });
    }

    const ext = fileEntry.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return jsonError(400, {
        error: 'Unsupported format. Upload a PDF, DOCX, TXT, or MD file.',
        code: 'UNSUPPORTED_FORMAT',
      });
    }

    if (fileEntry.size > MAX_FILE_SIZE) {
      return jsonError(413, {
        error: 'File too large. Maximum allowed size is 10MB.',
        code: 'FILE_TOO_LARGE',
      });
    }

    const arrayBuffer = await fileEntry.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const resumeText = await extractText(fileBuffer, fileEntry.name, fileEntry.type);

    if (!resumeText.trim()) {
      return jsonError(400, {
        error: 'The uploaded file did not contain readable text.',
        code: 'EMPTY_EXTRACTED_TEXT',
      });
    }

    await connectDB();

    const analysisData = await analyzeResumeText(resumeText);
    const resume = await Resume.create({
      userId: session.user.id,
      fileName: fileEntry.name,
      resumeText,
      extractedSkills: analysisData.extracted?.skills || analysisData.skills?.matched || [],
      extractedProjects: analysisData.extracted?.projectLines || [],
      extractedExperience: analysisData.extracted?.experienceLines || [],
      analysisScore: analysisData.score,
    });

    const analysis = await Analysis.create({
      resumeId: resume._id.toString(),
      userId: session.user.id,
      fileName: fileEntry.name,
      ...analysisData,
    });

    await UserSession.updateMany(
      { userId: session.user.id, active: true },
      { $set: { active: false, endedAt: new Date() } }
    );

    await UserSession.create({
      userId: session.user.id,
      active: true,
      analysisId: analysis._id.toString(),
      resumeId: resume._id.toString(),
      fileName: fileEntry.name,
    });

    await NotificationEvent.create([
      {
        userId: session.user.id,
        type: 'resume_analyzed',
        title: 'Resume analyzed',
        message: `${fileEntry.name} was analyzed and is ready to review.`,
      },
      {
        userId: session.user.id,
        type: 'suggestions_ready',
        title: 'Suggestions ready',
        message: 'New resume improvements are available in your analysis report.',
      },
    ]);

    return NextResponse.json({
      success: true,
      resumeId: resume._id.toString(),
      analysisId: analysis._id.toString(),
      fileName: fileEntry.name,
      textLength: resumeText.length,
    });
  } catch (error: unknown) {
    console.error('Upload pipeline error:', error);

    const message = error instanceof Error ? error.message : 'Unknown upload error';

    if (message.toLowerCase().includes('unsupported file type')) {
      return jsonError(400, {
        error: 'Unsupported format. Upload a PDF, DOCX, TXT, or MD file.',
        code: 'UNSUPPORTED_FORMAT',
      });
    }

    if (message.toLowerCase().includes('failed to extract')) {
      return jsonError(422, {
        error: 'Could not extract text from this file. Try a clearer file or another format.',
        code: 'EXTRACTION_FAILED',
      });
    }

    if (message.toLowerCase().includes('openai') || message.toLowerCase().includes('analysis')) {
      return jsonError(502, {
        error: 'AI analysis is temporarily unavailable. Please try again shortly.',
        code: 'AI_ANALYSIS_FAILED',
      });
    }

    return jsonError(500, {
      error: 'Upload processing failed. Please retry in a moment.',
      code: 'UPLOAD_PIPELINE_FAILED',
    });
  }
}
