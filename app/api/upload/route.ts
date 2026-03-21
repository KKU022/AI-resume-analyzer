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

// CRITICAL: Force Node.js runtime for Vercel (pdf-parse, mammoth require Node.js)
export const runtime = 'nodejs';

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

    // DEBUG: Log file metadata for Vercel troubleshooting
    console.log(`[UPLOAD] File metadata - name: ${fileEntry.name}, size: ${fileEntry.size} bytes, type: ${fileEntry.type}, ext: ${ext}`);

    const arrayBuffer = await fileEntry.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    console.log(`[UPLOAD] Buffer created - size: ${fileBuffer.length} bytes, isBuffer: ${Buffer.isBuffer(fileBuffer)}`);

    let resumeText = '';
    try {
      resumeText = await extractText(fileBuffer, fileEntry.name, fileEntry.type);
    } catch (error) {
      console.error('[UPLOAD] Extraction failed:', error);
      resumeText = 'Resume text extraction produced limited output from this file.';
    }
    
    console.log(`[UPLOAD] Extraction successful - text length: ${resumeText.length} chars`);

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
      text: resumeText,
      resumeId: resume._id.toString(),
      analysisId: analysis._id.toString(),
      fileName: fileEntry.name,
      textLength: resumeText.length,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[UPLOAD] Pipeline error - message: ${errorMsg}, stack: ${error instanceof Error ? error.stack : 'N/A'}`);

    // Handle specific parsing errors
    if (errorMsg.toLowerCase().includes('unsupported file type')) {
      return jsonError(400, {
        error: 'Unsupported format. Upload a PDF, DOCX, TXT, or MD file.',
        code: 'UNSUPPORTED_FORMAT',
      });
    }

    // Handle AI analysis failures
    if (errorMsg.toLowerCase().includes('openai') || errorMsg.toLowerCase().includes('analysis')) {
      return jsonError(502, {
        error: 'AI analysis is temporarily unavailable. Please try again shortly.',
        code: 'AI_ANALYSIS_FAILED',
      });
    }

    // Handle general database errors
    if (errorMsg.toLowerCase().includes('mongodb') || errorMsg.toLowerCase().includes('database')) {
      return jsonError(502, {
        error: 'Database error. Please retry again shortly.',
        code: 'DATABASE_ERROR',
      });
    }

    // Generic catch-all with hint
    return jsonError(500, {
      error: 'Upload processing failed. Please retry with a different file.',
      code: 'UPLOAD_PIPELINE_FAILED',
    });
  }
}
