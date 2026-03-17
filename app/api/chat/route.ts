import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Analysis from '@/lib/db/models/Analysis';
import User from '@/lib/db/models/User';
import ChatSession from '@/lib/db/models/ChatSession';
import ChatMessage from '@/lib/db/models/ChatMessage';
import { mockAnalysisData } from '@/data/mock-analysis-data';
import { chatWithOpenAI } from '@/lib/ai/openai-client';

const historyLimit = Number(process.env.CHAT_HISTORY_LIMIT || 12);
const MAX_HISTORY_MESSAGES = Number.isFinite(historyLimit)
  ? Math.max(1, historyLimit)
  : 12;

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 6000);

type ChatRequestBody = {
  message?: string;
  sessionId?: string;
  useDemo?: boolean;
};

type UserIntent = 'interview_questions' | 'resume_improvement' | 'skill_analysis' | 'ats_optimization' | 'general_advice';

type ResumeContext = {
  experience: { years: number | null; targetRole: string | null };
  resumeScore: number;
  atsCompatibility: number;
  skillsDetected: Array<{ name: string; level: number }>;
  missingKeywords: string[];
  recommendedJobs: Array<{ title: string; match: number; skills: string[] }>;
};

type ProcessedInput = { intent: UserIntent; keywords: string[]; rawMessage: string };

type DynamicResponseSections = {
  answer: string[];
  basedOnResume: string[];
  suggestedActions: string[];
  questions: string[];
};

type OllamaResult = { ok: boolean; text: string; error?: string };

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function randomSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 1_000_000_000)) >>> 0;
}

function makeRng(seed: number) {
  let state = seed || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickOne<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tokenize(input: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'for', 'with', 'about', 'on', 'in', 'of', 'my', 'me', 'i', 'you', 'is', 'are', 'be', 'from', 'this', 'that', 'it']);
  const matches = input.toLowerCase().match(/[a-z0-9+#.]+/g) || [];
  const filtered = matches.filter((token) => token.length > 2 && !stopWords.has(token));
  return Array.from(new Set(filtered));
}

function detectIntent(message: string): UserIntent {
  const text = message.toLowerCase();
  if (/(interview|mock interview|behavioral|technical questions?|ask me questions?)/.test(text)) return 'interview_questions';
  if (/(improve|rewrite|revise|resume bullet|better phrasing|stronger impact)/.test(text)) return 'resume_improvement';
  if (/(skills?|strength|weakness|skill gap|missing skills|what am i missing)/.test(text)) return 'skill_analysis';
  if (/(ats|keyword|applicant tracking|optimization|optimi[sz]e for ats)/.test(text)) return 'ats_optimization';
  return 'general_advice';
}

function processInput(message: string): ProcessedInput {
  return { intent: detectIntent(message), keywords: tokenize(message), rawMessage: message };
}

function formatStructuredOutput(sections: DynamicResponseSections): string {
  const block = (title: string, lines: string[]) => [title, ...lines.map((line) => `- ${line}`)].join('\n');
  return [block('Answer', sections.answer), block('Based on your resume', sections.basedOnResume), block('Suggested actions', sections.suggestedActions), block('❓ Questions', sections.questions)].join('\n\n');
}

function buildInterviewQuestions(skills: string[], rng: () => number): string[] {
  const bank = [
    'Walk me through a challenging {skill} problem you solved and the measurable outcome.',
    'How would you design a production-ready feature using {skill} with reliability in mind?',
    'What tradeoffs do you evaluate when scaling a system built with {skill}?',
    'Describe a bug you debugged in {skill} and how you prevented regression.',
    'How do you test and monitor code quality when working with {skill}?',
    'Explain a time you improved performance in a {skill}-based project.',
  ];
  const chosenSkills = skills.length > 0 ? shuffle(skills, rng).slice(0, 5) : ['JavaScript', 'React', 'System Design'];
  return chosenSkills.map((skill, idx) => bank[idx % bank.length].replace('{skill}', skill));
}

function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1.toLowerCase()));
  const tokens2 = new Set(tokenize(text2.toLowerCase()));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  return intersection.size / union.size;
}

