import mongoose, { Schema, models, model } from 'mongoose';

export interface IResume {
  _id: string;
  userId: string;
  fileName: string;
  resumeText: string;
  extractedSkills?: string[];
  extractedProjects?: string[];
  extractedExperience?: string[];
  analysisScore?: number;
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  resumeText: { type: String, required: true },
  extractedSkills: [{ type: String }],
  extractedProjects: [{ type: String }],
  extractedExperience: [{ type: String }],
  analysisScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

ResumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = models.Resume || model<IResume>('Resume', ResumeSchema);
export default Resume;
