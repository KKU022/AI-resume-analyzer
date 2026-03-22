import { normalizeText } from '@/lib/utils/parser';

export type ResumeAnalysis = {
  atsScore: number;
  skillMatch: number;
  experienceStrength: number;
  improvements: string[];
  problems: string[];
  recommendedRoles: string[];
  provider: 'gemini' | 'openai' | 'fallback';
};

export type DashboardAnalysisPayload = {
  score: number;
  skillMatch: number;
  experienceStrength: number;
  atsCompatibility: number;
  ats: {
    score: number;
    explanation: string;
    improvements: string[];
  };
  skills: {
    matched: string[];
    missing: string[];
    inferred: string[];
  };
  extracted: {
    skills: string[];
    experienceLines: string[];
    projectLines: string[];
    educationLines: string[];
  };
  insights: string[];
  nextSteps: string[];
  problems: string[];
  improvements: string[];
  opportunities: string[];
  careerPaths: string[];
  skillsDetected: Array<{ name: string; level: number; source: 'explicit' | 'inferred' }>;
  missingSkills: Array<{ name: string; priority: 'High' | 'Medium' | 'Low'; resources: string[] }>;
  suggestions: Array<{ original: string; improved: string }>;
  jobRecommendations: Array<{ title: string; company: string; match: number; salary: string; skills: string[] }>;
  careerRoadmap: Array<{ step: string; description: string; duration: string }>;
  interviewQuestions: Array<{ question: string; category: 'Technical' | 'Behavioral'; target: string }>;
  aiProvider: 'gemini' | 'openai' | 'fallback';
};

type PartialAnalysis = Partial<Omit<ResumeAnalysis, 'provider'>>;

type ScoredSkill = { name: string; confidence: number };

const KEYWORD_BANK: Record<string, string[]> = {
  'Frontend Developer': ['react', 'next.js', 'typescript', 'javascript', 'css', 'tailwind', 'redux'],
  'Full Stack Developer': ['node.js', 'react', 'api', 'mongodb', 'postgresql', 'docker', 'typescript'],
  'Backend Developer': ['node.js', 'api', 'database', 'postgresql', 'mongodb', 'redis', 'docker'],
  'Data Analyst': ['python', 'sql', 'excel', 'power bi', 'tableau', 'pandas'],
  'ML Engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'nlp', 'docker', 'aws'],
};

