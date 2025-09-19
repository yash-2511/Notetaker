import { z } from "zod";

// MongoDB Document Interfaces
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Note {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  category?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtpVerification {
  _id?: string;
  id?: string;
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Insert schemas
export const insertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  googleId: z.string().optional(),
});

export const insertNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  userId: z.string(),
});

export const insertOtpVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  expiresAt: z.date(),
});

// Additional schemas for auth
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
