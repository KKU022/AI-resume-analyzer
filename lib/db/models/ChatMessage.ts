import { Schema, models, model } from 'mongoose';

export type ChatRole = 'user' | 'assistant';

export interface IChatMessage {
  _id: string;
  userId: string;
  sessionId: string;
  role: ChatRole;
  message: string;
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    collection: 'chatMessages',
  }
);

ChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

const ChatMessage = models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
