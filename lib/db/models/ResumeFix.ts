import { Schema, models, model } from 'mongoose';

export interface IResumeFix {
  _id: string;
  userId: string;
  resumeId: string;
  analysisId: string;
  version: number;
  originalBullet: string;
  improvedBullet: string;
  appliedAt: Date;
}

const ResumeFixSchema = new Schema<IResumeFix>(
  {
    userId: { type: String, required: true, index: true },
    resumeId: { type: String, required: true, index: true },
    analysisId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    originalBullet: { type: String, required: true },
    improvedBullet: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now, index: true },
  },
  {
    collection: 'resumeFixes',
  }
);

ResumeFixSchema.index({ userId: 1, resumeId: 1, version: -1 });
ResumeFixSchema.index({ userId: 1, analysisId: 1, appliedAt: -1 });

const ResumeFix = models.ResumeFix || model<IResumeFix>('ResumeFix', ResumeFixSchema);

export default ResumeFix;