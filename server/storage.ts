import { type User, type InsertUser, type Note, type InsertNote, type OtpVerification, type InsertOtpVerification } from "@shared/schema";
import { UserModel } from "./models/User";
import { NoteModel } from "./models/Note";
import { OtpVerificationModel } from "./models/OtpVerification";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Note methods
  getNotesByUserId(userId: string): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;

  // OTP methods
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  getOtpVerification(email: string, otp: string): Promise<OtpVerification | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private notes: Map<string, Note> = new Map();
  private otpVerifications: Map<string, OtpVerification> = new Map();
  private idCounter = 1;

  private generateId(): string {
    return (this.idCounter++).toString();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.generateId();
    const newUser: User = {
      id,
      _id: id,
      ...user,
      email: user.email.toLowerCase(),
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Note methods
  async getNotesByUserId(userId: string): Promise<Note[]> {
    const userNotes: Note[] = [];
    for (const note of this.notes.values()) {
      if (note.userId === userId) {
        userNotes.push(note);
      }
    }
    return userNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.generateId();
    const now = new Date();
    const newNote: Note = {
      id,
      _id: id,
      ...note,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { 
      ...note, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  // OTP methods
  async createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification> {
    const id = this.generateId();
    const newOtp: OtpVerification = {
      id,
      _id: id,
      ...otp,
      email: otp.email.toLowerCase(),
      isUsed: false,
      createdAt: new Date(),
    };
    this.otpVerifications.set(id, newOtp);
    return newOtp;
  }

  async getOtpVerification(email: string, otpCode: string): Promise<OtpVerification | undefined> {
    for (const otp of this.otpVerifications.values()) {
      if (
        otp.email.toLowerCase() === email.toLowerCase() &&
        otp.otp === otpCode &&
        !otp.isUsed &&
        otp.expiresAt > new Date()
      ) {
        return otp;
      }
    }
    return undefined;
  }

  async markOtpAsUsed(id: string): Promise<void> {
    const otp = this.otpVerifications.get(id);
    if (otp) {
      otp.isUsed = true;
      this.otpVerifications.set(id, otp);
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    for (const [id, otp] of this.otpVerifications.entries()) {
      if (otp.expiresAt < now) {
        this.otpVerifications.delete(id);
      }
    }
  }
}

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      return user ? user.toJSON() as User : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user ? user.toJSON() as User : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ googleId });
      return user ? user.toJSON() as User : undefined;
    } catch (error) {
      console.error('Error getting user by Google ID:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new UserModel({
        ...insertUser,
        email: insertUser.email.toLowerCase(),
        isVerified: false,
      });
      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      return user ? user.toJSON() as User : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Note methods
  async getNotesByUserId(userId: string): Promise<Note[]> {
    try {
      const notes = await NoteModel.find({ userId })
        .sort({ updatedAt: -1 });
      return notes.map(note => note.toJSON() as Note);
    } catch (error) {
      console.error('Error getting notes by user ID:', error);
      return [];
    }
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    try {
      const note = await NoteModel.findById(id);
      return note ? note.toJSON() as Note : undefined;
    } catch (error) {
      console.error('Error getting note by ID:', error);
      return undefined;
    }
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    try {
      const note = new NoteModel(insertNote);
      const savedNote = await note.save();
      return savedNote.toJSON() as Note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    try {
      const note = await NoteModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return note ? note.toJSON() as Note : undefined;
    } catch (error) {
      console.error('Error updating note:', error);
      return undefined;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const result = await NoteModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  // OTP methods
  async createOtpVerification(insertOtp: InsertOtpVerification): Promise<OtpVerification> {
    try {
      const otp = new OtpVerificationModel({
        ...insertOtp,
        email: insertOtp.email.toLowerCase(),
      });
      const savedOtp = await otp.save();
      return savedOtp.toJSON() as OtpVerification;
    } catch (error) {
      console.error('Error creating OTP verification:', error);
      throw error;
    }
  }

  async getOtpVerification(email: string, otpCode: string): Promise<OtpVerification | undefined> {
    try {
      const otp = await OtpVerificationModel.findOne({
        email: email.toLowerCase(),
        otp: otpCode,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });
      return otp ? otp.toJSON() as OtpVerification : undefined;
    } catch (error) {
      console.error('Error getting OTP verification:', error);
      return undefined;
    }
  }

  async markOtpAsUsed(id: string): Promise<void> {
    try {
      await OtpVerificationModel.findByIdAndUpdate(id, { isUsed: true });
    } catch (error) {
      console.error('Error marking OTP as used:', error);
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    try {
      await OtpVerificationModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

// Initialize storage based on MongoDB connection status
function createStorage(): IStorage {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using MongoDB storage');
      return new MongoStorage();
    } else {
      console.log('⚠️ MongoDB not connected, using memory storage');
      return new MemStorage();
    }
  } catch (error) {
    console.log('⚠️ Error initializing MongoDB storage, falling back to memory storage');
    return new MemStorage();
  }
}

export const storage = createStorage();
