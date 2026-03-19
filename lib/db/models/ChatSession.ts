import { Schema, models, model } from 'mongoose';

export interface IChatSession {
  _id: string;
  userId: string;
  title: string;
  isDemo: boolean;
  pendingAction?: {
    type: string;
    payload: Record<string, string>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Medha Assistant Session' },
    isDemo: { type: Boolean, default: false },
    pendingAction: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    collection: 'chatSessions',
  }
);

ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

const ChatSession = models.ChatSession || model<IChatSession>('ChatSession', ChatSessionSchema);

export default ChatSession;