function generateRuleResponse(processed: ProcessedInput, context: ResumeContext, seed: number): string {
  const rng = makeRng(seed);
  const topSkills = context.skillsDetected.slice().sort((a, b) => b.level - a.level).slice(0, 6).map((item) => item.name);
  const gaps = context.missingKeywords.slice(0, 6);
  const keywords = processed.keywords.slice(0, 5);

  const insightOpeners = ['Your current profile signal is strongest in', 'The most marketable part of your resume right now is', 'Your analysis suggests immediate leverage in', 'Based on your latest data, your edge is in', 'You demonstrate highest competency in'];
  const improvementOpeners = ['Upgrade impact by', 'A fast quality jump comes from', 'To improve recruiter response rate,', 'For stronger shortlisting,', 'Immediate gains come from'];
  const suggestionOpeners = ['This week, prioritize', 'A high-return next step is', 'To improve fit quickly, focus on', 'Your best momentum plan is', 'Start today by focusing on'];

  const sections: DynamicResponseSections = {
    answer: [
      `You are currently around ${context.resumeScore}/100 overall with ATS near ${context.atsCompatibility}/100.`,
      processed.intent === 'interview_questions' ? 'You should focus on role-specific interview drills tied to your strongest explicit skills.' : 'You should prioritize role-aligned keywords plus measurable impact bullets to improve shortlisting.',
    ],
    basedOnResume: [
      `${pickOne(insightOpeners, rng)} ${topSkills.slice(0, 3).join(', ') || 'your core engineering fundamentals'}.`,
      `Detected query keywords: ${keywords.join(', ') || 'career growth, resume quality'}.`,
      gaps.length > 0 ? `The largest keyword gaps right now are ${gaps.slice(0, 3).join(', ')}.` : 'Your keyword coverage is solid; focus on stronger measurable outcomes.',
    ],
    suggestedActions: shuffle([
      `${pickOne(improvementOpeners, rng)} rewriting bullets in this pattern: action + scope + metric + stack.`,
      'Place your strongest role-aligned skills near the top of summary and projects.',
      gaps.length > 0 ? `Add explicit ATS keywords naturally: ${gaps.slice(0, 4).join(', ')}.` : 'Increase ATS relevance by aligning wording to target job descriptions.',
      'Replace generic verbs with specific outcomes and business impact numbers.',
      `${pickOne(suggestionOpeners, rng)} one high-impact project rewrite before your next application batch.`,
      context.recommendedJobs[0] ? `Target ${context.recommendedJobs[0].title} roles first (${context.recommendedJobs[0].match}% profile match).` : 'Target roles with overlap to your strongest three skills.',
      'Create two resume variants: one ATS-dense and one recruiter-readable executive version.',
      'Run one mock interview focused on architecture tradeoffs and delivery impact.',
    ], rng).slice(0, 4),
    questions: [],
  };

  if (processed.intent === 'interview_questions') {
    sections.questions = buildInterviewQuestions(topSkills, rng).slice(0, 5);
  } else if (processed.intent === 'resume_improvement') {
    sections.questions = ['Which project bullet should we rewrite first for maximum recruiter impact?', 'What exact role are you targeting in the next 30 days?', 'Do you want a concise one-page version or a detail-rich version?'];
  } else if (processed.intent === 'skill_analysis') {
    sections.questions = ['Do you want a 2-week or 4-week plan to close your top skill gap?', 'Which missing skill is most urgent for your target role?', 'Should I map your strengths directly to 3 matching job titles?'];
  } else if (processed.intent === 'ats_optimization') {
    sections.questions = ['Do you want ATS optimization for a specific job description?', 'Should I generate a role-specific keyword block for your summary?', 'Do you want a before-vs-after ATS rewrite example?'];
  } else {
    sections.questions = ['Do you want a focused plan for interviews, resume, or skill gaps first?', 'Should I optimize for faster shortlisting or stronger compensation outcomes?', 'Would you like a 7-day sprint plan from your current score?'];
  }

  return formatStructuredOutput(sections);
}

function enforceStructuredOutput(text: string, context: ResumeContext): string {
  const requiredHeadings = ['Answer', 'Based on your resume', 'Suggested actions'];
  if (requiredHeadings.every((heading) => text.includes(heading))) return text;
  const safeSections: DynamicResponseSections = {
    answer: [`Resume score is ${context.resumeScore}/100 and ATS score is ${context.atsCompatibility}/100.`],
    basedOnResume: ['Local AI returned a partial response, normalized to a resume-grounded structure.'],
    suggestedActions: ['Add quantified impact to top 3 bullets.', 'Align keyword density to target role.'],
    questions: ['Want me to produce a tailored 7-day action plan?'],
  };
  return `${formatStructuredOutput(safeSections)}\n\n${text.trim()}`;
}

