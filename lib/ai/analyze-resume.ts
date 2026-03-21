import OpenAI from 'openai';
import { normalizeText } from '@/lib/utils/parser';

export type SkillDetected = { name: string; level: number; source: 'explicit' | 'inferred' };
export type MissingSkill = {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  resources: string[];
};
export type Suggestion = { original: string; improved: string };
export type JobRecommendation = {
  title: string;
  company: string;
  match: number;
  salary: string;
  skills: string[];
};
export type CareerRoadmapStep = {
  step: string;
  description: string;
  duration: string;
};
export type InterviewQuestion = {
  question: string;
  category: 'Technical' | 'Behavioral';
  target: string;
};

export type ResumeSectionFacts = {
  skills: string[];
  experienceLines: string[];
  projectLines: string[];
  educationLines: string[];
};

export type AnalysisPayload = {
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
  extracted: ResumeSectionFacts;
  insights: string[];
  nextSteps: string[];
  problems: string[];
  improvements: string[];
  opportunities: string[];
  careerPaths: string[];
  skillsDetected: SkillDetected[];
  missingSkills: MissingSkill[];
  suggestions: Suggestion[];
  jobRecommendations: JobRecommendation[];
  careerRoadmap: CareerRoadmapStep[];
  interviewQuestions: InterviewQuestion[];
};

type RoleProfile = {
  title: string;
  company: string;
  salary: string;
  requiredSkills: string[];
};

const SKILL_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'JavaScript', pattern: /\bjavascript\b/i },
  { name: 'TypeScript', pattern: /\btypescript\b/i },
  { name: 'React', pattern: /\breact(?:\.js)?\b/i },
  { name: 'Next.js', pattern: /\bnext\.?js\b/i },
  { name: 'Node.js', pattern: /\bnode\.?js\b/i },
  { name: 'Express', pattern: /\bexpress\b/i },
  { name: 'MongoDB', pattern: /\bmongodb\b/i },
  { name: 'PostgreSQL', pattern: /\bpostgres(?:ql)?\b/i },
  { name: 'MySQL', pattern: /\bmysql\b/i },
  { name: 'REST API', pattern: /\brest(?:ful)?\b|\bapi\b/i },
  { name: 'GraphQL', pattern: /\bgraphql\b/i },
  { name: 'Tailwind CSS', pattern: /\btailwind\b/i },
  { name: 'CSS', pattern: /\bcss3?\b/i },
  { name: 'HTML', pattern: /\bhtml5?\b/i },
  { name: 'Python', pattern: /\bpython\b/i },
  { name: 'Java', pattern: /\bjava\b/i },
  { name: 'C++', pattern: /\bc\+\+\b/i },
  { name: 'Git', pattern: /\bgit\b/i },
  { name: 'Docker', pattern: /\bdocker\b/i },
  { name: 'Kubernetes', pattern: /\bkubernetes|\bk8s\b/i },
  { name: 'AWS', pattern: /\baws\b|amazon web services/i },
  { name: 'Azure', pattern: /\bazure\b/i },
  { name: 'GCP', pattern: /\bgcp\b|google cloud/i },
  { name: 'CI/CD', pattern: /\bci\/?cd\b|continuous integration/i },
  { name: 'System Design', pattern: /\bsystem design\b/i },
  { name: 'Testing', pattern: /\bjest\b|\btesting library\b|\bcypress\b|\bunit test/i },
  { name: 'Redux', pattern: /\bredux\b/i },
  { name: 'Figma', pattern: /\bfigma\b/i },
  { name: 'Agile', pattern: /\bagile\b|\bscrum\b/i },
];

const ROLE_PROFILES: RoleProfile[] = [
  {
    title: 'Frontend Developer',
    company: 'Product SaaS',
    salary: '$80k-$120k',
    requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'REST API'],
  },
  {
    title: 'UI Engineer',
    company: 'Design-first Startup',
    salary: '$85k-$125k',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Testing'],
  },
  {
    title: 'Full Stack Developer',
    company: 'Growth Startup',
    salary: '$95k-$145k',
    requiredSkills: ['React', 'Node.js', 'REST API', 'MongoDB', 'Git', 'Docker'],
  },
  {
    title: 'Backend Developer',
    company: 'Platform Team',
    salary: '$100k-$150k',
    requiredSkills: ['Node.js', 'PostgreSQL', 'REST API', 'Docker', 'CI/CD', 'System Design'],
  },
];

