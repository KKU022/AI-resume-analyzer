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

export async function parseResumeWithGemini(fileBuffer: Buffer): Promise<ParsedResumeData> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

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
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as ParsedResumeData;
  } catch (err) {
    console.error('[GEMINI] Failed to parse JSON response:', text.slice(0, 300));
    throw new Error('Gemini returned an invalid JSON response.');
  }
}
