import express from 'express';
import mongoose from 'mongoose';
import { getFirebaseAdminStatus } from '../config/firebase.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isFirebaseAdminReady = getFirebaseAdminStatus();
  const isGeminiKeyPresent = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  res.status(200).json({
    success: true,
    message: 'English360 AI API is running',
    services: {
      server: true,
      mongoDB: isMongoConnected,
      firebaseAdmin: isFirebaseAdminReady,
      geminiConfigured: isGeminiKeyPresent,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
