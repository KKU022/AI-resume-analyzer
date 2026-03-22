import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Resume from '@/lib/db/models/Resume';
import Analysis from '@/lib/db/models/Analysis';
import UserSession from '@/lib/db/models/UserSession';
import NotificationEvent from '@/lib/db/models/NotificationEvent';
import { assessResumeTextQuality, extractText } from '@/lib/utils/parser';
import { analyzeResume, buildDashboardAnalysisPayload } from '@/lib/ai/analyzeResume';

// CRITICAL: Force Node.js runtime for Vercel (pdf-parse, mammoth require Node.js)
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt', 'md']);
const LOW_QUALITY_EXTRACTION_PATTERN = /resume text extraction produced limited output/i;

async function createDegradedNotification(userId: string, fileName: string, reason: string) {
  try {
    await connectDB();
    await NotificationEvent.create({
      userId,
      type: 'analysis_degraded',
      title: 'Analysis quality warning',
      message: `${fileName}: analysis degraded (${reason}). Upload a cleaner text-based resume for accurate AI scoring.`,
    });
  } catch (error) {
    console.error('[UPLOAD] Failed to create degraded notification:', error);
  }
}

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
      const reason = error instanceof Error ? error.message : 'Unknown extraction error';
      await createDegradedNotification(session.user.id, fileEntry.name, `EXTRACTION_FAILED: ${reason}`);
      return NextResponse.json({
        success: true,
        degraded: true,
        code: 'EXTRACTION_FAILED',
        reason,
        fileName: fileEntry.name,
        message:
          'We could not reliably extract resume text from this file. Please upload a text-based PDF/DOCX/TXT or a clearer document.',
      });
    }
    
    console.log(`[UPLOAD] Extraction successful - text length: ${resumeText.length} chars`);

    if (!resumeText.trim()) {
      return jsonError(400, {
        error: 'The uploaded file did not contain readable text.',
        code: 'EMPTY_EXTRACTED_TEXT',
      });
    }

    if (LOW_QUALITY_EXTRACTION_PATTERN.test(resumeText)) {
      await createDegradedNotification(session.user.id, fileEntry.name, 'LOW_QUALITY_EXTRACTED_TEXT: parser placeholder detected');
      return NextResponse.json({
        success: true,
        degraded: true,
        code: 'LOW_QUALITY_EXTRACTED_TEXT',
        reason: 'Parser fallback text detected',
        fileName: fileEntry.name,
        message:
          'Text extraction quality is too low for accurate scoring. Please upload a clearer text-based resume so ATS and skill scores reflect your actual content.',
      });
    }

    const quality = assessResumeTextQuality(resumeText);
    if (!quality.isUsable) {
      const qualityReason = `${quality.reason} (chars=${quality.metrics.chars}, words=${quality.metrics.words}, alphaRatio=${quality.metrics.alphaRatio.toFixed(2)})`;
      await createDegradedNotification(session.user.id, fileEntry.name, `LOW_QUALITY_EXTRACTED_TEXT: ${qualityReason}`);
      return NextResponse.json({
        success: true,
        degraded: true,
        code: 'LOW_QUALITY_EXTRACTED_TEXT',
        reason: qualityReason,
        fileName: fileEntry.name,
        message:
          'Extracted text is not reliable enough for AI scoring. Please upload a cleaner text-based PDF/DOCX/TXT resume.',
      });
    }

    try {
      await connectDB();

      const coreAnalysis = await analyzeResume(resumeText, { allowSyntheticFallback: true });
      const analysisData = buildDashboardAnalysisPayload(resumeText, coreAnalysis);
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

      const notificationBatch = [
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
      ];

      if (coreAnalysis.provider === 'fallback') {
        notificationBatch.push({
          userId: session.user.id,
          type: 'analysis_degraded',
          title: 'AI provider fallback used',
          message:
            'This analysis used deterministic fallback scoring because AI provider responses were unavailable or invalid. Please retry to get a full AI-based score.',
        });
      }

      if (/SYNTHETIC MODE/i.test(coreAnalysis.billingNote || '')) {
        notificationBatch.push({
          userId: session.user.id,
          type: 'analysis_degraded',
          title: 'Synthetic backup analysis generated',
          message:
            'Real AI scoring could not be completed reliably, so a randomized backup report was generated as a last-resort mode.',
        });
      }

      await NotificationEvent.create(notificationBatch);

      return NextResponse.json({
        success: true,
        text: resumeText,
        resumeId: resume._id.toString(),
        analysisId: analysis._id.toString(),
        fileName: fileEntry.name,
        textLength: resumeText.length,
        aiProvider: analysisData.aiProvider,
        analysisNote: analysisData.analysisNote,
      });
    } catch (analysisOrDbError) {
      console.error('[UPLOAD] Analysis/DB step failed, returning extracted text only:', analysisOrDbError);

      const degradedReason =
        analysisOrDbError instanceof Error
          ? analysisOrDbError.message
          : 'Unknown analysis or database error';
      await createDegradedNotification(session.user.id, fileEntry.name, `AI_ANALYSIS_DEGRADED: ${degradedReason}`);

      // Best-effort cleanup: clear stale active session so Analysis Report doesn't show older data.
      try {
        await connectDB();
        await UserSession.updateMany(
          { userId: session.user.id, active: true },
          { $set: { active: false, endedAt: new Date() } }
        );
      } catch (sessionCleanupError) {
        console.error('[UPLOAD] Failed to clear active session after degraded upload:', sessionCleanupError);
      }

      return NextResponse.json({
        success: true,
        degraded: true,
        code: 'AI_ANALYSIS_DEGRADED',
        reason: degradedReason,
        text: resumeText,
        fileName: fileEntry.name,
        message: `Resume text extracted successfully, but real AI analysis failed. ${degradedReason}`,
      });
    }
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
