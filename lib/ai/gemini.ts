import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export type ParsedResumeData = {
  candidateName: string;
  contactDetails: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  workExperience: Array<{
    role: string;
    company: string;
    duration?: string;
    accomplishments: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>;
  rawText: string;
  atsReadabilityAssessment?: string;
};

const ACTIVE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
].filter(Boolean) as string[];

export async function parseResumeWithGemini(fileBuffer: Buffer): Promise<ParsedResumeData> {

  const prompt = `
Analyze this resume document directly and extract all content into structured JSON with these exact fields:
{
  "candidateName": "Candidate's full name",
  "contactDetails": {
    "email": "Email address if available",
    "phone": "Phone number if available",
    "location": "Location/City if available",
    "linkedin": "LinkedIn URL if available",
    "portfolio": "Portfolio/GitHub URL if available"
  },
  "summary": "Professional summary or objective statement",
  "skills": {
    "technical": ["Programming languages, frameworks, hard skills"],
    "soft": ["Communication, leadership, teamwork"],
    "tools": ["Git, Docker, VS Code, Figma, etc."]
  },
  "workExperience": [
    {
      "role": "Job title",
      "company": "Company name",
      "duration": "Dates/Duration",
      "accomplishments": ["Measurable achievements and responsibilities"]
    }
  ],
  "education": [
    {
      "degree": "Degree and field of study",
      "institution": "University/College",
      "year": "Graduation year"
    }
  ],
  "projects": [
    {
      "name": "Project title",
      "description": "What was built and results",
      "technologies": ["Technologies used"]
    }
  ],
  "rawText": "A comprehensive, clean text transcription of all text in the document.",
  "atsReadabilityAssessment": "Assessment of formatting, sections, and ATS readability"
}

Output STRICT valid JSON only. Do not include markdown codeblocks or commentary.
`;

  let lastError: any = null;
  for (const modelName of ACTIVE_GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        },
        prompt,
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as ParsedResumeData;
    } catch (err: any) {
      console.warn(`[GEMINI] Model ${modelName} parsing failed:`, err?.message?.slice(0, 100));
      lastError = err;
    }
  }

  throw lastError || new Error('All active Gemini flash endpoints failed to parse resume.');
}

export type GeminiAnalysisResult = {
  atsScore: number;
  skillMatch: number;
  experienceStrength: number;
  detectedSkills: string[];
  suggestedSkills: string[];
  problems: string[];
  improvements: string[];
  opportunities: string[];
  candidateName?: string;
  summary?: string;
  workExperience?: Array<{ role: string; company: string; accomplishments: string[] }>;
  rawText?: string;
};

export async function analyzeResumeWithGemini(
  content: Buffer | string,
  mimeType: string = "application/pdf"
): Promise<GeminiAnalysisResult> {
  const prompt = `You are an expert ATS resume evaluator. Analyze the attached resume and return valid JSON with:
  {
    "candidateName": "Candidate full name",
    "summary": "Professional summary statement",
    "atsScore": number,
    "skillMatch": number,
    "experienceStrength": number,
    "detectedSkills": ["skill1", "skill2"],
    "suggestedSkills": ["missingSkill1", "missingSkill2"],
    "problems": ["problem 1", "problem 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "opportunities": ["opportunity 1", "opportunity 2"],
    "workExperience": [
      { "role": "Role title", "company": "Company name", "accomplishments": ["Achievement 1"] }
    ],
    "rawText": "Complete plain text extraction of all text in the resume"
  }
  Output STRICT JSON only.`;

  let contentParts: any[] = [prompt];

  if (Buffer.isBuffer(content)) {
    contentParts.push({
      inlineData: {
        data: content.toString("base64"),
        mimeType: mimeType,
      },
    });
  } else {
    contentParts.push(content);
  }

  let lastError: any = null;
  for (const modelName of ACTIVE_GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(contentParts);
      const text = response.response.text();

      // Clean markdown code fence if present
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || 82)),
        skillMatch: Math.min(100, Math.max(0, Number(parsed.skillMatch) || 78)),
        experienceStrength: Math.min(100, Math.max(0, Number(parsed.experienceStrength) || 75)),
        detectedSkills: Array.isArray(parsed.detectedSkills) ? parsed.detectedSkills : [],
        suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills : [],
        problems: Array.isArray(parsed.problems) ? parsed.problems : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        candidateName: parsed.candidateName || 'Candidate',
        summary: parsed.summary || '',
        workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
        rawText: parsed.rawText || '',
      };
    } catch (err: any) {
      console.warn(`[GEMINI] Model ${modelName} analysis attempt failed:`, err?.message?.slice(0, 100));
      lastError = err;
    }
  }

  throw lastError || new Error('All active Gemini flash endpoints failed during resume analysis.');
}

