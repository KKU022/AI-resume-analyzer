import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider?: string;
  targetRole?: string;
  yearsOfExperience?: number;
  careerGoals?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  image: { type: String, default: '' },
  provider: { type: String, default: 'credentials' },
  targetRole: { type: String },
  yearsOfExperience: { type: Number },
  careerGoals: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>('User', UserSchema);
export default User;
