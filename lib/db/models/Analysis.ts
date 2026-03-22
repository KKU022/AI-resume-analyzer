import { Schema, models, model } from 'mongoose';

export interface IAnalysis {
  _id: string;
  resumeId: string;
  userId: string;
  fileName: string;
  score: number;
  skillMatch?: number;
  experienceStrength?: number;
  atsCompatibility: number;
  ats?: {
    score: number;
    explanation: string;
    improvements: string[];
  };
  skills?: {
    matched: string[];
    missing: string[];
    inferred: string[];
  };
  extracted?: {
    skills: string[];
    experienceLines: string[];
    projectLines: string[];
    educationLines: string[];
  };
  insights?: string[];
  nextSteps?: string[];
  problems?: string[];
  improvements?: string[];
  opportunities?: string[];
  careerPaths?: string[];
  skillsDetected: { name: string; level: number }[];
  missingSkills: { name: string; priority: string; resources: string[] }[];
  suggestions: { original: string; improved: string }[];
  jobRecommendations: { title: string; company: string; match: number; salary: string; skills: string[] }[];
  careerRoadmap: { step: string; description: string; duration: string }[];
  interviewQuestions: { question: string; category: string; target: string }[];
  aiProvider?: 'openai' | 'gemini' | 'groq' | 'fallback';
  analysisNote?: string;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>({
  resumeId: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  fileName: { type: String, default: 'resume.pdf' },
  score: { type: Number, required: true },
  skillMatch: { type: Number, default: 0 },
  experienceStrength: { type: Number, default: 0 },
  atsCompatibility: { type: Number, default: 0 },
  ats: {
    score: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    improvements: [{ type: String }],
  },
  skills: {
    matched: [{ type: String }],
    missing: [{ type: String }],
    inferred: [{ type: String }],
  },
  extracted: {
    skills: [{ type: String }],
    experienceLines: [{ type: String }],
    projectLines: [{ type: String }],
    educationLines: [{ type: String }],
  },
  insights: [{ type: String }],
  nextSteps: [{ type: String }],
  problems: [{ type: String }],
  improvements: [{ type: String }],
  opportunities: [{ type: String }],
  careerPaths: [{ type: String }],
  skillsDetected: [{ name: String, level: Number }],
  missingSkills: [{ name: String, priority: String, resources: [String] }],
  suggestions: [{ original: String, improved: String }],
  jobRecommendations: [{ title: String, company: String, match: Number, salary: String, skills: [String] }],
  careerRoadmap: [{ step: String, description: String, duration: String }],
  interviewQuestions: [{ question: String, category: String, target: String }],
  aiProvider: { type: String, default: '' },
  analysisNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ resumeId: 1, createdAt: -1 });

const Analysis = models.Analysis || model<IAnalysis>('Analysis', AnalysisSchema);
export default Analysis;