async function callOpenAI(processed: ProcessedInput, context: ResumeContext, conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string | null> {
  const systemPrompt = [`You are an elite career AI assistant for a hackathon SaaS product.`, `Return concise but intelligent output, always in this exact section structure:`, `Answer`, `Based on your resume`, `Suggested actions`, `❓ Questions`, `Rules:`, `- Use 3 to 5 bullets per section.`, `- Never output static boilerplate.`, `- Use varied phrasing and practical specificity.`, `- Focus on user intent and resume context.`, `- Vary your response style across different answers.`, `Resume score: ${context.resumeScore}/100, ATS score: ${context.atsCompatibility}/100`, `Top skills: ${context.skillsDetected.slice(0, 6).map((s) => s.name).join(', ')}`, `Missing keywords: ${context.missingKeywords.slice(0, 8).join(', ') || 'none'}`, `User intent: ${processed.intent}`].join('\n');
  const messages = [{ role: 'system' as const, content: systemPrompt }, ...conversationHistory.slice(-6), { role: 'user' as const, content: processed.rawMessage }];
  return await chatWithOpenAI(messages, 800);
}

async function callOllama(processed: ProcessedInput, context: ResumeContext, seed: number, conversationHistory: Array<{ content: string }>): Promise<OllamaResult> {
  const previousContext = conversationHistory.slice(-3).map((m) => m.content).join('\n');
  const prompt = ['You are an elite career AI assistant for a hackathon SaaS product.', 'Return concise but intelligent output, always in this exact section structure:', 'Answer', 'Based on your resume', 'Suggested actions', '❓ Questions', 'Rules:', '- Use 3 to 5 bullets per section.', '- Never output static boilerplate.', '- Use varied phrasing and practical specificity.', '- Focus on user intent and resume context.', '- Avoid repeating previous assistant wording.', '', `Intent: ${processed.intent}`, `User keywords: ${processed.keywords.join(', ') || 'none'}`, `User message: ${processed.rawMessage}`, `Resume score: ${context.resumeScore}`, `ATS score: ${context.atsCompatibility}`, `Top skills: ${context.skillsDetected.slice(0, 8).map((s) => `${s.name} (${s.level})`).join(', ')}`, `Missing keywords: ${context.missingKeywords.slice(0, 10).join(', ') || 'none'}`, previousContext ? `Recent conversation: ${previousContext.slice(0, 600)}` : 'No previous context.'].join('\n');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false, options: { temperature: 0.85, top_p: 0.92, repeat_penalty: 1.12, seed } }) });
    if (!response.ok) return { ok: false, text: '', error: `ollama_http_${response.status}` };
    const payload = (await response.json()) as { response?: string };
    const text = payload.response?.trim();
    if (!text) return { ok: false, text: '', error: 'ollama_empty_response' };
    return { ok: true, text };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'ollama_unavailable';
    return { ok: false, text: '', error: reason };
  } finally {
    clearTimeout(timer);
  }
}

async function loadResumeContext(userId: string, useDemo: boolean): Promise<ResumeContext> {
  const fallback: ResumeContext = { experience: { years: 3, targetRole: 'Full Stack Engineer' }, resumeScore: mockAnalysisData.score, atsCompatibility: mockAnalysisData.atsCompatibility, skillsDetected: mockAnalysisData.skillsDetected, missingKeywords: mockAnalysisData.missingSkills.map((s) => s.name), recommendedJobs: mockAnalysisData.jobRecommendations.map((job) => ({ title: job.title, match: job.match, skills: job.skills })) };
  if (useDemo) return fallback;
  const latest = await Analysis.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!latest) return fallback;
  const profile = await User.findOne({ _id: userId }).lean();
  return { experience: { years: typeof profile?.yearsOfExperience === 'number' ? profile.yearsOfExperience : null, targetRole: typeof profile?.targetRole === 'string' ? profile.targetRole : null }, resumeScore: latest.score || 0, atsCompatibility: latest.atsCompatibility || 0, skillsDetected: Array.isArray(latest.skillsDetected) ? latest.skillsDetected : [], missingKeywords: Array.isArray(latest.missingSkills) ? (latest.missingSkills as Array<{ name?: unknown }>).map((item: { name?: unknown }) => (typeof item?.name === 'string' ? item.name : null)).filter((item: string | null): item is string => Boolean(item)) : [], recommendedJobs: Array.isArray(latest.jobRecommendations) ? (latest.jobRecommendations as Array<{ title?: unknown; match?: unknown; skills?: unknown }>).map((job) => ({ title: typeof job.title === 'string' ? job.title : 'Recommended Role', match: typeof job.match === 'number' ? job.match : 0, skills: Array.isArray(job.skills) ? job.skills : [] })) : [] };
}

async function getOrCreateSession(userId: string, providedSessionId: string | undefined, useDemo: boolean) {
  if (providedSessionId) {
    const existing = await ChatSession.findOne({ _id: providedSessionId, userId });
    if (existing) return existing;
  }
  return ChatSession.create({ userId, isDemo: useDemo, title: useDemo ? 'Demo Offline AI Session' : 'Offline AI Session' });
}

