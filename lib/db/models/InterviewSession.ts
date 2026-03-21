import { Schema, model, models } from 'mongoose';

export interface IInterviewAnswer {
  questionId: string;
  question: string;
  category: string;
  userAnswer: string;
  score: number;
  feedback: string;
  timestamp: Date;
}

export interface IInterviewSession {
  _id: string;
  userId: string;
  role: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  answers: IInterviewAnswer[];
  overallScore: number;
  totalQuestions: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewAnswerSchema = new Schema<IInterviewAnswer>(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    category: { type: String, required: true },
    userAnswer: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    feedback: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    answers: { type: [InterviewAnswerSchema], default: [] },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ userId: 1, createdAt: -1 });
InterviewSessionSchema.index({ userId: 1, overallScore: -1 });

const InterviewSession = models.InterviewSession || model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

export default InterviewSession;