const ACTION_VERB_REGEX = /\b(led|built|designed|implemented|improved|optimized|delivered|launched|created|developed)\b/gi;
const METRIC_REGEX = /(\d+%|\$\d+|\d+\+|\d+\s*(users|clients|requests|ms|seconds|minutes|hours|days|months))/gi;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cleanJSON(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseModelJSON(raw: string): PartialAnalysis | null {
  const candidate = cleanJSON(raw);
  try {
    return JSON.parse(candidate) as PartialAnalysis;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as PartialAnalysis;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function scoreSkills(text: string): ScoredSkill[] {
  const lower = text.toLowerCase();
  const allSkills = Array.from(new Set(Object.values(KEYWORD_BANK).flat()));

  return allSkills
    .map((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      const hit = pattern.test(lower);
      return { name: skill, confidence: hit ? 80 : 0 };
    })
    .filter((s) => s.confidence > 0);
}

function rankRoles(text: string): Array<{ role: string; score: number; missing: string[] }> {
  const lower = text.toLowerCase();

  return Object.entries(KEYWORD_BANK)
    .map(([role, keywords]) => {
      const matched = keywords.filter((kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower));
      const score = clamp((matched.length / keywords.length) * 100);
      const missing = keywords.filter((kw) => !matched.includes(kw));
      return { role, score, missing };
    })
    .sort((a, b) => b.score - a.score);
}

function fallbackAnalysis(text: string): ResumeAnalysis {
  const normalized = normalizeText(text);
  const content = normalized.toLowerCase();

  const actionHits = (normalized.match(ACTION_VERB_REGEX) || []).length;
  const metricHits = (normalized.match(METRIC_REGEX) || []).length;
  const skills = scoreSkills(content);
  const roleRanks = rankRoles(content);

  const topRole = roleRanks[0];
  const skillMatch = topRole?.score ?? clamp(skills.length * 8);
  const atsScore = clamp(35 + skills.length * 5 + metricHits * 4 + Math.min(15, normalized.length / 700));
  const experienceStrength = clamp(30 + actionHits * 6 + metricHits * 7);

  const missing = topRole?.missing.slice(0, 3) || [];

  const improvements = [
    metricHits > 0
      ? 'Increase quantified impact statements in at least 2 more bullets.'
      : 'Add measurable impact to experience bullets (percent, time, users, or revenue).',
    missing.length > 0
      ? `Add evidence for role keywords: ${missing.join(', ')}.`
      : 'Tailor summary and skills section to the exact target role keywords.',
    'Place your strongest technical stack in the top section for faster recruiter scanning.',
  ];

  const problems = [
    actionHits < 4 ? 'Too few action-oriented bullets in experience/projects sections.' : 'Action verbs are present but can be more outcome-focused.',
    metricHits < 2 ? 'Low quantified impact density reduces ATS and recruiter confidence.' : 'Good early metrics, but impact evidence can be broadened.',
    skillMatch < 50 ? 'Current keyword alignment to target roles is weak.' : 'Role alignment is moderate; optimize for role-specific terms.',
  ];

  const recommendedRoles = roleRanks.slice(0, 3).map((entry) => entry.role);

  return {
    atsScore,
    skillMatch,
    experienceStrength,
    improvements,
    problems,
    recommendedRoles: recommendedRoles.length ? recommendedRoles : ['Frontend Developer', 'Full Stack Developer'],
    provider: 'fallback',
  };
}

function sanitizeAnalysis(candidate: PartialAnalysis, base: ResumeAnalysis): ResumeAnalysis {
  const improvements = toStringArray(candidate.improvements);
  const problems = toStringArray(candidate.problems);
  const recommendedRoles = toStringArray(candidate.recommendedRoles);

  return {
    atsScore: typeof candidate.atsScore === 'number' ? clamp(candidate.atsScore) : base.atsScore,
    skillMatch: typeof candidate.skillMatch === 'number' ? clamp(candidate.skillMatch) : base.skillMatch,
    experienceStrength:
      typeof candidate.experienceStrength === 'number' ? clamp(candidate.experienceStrength) : base.experienceStrength,
    improvements: improvements.length ? improvements.slice(0, 6) : base.improvements,
    problems: problems.length ? problems.slice(0, 6) : base.problems,
    recommendedRoles: recommendedRoles.length ? recommendedRoles.slice(0, 5) : base.recommendedRoles,
    provider: base.provider,
  };
}

function buildPrompt(text: string): string {
  return `You are a professional resume evaluator.
Analyze the resume and return STRICT JSON only:
{
  "atsScore": number,
  "skillMatch": number,
  "experienceStrength": number,
  "improvements": string[],
  "problems": string[],
  "recommendedRoles": string[]
}
Rules:
- Use only 0-100 integers for scores.
- Be realistic. Do not inflate scores.
- Keep each string concise and specific to this resume.
- Return valid JSON only, no markdown, no extra keys.

Resume:
${text.slice(0, 22000)}`;
}

async function tryGemini(prompt: string): Promise<PartialAnalysis | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GENAI_API_KEY;
  if (!geminiKey) {
    return null;
  }

  const modelCandidates = ['models/gemini-1.5-flash', 'models/gemini-2.0-flash', 'models/gemini-pro'];

  for (const model of modelCandidates) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.error('[AI] Gemini attempt failed', { model, status: res.status, body: errBody.slice(0, 240) });
        continue;
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const output =
        data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || '')
          .join('')
          .trim() || '';

      if (!output) {
        console.error('[AI] Gemini returned empty output', { model });
        continue;
      }

      const parsed = parseModelJSON(output);
      if (parsed) {
        console.log('✅ Gemini used');
        return parsed;
      }
    } catch (error) {
      console.error('[AI] Gemini request exception', { model, error });
    }
  }

  return null;
}

async function tryOpenAI(prompt: string): Promise<PartialAnalysis | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return null;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[AI] OpenAI fallback failed', { status: res.status, body: errBody.slice(0, 240) });
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const output = data.choices?.[0]?.message?.content?.trim() || '';
    if (!output) {
      console.error('[AI] OpenAI fallback returned empty output');
      return null;
    }

    const parsed = parseModelJSON(output);
    if (parsed) {
      console.log('✅ OpenAI fallback used');
      return parsed;
    }

    return null;
  } catch (error) {
    console.error('[AI] OpenAI fallback exception', error);
    return null;
  }
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function sectionLines(lines: string[], patterns: RegExp[]): string[] {
  const collected: string[] = [];
  let active = false;

  for (const line of lines) {
    if (patterns.some((pattern) => pattern.test(line))) {
      active = true;
      continue;
    }

    if (active && /^[A-Z][A-Za-z\s]{1,30}:?$/.test(line)) {
      active = false;
    }

    if (active) {
      collected.push(line);
    }
  }

  return collected;
}

