import mongoose, { Schema, Document } from 'mongoose';
import { OtpVerification as IOtpVerification } from '@shared/schema';

export interface OtpVerificationDocument extends Omit<IOtpVerification, '_id' | 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const otpVerificationSchema = new Schema<OtpVerificationDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for automatic cleanup of expired OTPs
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Transform _id to id when converting to JSON
otpVerificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const OtpVerificationModel = mongoose.model<OtpVerificationDocument>('OtpVerification', otpVerificationSchema);