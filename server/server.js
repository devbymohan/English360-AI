import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

try {
  dns.setDefaultResultOrder('ipv4first');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
} catch (e) {}
import connectDB from './config/database.js';
import { initFirebaseAdmin } from './config/firebase.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import grammarRoutes from './routes/grammarRoutes.js';
import vocabularyRoutes from './routes/vocabularyRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import writingRoutes from './routes/writingRoutes.js';
import listeningRoutes from './routes/listeningRoutes.js';
import testRoutes from './routes/testRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import mistakeRoutes from './routes/mistakeRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import aiCoachRoutes from './routes/aiCoachRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Services
connectDB();
initFirebaseAdmin();

// Core Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[English360 AI Server] running on http://localhost:${PORT}`);
});

export default app;