function buildSuggestedBullet(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) {
    return 'Built and improved a feature with measurable business impact.';
  }
  if (/\d/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} with measurable impact (for example: faster delivery, reduced latency, or higher conversion).`;
}

export function buildDashboardAnalysisPayload(text: string, core: ResumeAnalysis): DashboardAnalysisPayload {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const lines = splitLines(normalized);
  const roleRanks = rankRoles(lower);

  const topRole = roleRanks[0];
  const topRoleKeywords = topRole ? KEYWORD_BANK[topRole.role] : [];
  const matchedSkills = scoreSkills(lower).map((item) => item.name);
  const missingSkills = topRoleKeywords.filter((kw) => !matchedSkills.includes(kw)).slice(0, 5);

  const experienceLines = sectionLines(lines, [/^experience:?$/i, /^work experience:?$/i, /^professional experience:?$/i]);
  const projectLines = sectionLines(lines, [/^projects?:?$/i, /^selected projects?:?$/i]);
  const educationLines = sectionLines(lines, [/^education:?$/i, /^academic background:?$/i]);

  const suggestionsSource = [...experienceLines, ...projectLines].slice(0, 3);
  const suggestions = (suggestionsSource.length ? suggestionsSource : lines.slice(0, 2)).map((line) => ({
    original: line,
    improved: buildSuggestedBullet(line),
  }));

  const weightedScore = clamp(core.atsScore * 0.45 + core.skillMatch * 0.35 + core.experienceStrength * 0.2);

  const improvements = core.improvements.length
    ? core.improvements
    : ['Add more role-specific skills and outcomes to improve match quality.'];

  const problems = core.problems.length
    ? core.problems
    : ['Resume has insufficient detail for confident scoring.'];

  const recommendedRoles = core.recommendedRoles.length
    ? core.recommendedRoles
    : roleRanks.slice(0, 3).map((entry) => entry.role);

  const detected = matchedSkills.slice(0, 12).map((name, index) => ({
    name,
    level: clamp(core.skillMatch - index * 4),
    source: 'explicit' as const,
  }));

  const missing = missingSkills.map((name, index) => ({
    name,
    priority: index < 2 ? 'High' as const : index < 4 ? 'Medium' as const : 'Low' as const,
    resources: [`${name} official docs`, `${name} practical tutorial`],
  }));

  const jobRecommendations = recommendedRoles.slice(0, 3).map((role, index) => ({
    title: role,
    company: index === 0 ? 'Product SaaS' : index === 1 ? 'Growth Startup' : 'Tech Team',
    match: clamp(core.skillMatch - index * 7),
    salary: index === 0 ? '$80k-$120k' : index === 1 ? '$95k-$145k' : '$70k-$110k',
    skills: KEYWORD_BANK[role] || topRoleKeywords,
  }));

  return {
    score: weightedScore,
    skillMatch: core.skillMatch,
    experienceStrength: core.experienceStrength,
    atsCompatibility: core.atsScore,
    ats: {
      score: core.atsScore,
      explanation: `ATS estimate is ${core.atsScore}% based on keyword relevance, role alignment, and evidence depth in your resume.`,
      improvements,
    },
    skills: {
      matched: matchedSkills,
      missing: missingSkills,
      inferred: matchedSkills.filter((skill) => /api|docker|cloud|sql/.test(skill)).slice(0, 3),
    },
    extracted: {
      skills: matchedSkills,
      experienceLines,
      projectLines,
      educationLines,
    },
    insights: [
      `Primary target role alignment: ${topRole?.role || 'General Software Role'} (${topRole?.score ?? core.skillMatch}%).`,
      core.experienceStrength >= 65
        ? 'Experience evidence has reasonable action and impact density.'
        : 'Experience evidence needs more measurable outcomes.',
      `Analysis provider used: ${core.provider}.`,
    ],
    nextSteps: improvements.slice(0, 3),
    problems,
    improvements,
    opportunities: recommendedRoles.map((role, idx) => `${role} (${clamp(core.skillMatch - idx * 8)}% fit)`),
    careerPaths: recommendedRoles,
    skillsDetected: detected,
    missingSkills: missing,
    suggestions,
    jobRecommendations,
    careerRoadmap: [
      {
        step: 'Improve measurable impact',
        description: 'Rewrite at least 3 bullets with action + metric + outcome.',
        duration: '1 week',
      },
      {
        step: 'Close top role gaps',
        description: missingSkills.length
          ? `Add project evidence for: ${missingSkills.slice(0, 2).join(', ')}.`
          : 'Expand one advanced project aligned with your target role.',
        duration: '1-2 weeks',
      },
      {
        step: 'Retarget applications',
        description: `Apply with resume variants for ${recommendedRoles.slice(0, 2).join(' and ') || 'top-fit roles'}.`,
        duration: 'Ongoing',
      },
    ],
    interviewQuestions: [
      {
        question: 'Describe one project where you improved performance and how you measured the result.',
        category: 'Behavioral',
        target: 'Impact Communication',
      },
      {
        question: `How would you design a production-ready feature for a ${recommendedRoles[0] || 'software'} role?`,
        category: 'Technical',
        target: recommendedRoles[0] || 'System Design',
      },
    ],
    aiProvider: core.provider,
  };
}

export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  const normalized = normalizeText(text);
  if (!normalized) {
    throw new Error('Resume text is empty.');
  }

  const prompt = buildPrompt(normalized);
  const base = fallbackAnalysis(normalized);

  const gemini = await tryGemini(prompt);
  if (gemini) {
    const merged = sanitizeAnalysis(gemini, { ...base, provider: 'gemini' });
    return { ...merged, provider: 'gemini' };
  }

  const openai = await tryOpenAI(prompt);
  if (openai) {
    const merged = sanitizeAnalysis(openai, { ...base, provider: 'openai' });
    return { ...merged, provider: 'openai' };
  }

  console.log('⚠️ Using fallback scoring');
  return base;
}
