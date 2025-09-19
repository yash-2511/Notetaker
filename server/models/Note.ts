import mongoose, { Schema, Document } from 'mongoose';
import { Note as INote } from '@shared/schema';

export interface NoteDocument extends Omit<INote, '_id' | 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const noteSchema = new Schema<NoteDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Transform _id to id when converting to JSON
noteSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const NoteModel = mongoose.model<NoteDocument>('Note', noteSchema);