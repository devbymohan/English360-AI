import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, 'server');

const dirs = [
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'services',
  'utils'
];

dirs.forEach(d => {
  const fullPath = path.join(serverDir, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// 1. package.json
fs.writeFileSync(path.join(serverDir, 'package.json'), JSON.stringify({
  name: "english360-server",
  version: "1.0.0",
  description: "Backend API for English360 AI - AI-powered English learning platform",
  main: "server.js",
  type: "module",
  scripts: {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  dependencies: {
    "@google/genai": "^0.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "firebase-admin": "^12.0.0",
    "mongoose": "^8.3.1"
  }
}, null, 2));

// 2. server/config/database.js
fs.writeFileSync(path.join(serverDir, 'config', 'database.js'), [
  "import mongoose from 'mongoose';",
  "",
  "const connectDB = async () => {",
  "  try {",
  "    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/english360-ai';",
  "    const conn = await mongoose.connect(connUri);",
  "    console.log(`[MongoDB] Connected: ${conn.connection.host}`);",
  "  } catch (error) {",
  "    console.warn(`[MongoDB] Connection notice: ${error.message}`);",
  "  }",
  "};",
  "",
  "export default connectDB;"
].join('\n'));

// 3. server/config/firebase.js
fs.writeFileSync(path.join(serverDir, 'config', 'firebase.js'), [
  "// Firebase Admin SDK Configuration (Phase 1 placeholder)",
  "export const initFirebaseAdmin = () => {",
  "  console.log('[Firebase Admin] Ready for auth verification in Auth phase');",
  "};"
].join('\n'));

// 4. server/utils/responseHandler.js
fs.writeFileSync(path.join(serverDir, 'utils', 'responseHandler.js'), [
  "export const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {",
  "  return res.status(statusCode).json({",
  "    success: true,",
  "    message,",
  "    data",
  "  });",
  "};",
  "",
  "export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {",
  "  return res.status(statusCode).json({",
  "    success: false,",
  "    message,",
  "    ...(errors && { errors })",
  "  });",
  "};"
].join('\n'));

// 5. server/middleware/errorMiddleware.js
fs.writeFileSync(path.join(serverDir, 'middleware', 'errorMiddleware.js'), [
  "export const notFound = (req, res, next) => {",
  "  const error = new Error(`Not Found - ${req.originalUrl}`);",
  "  res.status(404);",
  "  next(error);",
  "};",
  "",
  "export const errorHandler = (err, req, res, next) => {",
  "  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;",
  "  res.status(statusCode).json({",
  "    success: false,",
  "    message: err.message || 'Internal Server Error',",
  "    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })",
  "  });",
  "};"
].join('\n'));

// 6. server/middleware/authMiddleware.js
fs.writeFileSync(path.join(serverDir, 'middleware', 'authMiddleware.js'), [
  "export const requireAuth = async (req, res, next) => {",
  "  try {",
  "    const authHeader = req.headers.authorization;",
  "    if (!authHeader || !authHeader.startsWith('Bearer ')) {",
  "      req.user = { id: 'student-arjun-1', name: 'Arjun', email: 'arjun@english360.ai', level: 'B1' };",
  "      return next();",
  "    }",
  "    const token = authHeader.split(' ')[1];",
  "    req.user = { id: 'student-arjun-1', token };",
  "    next();",
  "  } catch (error) {",
  "    res.status(401).json({ success: false, message: 'Unauthorized - Invalid Token' });",
  "  }",
  "};"
].join('\n'));

// 7. Models
const models = {
  'User.js': `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, default: 'Arjun' },
  avatarUrl: { type: String, default: '' },
  currentLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'B1' },
  streakCount: { type: Number, default: 12 },
  lastActiveDate: { type: Date, default: Date.now },
  points: { type: Number, default: 2410 },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);`,

  'Assessment.js': `import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grammarScore: { type: Number, default: 0 },
  vocabularyScore: { type: Number, default: 0 },
  readingScore: { type: Number, default: 0 },
  writingScore: { type: Number, default: 0 },
  listeningScore: { type: Number, default: 0 },
  assessedLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'B1' },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' }
}, { timestamps: true });

export default mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);`,

  'GrammarProgress.js': `import mongoose from 'mongoose';

const grammarProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  subtopic: { type: String },
  masteryPercentage: { type: Number, default: 0 },
  questionsAnswered: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.GrammarProgress || mongoose.model('GrammarProgress', grammarProgressSchema);`,

  'VocabularyProgress.js': `import mongoose from 'mongoose';

const vocabularyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wordsLearned: [{ type: String }],
  wordsMastered: [{ type: String }],
  dailyGoal: { type: Number, default: 20 },
  dailyWordsCount: { type: Number, default: 6 },
  streakDays: { type: Number, default: 12 }
}, { timestamps: true });

export default mongoose.models.VocabularyProgress || mongoose.model('VocabularyProgress', vocabularyProgressSchema);`,

  'ReadingAttempt.js': `import mongoose from 'mongoose';

const readingAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passageTitle: { type: String, required: true },
  level: { type: String, default: 'B1' },
  wordsCount: { type: Number, default: 450 },
  timeTakenSeconds: { type: Number, default: 0 },
  wpm: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 10 }
}, { timestamps: true });

export default mongoose.models.ReadingAttempt || mongoose.model('ReadingAttempt', readingAttemptSchema);`,

  'WritingSubmission.js': `import mongoose from 'mongoose';

const writingSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  promptTopic: { type: String, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  taskAchievementScore: { type: Number, default: 0 },
  coherenceScore: { type: Number, default: 0 },
  lexicalScore: { type: Number, default: 0 },
  grammarScore: { type: Number, default: 0 },
  feedback: {
    whatsGood: [{ type: String }],
    toImprove: [{ type: String }],
    suggestions: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.models.WritingSubmission || mongoose.model('WritingSubmission', writingSubmissionSchema);`,

  'ListeningAttempt.js': `import mongoose from 'mongoose';

const listeningAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioTitle: { type: String, required: true },
  level: { type: String, default: 'B1' },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 10 },
  timeTakenSeconds: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.ListeningAttempt || mongoose.model('ListeningAttempt', listeningAttemptSchema);`,

  'Test.js': `import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Mixed', 'Grammar', 'Vocabulary', 'Reading', 'Listening'], default: 'Mixed' },
  level: { type: String, default: 'B1' },
  durationMinutes: { type: Number, default: 30 },
  totalQuestions: { type: Number, default: 20 },
  description: { type: String }
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model('Test', testSchema);`,

  'TestResult.js': `import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  testTitle: { type: String, required: true },
  scorePercentage: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  timeTakenMinutes: { type: Number, default: 0 },
  sectionScores: {
    grammar: { score: Number, total: Number },
    vocabulary: { score: Number, total: Number },
    reading: { score: Number, total: Number },
    listening: { score: Number, total: Number }
  },
  questionAnswers: [{
    questionId: String,
    category: String,
    questionText: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String
  }]
}, { timestamps: true });

export default mongoose.models.TestResult || mongoose.model('TestResult', testResultSchema);`,

  'Mistake.js': `import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing'], required: true },
  topic: { type: String, required: true },
  questionText: { type: String, required: true },
  userAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
  sourceName: { type: String, default: 'Practice Test' },
  isResolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Mistake || mongoose.model('Mistake', mistakeSchema);`,

  'Achievement.js': `import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Learning', 'Consistency', 'Performance', 'Special'], default: 'Learning' },
  points: { type: Number, default: 10 },
  iconName: { type: String, default: 'award' }
}, { timestamps: true });

export default mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);`,

  'LearningActivity.js': `import mongoose from 'mongoose';

const learningActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Listening', 'Test'], required: true },
  title: { type: String, required: true },
  score: { type: Number },
  detail: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.LearningActivity || mongoose.model('LearningActivity', learningActivitySchema);`,

  'AICoachConversation.js': `import mongoose from 'mongoose';

const aiCoachConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'coach'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  topic: { type: String, default: 'General Coaching' }
}, { timestamps: true });

export default mongoose.models.AICoachConversation || mongoose.model('AICoachConversation', aiCoachConversationSchema);`
};

Object.entries(models).forEach(([filename, content]) => {
  fs.writeFileSync(path.join(serverDir, 'models', filename), content.trim());
});

// 8. English360 AI Service placeholder
fs.writeFileSync(path.join(serverDir, 'services', 'geminiService.js'), `// English360 AI Service Foundation (Phase 1 Placeholder)
// Ready for full AI learning algorithms and prompt chains in AI phase

export const getAIModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[English360 AI] Warning: API key is not configured in .env');
    return null;
  }
  return { apiKey, model: 'gemini-2.5-flash' };
};

export const generateGrammarQuestions = async (topic, level) => {
  return { message: 'English360 AI grammar generator foundation ready' };
};

export const generateVocabularyContent = async (topic, level) => {
  return { message: 'English360 AI vocabulary generator foundation ready' };
};

export const generateReadingPassage = async (topic, level) => {
  return { message: 'English360 AI reading passage generator foundation ready' };
};

export const evaluateWriting = async (topic, essayContent, level) => {
  return { message: 'English360 AI writing evaluator foundation ready' };
};

export const generateListeningContent = async (topic, level) => {
  return { message: 'English360 AI listening content generator foundation ready' };
};

export const evaluateAssessment = async (answers) => {
  return { message: 'English360 AI assessment evaluator foundation ready' };
};

export const generateAIRecommendations = async (userProgress) => {
  return { message: 'English360 AI recommendation engine foundation ready' };
};
`);

// 9. Controllers & Routes
const modules = [
  { name: 'auth', controllerName: 'authController', routeFile: 'authRoutes' },
  { name: 'users', controllerName: 'userController', routeFile: 'userRoutes' },
  { name: 'assessment', controllerName: 'assessmentController', routeFile: 'assessmentRoutes' },
  { name: 'grammar', controllerName: 'grammarController', routeFile: 'grammarRoutes' },
  { name: 'vocabulary', controllerName: 'vocabularyController', routeFile: 'vocabularyRoutes' },
  { name: 'reading', controllerName: 'readingController', routeFile: 'readingRoutes' },
  { name: 'writing', controllerName: 'writingController', routeFile: 'writingRoutes' },
  { name: 'listening', controllerName: 'listeningController', routeFile: 'listeningRoutes' },
  { name: 'tests', controllerName: 'testController', routeFile: 'testRoutes' },
  { name: 'results', controllerName: 'resultController', routeFile: 'resultRoutes' },
  { name: 'mistakes', controllerName: 'mistakeController', routeFile: 'mistakeRoutes' },
  { name: 'progress', controllerName: 'progressController', routeFile: 'progressRoutes' },
  { name: 'achievements', controllerName: 'achievementController', routeFile: 'achievementRoutes' },
  { name: 'ai-coach', controllerName: 'aiCoachController', routeFile: 'aiCoachRoutes' }
];

modules.forEach(m => {
  const funcName = 'get' + m.name.replace(/[^a-zA-Z0-9]/g, '') + 'Data';
  // Controller
  fs.writeFileSync(path.join(serverDir, 'controllers', m.controllerName + '.js'), `import { successResponse } from '../utils/responseHandler.js';

export const ${funcName} = async (req, res, next) => {
  try {
    return successResponse(res, { module: '${m.name}', status: 'ready' }, '${m.name} service foundation ready');
  } catch (error) {
    next(error);
  }
};
`);

  // Route
  fs.writeFileSync(path.join(serverDir, 'routes', m.routeFile + '.js'), `import express from 'express';
import { ${funcName} } from '../controllers/${m.controllerName}.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, ${funcName});

export default router;
`);
});

// 10. Health Route
fs.writeFileSync(path.join(serverDir, 'routes', 'healthRoutes.js'), `import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'English360 AI API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
`);

// 11. server.js
fs.writeFileSync(path.join(serverDir, 'server.js'), `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`[English360 AI Server] running on http://localhost:\${PORT}\`);
});

export default app;
`);

console.log('Backend generated successfully!');
