import { Schema, model, models } from 'mongoose';

export interface INotificationEvent {
  _id: string;
  userId: string;
  type: 'resume_analyzed' | 'suggestions_ready' | 'session_saved';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, string | number | boolean>;
  createdAt: Date;
}

const NotificationEventSchema = new Schema<INotificationEvent>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

NotificationEventSchema.index({ userId: 1, createdAt: -1 });

const NotificationEvent =
  models.NotificationEvent || model<INotificationEvent>('NotificationEvent', NotificationEventSchema);

export default NotificationEvent;
