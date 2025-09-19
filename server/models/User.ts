import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '@shared/schema';

export interface UserDocument extends Omit<IUser, '_id' | 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Transform _id to id when converting to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);