const SECTION_HEADERS = {
  skills: /^(skills?|technical skills?|tech stack|core competencies?)\s*:?$/i,
  experience: /^(experience|work experience|employment|professional experience)\s*:?$/i,
  projects: /^(projects?|selected projects?|personal projects?)\s*:?$/i,
  education: /^(education|academic background|qualifications?)\s*:?$/i,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractSections(text: string): ResumeSectionFacts {
  const lines = splitLines(text);

  let current: keyof ResumeSectionFacts | null = null;
  const sections: ResumeSectionFacts = {
    skills: [],
    experienceLines: [],
    projectLines: [],
    educationLines: [],
  };

  for (const line of lines) {
    if (SECTION_HEADERS.skills.test(line)) {
      current = 'skills';
      continue;
    }
    if (SECTION_HEADERS.experience.test(line)) {
      current = 'experienceLines';
      continue;
    }
    if (SECTION_HEADERS.projects.test(line)) {
      current = 'projectLines';
      continue;
    }
    if (SECTION_HEADERS.education.test(line)) {
      current = 'educationLines';
      continue;
    }

    if (current) {
      sections[current].push(line);
    }
  }

  return sections;
}

function detectExplicitSkills(text: string): string[] {
  const normalized = ` ${text.toLowerCase()} `;
  const matches: string[] = [];

  for (const skill of SKILL_PATTERNS) {
    if (skill.pattern.test(normalized)) {
      matches.push(skill.name);
    }
  }

  return Array.from(new Set(matches));
}

function detectInferredSkills(lines: string[]): string[] {
  const joined = lines.join(' ').toLowerCase();
  const inferred: string[] = [];

  if ((/api/.test(joined) || /endpoint/.test(joined)) && !/rest/.test(joined)) {
    inferred.push('REST API');
  }
  if (/deployment|deployed|production/.test(joined) && !/docker/.test(joined)) {
    inferred.push('CI/CD');
  }

  return Array.from(new Set(inferred));
}

function countImpactSignals(lines: string[]): number {
  const metricRegex = /(\d+%|\$\d+|\d+\+|\d+\s*(users|clients|requests|ms|seconds|minutes|hours))/i;
  const actionRegex = /\b(led|built|designed|launched|improved|reduced|increased|optimized|implemented|delivered)\b/i;

  let score = 0;
  for (const line of lines) {
    if (metricRegex.test(line)) {
      score += 2;
    }
    if (actionRegex.test(line)) {
      score += 1;
    }
  }

  return score;
}

function computeRoleMatch(skills: string[]) {
  const detectedSet = new Set(skills);

  const ranked = ROLE_PROFILES.map((role) => {
    const matched = role.requiredSkills.filter((skill) => detectedSet.has(skill));
    const missing = role.requiredSkills.filter((skill) => !detectedSet.has(skill));
    const matchScore = clampScore((matched.length / role.requiredSkills.length) * 100);

    return { role, matched, missing, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore);

  const top = ranked[0];

  return {
    ranked,
    primaryRequiredSkills: top ? top.role.requiredSkills : [],
    primaryMissingSkills: top ? top.missing : [],
    skillMatch: top ? top.matchScore : 0,
  };
}

function buildAtsNarrative(atsScore: number, missingKeywords: string[]): string {
  if (missingKeywords.length === 0) {
    return `Your resume passes approximately ${atsScore}% of ATS filters. Keyword coverage is strong; focus on stronger impact metrics to move higher.`;
  }

  return `Your resume passes approximately ${atsScore}% of ATS filters. Add ${Math.min(4, missingKeywords.length)} more role-relevant keywords to improve visibility.`;
}

function buildSuggestions(facts: ResumeSectionFacts): Suggestion[] {
  const weakLine =
    facts.experienceLines.find((line) => /responsible for|worked on|helped with/i.test(line)) ||
    facts.projectLines.find((line) => /made|did|worked/i.test(line)) ||
    'Worked on frontend features for company product.';

  const improved = weakLine
    .replace(/responsible for/i, 'Implemented')
    .replace(/worked on/i, 'Built and optimized')
    .replace(/helped with/i, 'Delivered')
    .trim();

  const upgraded = /\d/.test(improved)
    ? improved
    : `${improved} with measurable outcomes (latency reduction, conversion lift, or delivery speed improvements).`;

  return [{ original: weakLine, improved: upgraded }];
}

function buildInterviewQuestions(topSkills: string[]): InterviewQuestion[] {
  const skills = topSkills.slice(0, 3);
  if (skills.length === 0) {
    return [
      {
        question: 'Tell me about a project where you improved product performance and how you measured success.',
        category: 'Behavioral',
        target: 'Delivery Impact',
      },
    ];
  }

  return skills.map((skill, index) => ({
    question:
      index % 2 === 0
        ? `How would you design and test a production feature using ${skill}?`
        : `Describe a challenging bug you solved with ${skill} and what changed after your fix.`,
    category: index % 2 === 0 ? 'Technical' : 'Behavioral',
    target: skill,
  }));
}

function analyzeResumeHeuristic(resumeText: string): AnalysisPayload {
  const clean = normalizeText(resumeText);
  if (!clean) {
    throw new Error('Resume text is empty.');
  }

  const extracted = extractSections(clean);
  const explicitSkills = detectExplicitSkills(clean);
  const inferredSkills = detectInferredSkills([...extracted.experienceLines, ...extracted.projectLines]);
  const roleMatch = computeRoleMatch(explicitSkills);

  const impactSignals = countImpactSignals([...extracted.experienceLines, ...extracted.projectLines]);
  const experienceStrength = clampScore(Math.min(100, 35 + impactSignals * 8));

  const missingKeywords = roleMatch.primaryMissingSkills;
  const atsScore = clampScore(roleMatch.skillMatch * 0.75 + experienceStrength * 0.25);
  const overallScore = clampScore(atsScore * 0.45 + roleMatch.skillMatch * 0.35 + experienceStrength * 0.2);

  const missingSkills: MissingSkill[] = missingKeywords.slice(0, 5).map((skill, index) => ({
    name: skill,
    priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low',
    resources:
      skill === 'System Design'
        ? ['ByteByteGo', 'System Design Primer']
        : skill === 'Docker'
          ? ['Docker Docs', 'Play with Docker']
          : skill === 'CI/CD'
            ? ['GitHub Actions Docs', 'CI/CD Crash Course']
            : [`${skill} Official Docs`, `${skill} Guided Project`],
  }));

  const problems = [
    missingKeywords.length > 0
      ? `Missing role-critical keywords: ${missingKeywords.slice(0, 3).join(', ')}.`
      : 'No major keyword gaps detected for your strongest target role.',
    experienceStrength < 65
      ? 'Experience bullets contain limited measurable impact.'
      : 'Experience section shows measurable outcomes in multiple bullets.',
  ];

  const improvements = [
    'Add quantified outcomes to at least 3 project/experience bullets.',
    missingKeywords.length > 0
      ? `Include these terms naturally in relevant bullets: ${missingKeywords.slice(0, 4).join(', ')}.`
      : 'Maintain keyword consistency with target job descriptions.',
    'Place top 5 detected skills in a concise technical summary near the top.',
  ];

  const opportunities = roleMatch.ranked.slice(0, 3).map(
    (item) => `${item.role.title} (${item.matchScore}% skill alignment)`
  );

  const nextSteps = [
    'Add metrics to projects (for example: reduced load time by 30%).',
    ...missingKeywords.slice(0, 2).map((skill) => `Learn and add proof of ${skill} in one project.`),
    `Apply to ${roleMatch.ranked[0]?.role.title || 'Frontend Developer'} roles after updating your resume summary.`,
  ];

  const insights = [
    buildAtsNarrative(atsScore, missingKeywords),
    `Your strongest detected skills are ${explicitSkills.slice(0, 3).join(', ') || 'not enough explicit technical skills yet'}.`,
    experienceStrength >= 70
      ? 'Your experience section has good action + impact signals.'
      : 'Your experience section needs more concrete impact statements.',
  ];

  const jobRecommendations: JobRecommendation[] = roleMatch.ranked.slice(0, 3).map((item) => ({
    title: item.role.title,
    company: item.role.company,
    match: item.matchScore,
    salary: item.role.salary,
    skills: item.role.requiredSkills,
  }));

  const skillsDetected: SkillDetected[] = explicitSkills.map((skill) => {
    const inSkillsSection = extracted.skills.join(' ').toLowerCase().includes(skill.toLowerCase());
    const levelBase = inSkillsSection ? 82 : 68;
    const level = clampScore(levelBase + Math.min(18, impactSignals * 2));
    return { name: skill, level, source: 'explicit' };
  });

  const careerPaths = roleMatch.ranked.slice(0, 3).map((item) => item.role.title);

  const careerRoadmap: CareerRoadmapStep[] = [
    {
      step: 'Fix keyword coverage',
      description:
        missingKeywords.length > 0
          ? `Add missing skills in relevant experience bullets: ${missingKeywords.slice(0, 3).join(', ')}.`
          : 'Keep role keywords aligned to each job application.',
      duration: '1 week',
    },
    {
      step: 'Strengthen impact evidence',
      description: 'Rewrite 3 bullets with action + metric + business outcome.',
      duration: '1 week',
    },
    {
      step: 'Close top skill gaps',
      description: `Build one project covering ${missingKeywords.slice(0, 2).join(' and ') || 'backend/API fundamentals'}.`,
      duration: '2-4 weeks',
    },
  ];

  return {
    score: overallScore,
    skillMatch: roleMatch.skillMatch,
    experienceStrength,
    atsCompatibility: atsScore,
    ats: {
      score: atsScore,
      explanation: buildAtsNarrative(atsScore, missingKeywords),
      improvements,
    },
    skills: {
      matched: explicitSkills,
      missing: missingKeywords,
      inferred: inferredSkills.filter((skill) => !explicitSkills.includes(skill)),
    },
    extracted,
    insights,
    nextSteps,
    problems,
    improvements,
    opportunities,
    careerPaths,
    skillsDetected,
    missingSkills,
    suggestions: buildSuggestions(extracted),
    jobRecommendations,
    careerRoadmap,
    interviewQuestions: buildInterviewQuestions(explicitSkills),
  };
}

let cachedOpenAI: OpenAI | null | undefined;

function getOpenAIClient(): OpenAI | null {
  if (cachedOpenAI !== undefined) {
    return cachedOpenAI;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    cachedOpenAI = null;
    return cachedOpenAI;
  }

  cachedOpenAI = new OpenAI({ apiKey });
  return cachedOpenAI;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

function mergeAnalysisPayload(base: AnalysisPayload, candidate: unknown): AnalysisPayload {
  if (!candidate || typeof candidate !== 'object') {
    return base;
  }

  const ai = candidate as Partial<AnalysisPayload>;

  return {
    ...base,
    score: typeof ai.score === 'number' ? clampScore(ai.score) : base.score,
    skillMatch: typeof ai.skillMatch === 'number' ? clampScore(ai.skillMatch) : base.skillMatch,
    experienceStrength:
      typeof ai.experienceStrength === 'number' ? clampScore(ai.experienceStrength) : base.experienceStrength,
    atsCompatibility:
      typeof ai.atsCompatibility === 'number' ? clampScore(ai.atsCompatibility) : base.atsCompatibility,
    ats: {
      score: typeof ai.ats?.score === 'number' ? clampScore(ai.ats.score) : base.ats.score,
      explanation: typeof ai.ats?.explanation === 'string' ? ai.ats.explanation : base.ats.explanation,
      improvements: asStringArray(ai.ats?.improvements).length ? asStringArray(ai.ats?.improvements) : base.ats.improvements,
    },
    skills: {
      matched: asStringArray(ai.skills?.matched).length ? asStringArray(ai.skills?.matched) : base.skills.matched,
      missing: asStringArray(ai.skills?.missing).length ? asStringArray(ai.skills?.missing) : base.skills.missing,
      inferred: asStringArray(ai.skills?.inferred),
    },
    insights: asStringArray(ai.insights).length ? asStringArray(ai.insights) : base.insights,
    nextSteps: asStringArray(ai.nextSteps).length ? asStringArray(ai.nextSteps) : base.nextSteps,
    problems: asStringArray(ai.problems).length ? asStringArray(ai.problems) : base.problems,
    improvements: asStringArray(ai.improvements).length ? asStringArray(ai.improvements) : base.improvements,
    opportunities: asStringArray(ai.opportunities).length ? asStringArray(ai.opportunities) : base.opportunities,
    careerPaths: asStringArray(ai.careerPaths).length ? asStringArray(ai.careerPaths) : base.careerPaths,
    extracted: ai.extracted && typeof ai.extracted === 'object'
      ? {
          skills: asStringArray(ai.extracted.skills),
          experienceLines: asStringArray(ai.extracted.experienceLines),
          projectLines: asStringArray(ai.extracted.projectLines),
          educationLines: asStringArray(ai.extracted.educationLines),
        }
      : base.extracted,
    skillsDetected: Array.isArray(ai.skillsDetected) && ai.skillsDetected.length
      ? ai.skillsDetected
          .filter((s): s is SkillDetected => !!s && typeof s === 'object' && typeof s.name === 'string')
          .map((s) => ({
            name: s.name,
            level: clampScore(typeof s.level === 'number' ? s.level : 65),
            source: s.source === 'inferred' ? 'inferred' : 'explicit',
          }))
      : base.skillsDetected,
    missingSkills: Array.isArray(ai.missingSkills) && ai.missingSkills.length
      ? ai.missingSkills
          .filter((s): s is MissingSkill => !!s && typeof s === 'object' && typeof s.name === 'string')
          .map((s) => ({
            name: s.name,
            priority: s.priority === 'Low' || s.priority === 'Medium' ? s.priority : 'High',
            resources: asStringArray(s.resources),
          }))
      : base.missingSkills,
    suggestions: Array.isArray(ai.suggestions) && ai.suggestions.length
      ? ai.suggestions
          .filter((s): s is Suggestion => !!s && typeof s === 'object' && typeof s.original === 'string' && typeof s.improved === 'string')
          .map((s) => ({ original: s.original, improved: s.improved }))
      : base.suggestions,
    jobRecommendations: Array.isArray(ai.jobRecommendations) && ai.jobRecommendations.length
      ? ai.jobRecommendations
          .filter((j): j is JobRecommendation => !!j && typeof j === 'object' && typeof j.title === 'string')
          .map((j) => ({
            title: j.title,
            company: typeof j.company === 'string' ? j.company : 'Target Company',
            match: clampScore(typeof j.match === 'number' ? j.match : 60),
            salary: typeof j.salary === 'string' ? j.salary : 'N/A',
            skills: asStringArray(j.skills),
          }))
      : base.jobRecommendations,
    careerRoadmap: Array.isArray(ai.careerRoadmap) && ai.careerRoadmap.length
      ? ai.careerRoadmap
          .filter((r): r is CareerRoadmapStep => !!r && typeof r === 'object' && typeof r.step === 'string')
          .map((r) => ({
            step: r.step,
            description: typeof r.description === 'string' ? r.description : 'Action item',
            duration: typeof r.duration === 'string' ? r.duration : '1-2 weeks',
          }))
      : base.careerRoadmap,
    interviewQuestions: Array.isArray(ai.interviewQuestions) && ai.interviewQuestions.length
      ? ai.interviewQuestions
          .filter((q): q is InterviewQuestion => !!q && typeof q === 'object' && typeof q.question === 'string')
          .map((q) => ({
            question: q.question,
            category: q.category === 'Behavioral' ? 'Behavioral' : 'Technical',
            target: typeof q.target === 'string' ? q.target : 'General',
          }))
      : base.interviewQuestions,
  };
}

async function analyzeResumeWithAI(clean: string, heuristic: AnalysisPayload): Promise<AnalysisPayload | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  const prompt = `You are a resume analysis engine. Analyze the resume text and return ONLY strict JSON with this exact shape: AnalysisPayload.\n\nRules:\n- Make output specific to this resume, not generic.\n- Keep scores 0-100 integers.\n- suggestions must rewrite real lines from resume when possible.\n- Return valid JSON only, no markdown.\n\nResume Text:\n${clean.slice(0, 20000)}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);
    return mergeAnalysisPayload(heuristic, parsed);
  } catch (error) {
    console.error('[AI] OpenAI analysis failed, using heuristic fallback:', error);
    return null;
  }
}

export async function analyzeResumeText(resumeText: string): Promise<AnalysisPayload> {
  const heuristic = analyzeResumeHeuristic(resumeText);
  const clean = normalizeText(resumeText);
  if (!clean) {
    throw new Error('Resume text is empty.');
  }

  const aiResult = await analyzeResumeWithAI(clean, heuristic);
  return aiResult || heuristic;
}
