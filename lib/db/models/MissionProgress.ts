import { Schema, model, models } from 'mongoose';

export interface IMission {
  day: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IMissionProgress {
  _id: string;
  userId: string;
  missions: IMission[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    day: { type: Number, required: true, min: 1, max: 7 },
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
  },
  { _id: false }
);

const MissionProgressSchema = new Schema<IMissionProgress>(
  {
    userId: { type: String, required: true, index: true, unique: true },
    missions: { type: [MissionSchema], default: [] },
    currentStreak: { type: Number, default: 0, index: true },
    longestStreak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

MissionProgressSchema.index({ userId: 1, currentStreak: -1 });

const MissionProgress = models.MissionProgress || model<IMissionProgress>('MissionProgress', MissionProgressSchema);

export default MissionProgress;
