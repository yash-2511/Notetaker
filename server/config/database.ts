import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notetaker';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Add connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.log('💡 Please ensure MongoDB is running or provide a valid cloud MongoDB URI');
    
    // For development, we'll continue without database (using memory storage only)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing without database - using memory storage only');
      return;
    }
    
    process.exit(1);
  }
}