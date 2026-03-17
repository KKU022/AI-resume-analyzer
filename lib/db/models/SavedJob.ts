import { Schema, models, model } from 'mongoose';

export interface ISavedJob {
  _id: string;
  userId: string;
  externalId: string;
  title: string;
  company: string;
  salary?: string;
  location?: string;
  url: string;
  skills: string[];
  match: number;
  applied: boolean;
  appliedAt?: Date;
  status: 'saved' | 'applied';
  createdAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: String, required: true, index: true },
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    salary: { type: String, default: 'N/A' },
    location: { type: String, default: 'Remote' },
    url: { type: String, required: true },
    skills: [{ type: String }],
    match: { type: Number, default: 0 },
    applied: { type: Boolean, default: false },
    appliedAt: { type: Date },
    status: { type: String, enum: ['saved', 'applied'], default: 'saved' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'savedJobs',
  }
);

SavedJobSchema.index({ userId: 1, externalId: 1 }, { unique: true });
SavedJobSchema.index({ userId: 1, createdAt: -1 });

const SavedJob = models.SavedJob || model<ISavedJob>('SavedJob', SavedJobSchema);

export default SavedJob;