import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not set in environment.');
    return;
  }

  // Set short buffer timeout so API calls don't hang if cluster IP is pending
  mongoose.set('bufferTimeoutMS', 3000);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
  }
};

export const getDBStatus = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;