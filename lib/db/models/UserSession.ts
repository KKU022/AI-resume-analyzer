import { Schema, model, models } from 'mongoose';

export interface IUserSession {
  _id: string;
  userId: string;
  active: boolean;
  analysisId?: string;
  resumeId?: string;
  fileName?: string;
  startedAt: Date;
  endedAt?: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: { type: String, required: true, index: true },
    active: { type: Boolean, default: true, index: true },
    analysisId: { type: String },
    resumeId: { type: String },
    fileName: { type: String },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

UserSessionSchema.index({ userId: 1, active: 1, updatedAt: -1 });

const UserSession = models.UserSession || model<IUserSession>('UserSession', UserSessionSchema);

export default UserSession;
