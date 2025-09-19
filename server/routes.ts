import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AuthService } from "./services/auth";
import { EmailService } from "./services/email";
import { requireAuth, type AuthenticatedRequest } from "./middleware/auth";
import { 
  signupSchema, 
  loginSchema, 
  verifyOtpSchema, 
  createNoteSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await AuthService.hashPassword(validatedData.password);
      
      // Create user
      const user = await storage.createUser({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      });

      // Generate and send OTP
      const otp = AuthService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.createOtpVerification({
        email: user.email,
        otp,
        expiresAt,
      });

      await EmailService.sendOTP(user.email, otp);

      res.status(201).json({ 
        message: 'User created successfully. Please verify your email.',
        email: user.email 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Signup failed' 
      });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      
      // Find OTP verification
      const otpVerification = await storage.getOtpVerification(
        validatedData.email, 
        validatedData.otp
      );
      
      if (!otpVerification) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Mark OTP as used
      if (otpVerification.id) {
        await storage.markOtpAsUsed(otpVerification.id);
      }

      // Update user as verified
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.id) {
        await storage.updateUser(user.id, { isVerified: true });
      }

      // Generate JWT token
      const token = AuthService.generateToken(user);

      // Send welcome email
      await EmailService.sendWelcomeEmail(user.email, user.name);

      res.json({
        message: 'Email verified successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'OTP verification failed' 
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isValidPassword = await AuthService.comparePassword(
        validatedData.password, 
        user.password
      );
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in' });
      }

      // Generate JWT token
      const token = AuthService.generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  });

  app.post('/api/auth/resend-otp', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
      }

      // Generate and send new OTP
      const otp = AuthService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await storage.createOtpVerification({
        email,
        otp,
        expiresAt,
      });

      await EmailService.sendOTP(email, otp);

      res.json({ message: 'New OTP sent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
  });

  // Google OAuth routes (placeholder - would need passport.js setup)
  app.post('/api/auth/google', async (req, res) => {
    try {
      // This would typically be handled by passport.js Google strategy
      // For now, returning a placeholder response
      res.status(501).json({ message: 'Google OAuth not implemented yet' });
    } catch (error) {
      res.status(500).json({ message: 'Google authentication failed' });
    }
  });

  // Protected routes
  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  });

  // Notes routes
  app.get('/api/notes', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notes = await storage.getNotesByUserId(req.user!.userId);
      res.json(notes);
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });

  app.post('/api/notes', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = createNoteSchema.parse(req.body);
      
      const note = await storage.createNote({
        ...validatedData,
        userId: req.user!.userId,
      });

      res.status(201).json(note);
    } catch (error) {
      console.error('Create note error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create note' 
      });
    }
  });

  app.put('/api/notes/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = createNoteSchema.parse(req.body);
      
      // Check if note exists and belongs to user
      const existingNote = await storage.getNoteById(id);
      if (!existingNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      if (existingNote.userId !== req.user!.userId) {
        return res.status(403).json({ message: 'Not authorized to update this note' });
      }

      const updatedNote = await storage.updateNote(id, validatedData);
      
      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json(updatedNote);
    } catch (error) {
      console.error('Update note error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update note' 
      });
    }
  });

  app.delete('/api/notes/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      // Check if note exists and belongs to user
      const existingNote = await storage.getNoteById(id);
      if (!existingNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      if (existingNote.userId !== req.user!.userId) {
        return res.status(403).json({ message: 'Not authorized to delete this note' });
      }

      const deleted = await storage.deleteNote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({ message: 'Failed to delete note' });
    }
  });

  // Cleanup expired OTPs periodically
  setInterval(() => {
    storage.cleanupExpiredOtps();
  }, 5 * 60 * 1000); // Every 5 minutes

  const httpServer = createServer(app);
  return httpServer;
}