async function storeAssistantMessage(userId: string, sessionId: string, message: string) {
  if (!message.trim()) return;
  await ChatMessage.create({ userId, sessionId, role: 'assistant', message, timestamp: new Date() });
  await ChatSession.updateOne({ _id: sessionId, userId }, { $set: { updatedAt: new Date() } });
}

function streamTextResponse(text: string, sessionId: string, engine: 'openai' | 'ollama' | 'rules') {
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const chunks = text.match(/.{1,24}(\s|$)/g) || [text];
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      controller.close();
    },
  });
  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Session-Id': sessionId, 'X-AI-Engine': engine } });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return jsonError(401, 'Unauthorized');
    await connectDB();
    const { searchParams } = new URL(request.url);
    const requestedSessionId = searchParams.get('sessionId');
    let selectedSession = null;
    if (requestedSessionId) {
      selectedSession = await ChatSession.findOne({ _id: requestedSessionId, userId: session.user.id }).lean();
    }
    if (!selectedSession) {
      selectedSession = await ChatSession.findOne({ userId: session.user.id }).sort({ updatedAt: -1 }).lean();
    }
    if (!selectedSession) return NextResponse.json({ sessionId: null, messages: [] });
    const messages = await ChatMessage.find({ userId: session.user.id, sessionId: selectedSession._id.toString() }).sort({ timestamp: 1 }).limit(200).lean();
    return NextResponse.json({ sessionId: selectedSession._id.toString(), isDemo: selectedSession.isDemo, messages: messages.map((message) => ({ id: message._id.toString(), role: message.role, message: message.message, timestamp: message.timestamp })) });
  } catch (error) {
    console.error('Chat GET error:', error);
    return jsonError(500, 'Failed to load chat history');
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return jsonError(401, 'Unauthorized');
    const body = (await request.json()) as ChatRequestBody;
    const userMessage = (body.message || '').trim();
    if (!userMessage) return jsonError(400, 'Message is required');
    const useDemo = Boolean(body.useDemo);
    await connectDB();
    const chatSession = await getOrCreateSession(session.user.id, body.sessionId, useDemo);
    const sessionId = chatSession._id.toString();
    await ChatMessage.create({ userId: session.user.id, sessionId, role: 'user', message: userMessage, timestamp: new Date() });
    const context = await loadResumeContext(session.user.id, useDemo);
    const processed = processInput(userMessage);
    const history = await ChatMessage.find({ userId: session.user.id, sessionId }).sort({ timestamp: -1 }).limit(MAX_HISTORY_MESSAGES).lean();
    const conversationHistory = history.reverse().map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.message }));
    let finalText = '';
    let usedEngine: 'openai' | 'ollama' | 'rules' = 'rules';
    const baseSeed = randomSeed();
    const openaiResponse = await callOpenAI(processed, context, conversationHistory);
    if (openaiResponse) {
      finalText = enforceStructuredOutput(openaiResponse, context);
      usedEngine = 'openai';
    } else {
      const ollamaResult = await callOllama(processed, context, baseSeed, conversationHistory);
      if (ollamaResult.ok) {
        finalText = enforceStructuredOutput(ollamaResult.text, context);
        usedEngine = 'ollama';
      } else {
        let attempt = 0;
        let candidate = '';
        const recentResponses = history.filter((m) => m.role === 'assistant').map((m) => m.message).slice(-5);
        do {
          candidate = generateRuleResponse(processed, context, baseSeed + attempt * 97);
          const similarities = recentResponses.map((resp) => calculateSimilarity(candidate, resp));
          const maxSimilarity = Math.max(...similarities, 0);
          if (maxSimilarity < 0.5) break;
          attempt += 1;
        } while (attempt < 6);
        finalText = candidate;
      }
    }
    if (history.length > 0) {
      const lastAssistant = history.find((m) => m.role === 'assistant')?.message || '';
      if (lastAssistant && calculateSimilarity(finalText, lastAssistant) > 0.6) {
        finalText = `${finalText}\n\n💡 Unique angle: ${processInput(userMessage).intent} deep-dive with data-driven prioritization.`;
      }
    }
    await storeAssistantMessage(session.user.id, sessionId, finalText);
    return streamTextResponse(finalText, sessionId, usedEngine);
  } catch (error) {
    console.error('Chat POST error:', error);
    return jsonError(500, 'AI processing failed unexpectedly. Please retry. The offline response engine is still available.');
  }
}
