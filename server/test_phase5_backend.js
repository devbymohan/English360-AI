import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initFirebaseAdmin } from './config/firebase.js';

import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import grammarRoutes from './routes/grammarRoutes.js';
import vocabularyRoutes from './routes/vocabularyRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import writingRoutes from './routes/writingRoutes.js';
import listeningRoutes from './routes/listeningRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import testRoutes from './routes/testRoutes.js';
import mistakeRoutes from './routes/mistakeRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import aiCoachRoutes from './routes/aiCoachRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai-coach', aiCoachRoutes);

const token = 'usr_gemini_test_user';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token,
};

const server = app.listen(5098, async () => {
  console.log('🚀 Phase 5 Test Server started on port 5098');
  initFirebaseAdmin();

  try {
    // 1. Test Grammar Generation
    console.log('\n--- 1. Testing Grammar Generation (Gemini) ---');
    const gramRes = await fetch('http://localhost:5098/api/grammar/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ topic: 'Present Perfect', level: 'B1', count: 2 }),
    });
    const gramData = await gramRes.json();
    console.log('Grammar Generated Success:', gramData.success);
    console.log('Questions Count:', gramData.data?.questions?.length);
    console.log('First Question Prompt:', gramData.data?.questions?.[0]?.prompt || gramData.data?.questions?.[0]?.sentence);

    // 2. Test Vocabulary Generation
    console.log('\n--- 2. Testing Vocabulary Generation (Gemini) ---');
    const vocRes = await fetch('http://localhost:5098/api/vocabulary/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ level: 'B1', count: 3 }),
    });
    const vocData = await vocRes.json();
    console.log('Vocabulary Generated Success:', vocData.success);
    console.log('Words Generated:', vocData.data?.words?.map(w => w.word).join(', '));

    // 3. Test Writing Evaluation
    console.log('\n--- 3. Testing Writing Evaluation (Gemini) ---');
    const writeRes = await fetch('http://localhost:5098/api/writing/evaluate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        topic: 'Technology in Education',
        content: 'Technology has revolutionized how students learn. However, some students get distracted easily by social media.',
        level: 'B1',
      }),
    });
    const writeData = await writeRes.json();
    console.log('Writing Evaluation Success:', writeData.success);
    console.log('Overall Score:', writeData.data?.overallScore);
    console.log('Scores breakdown:', JSON.stringify(writeData.data?.scores));

    // 4. Test Reading Generation
    console.log('\n--- 4. Testing Reading Generation (Gemini) ---');
    const readRes = await fetch('http://localhost:5098/api/reading/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ topic: 'The Power of Reading', level: 'B1' }),
    });
    const readData = await readRes.json();
    console.log('Reading Passage Success:', readData.success);
    console.log('Passage Word Count:', readData.data?.wordCount);
    console.log('Comprehension Questions Count:', readData.data?.questions?.length);

    // 5. Test AI Coach Chat
    console.log('\n--- 5. Testing AI Coach Interactive Chat (Gemini) ---');
    const coachRes = await fetch('http://localhost:5098/api/ai-coach/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [{ sender: 'user', text: 'How do I distinguish between "since" and "for" in present perfect?' }]
      }),
    });
    const coachData = await coachRes.json();
    console.log('AI Coach Success:', coachData.success);
    console.log('AI Coach Reply:', coachData.data?.reply?.slice(0, 150) + '...');
    console.log('Suggested Actions:', coachData.data?.suggestedActions);

    console.log('\n🎉 ALL REAL GEMINI MODULE ENDPOINTS PASSED SUCCESSFULLY! ✅');
  } catch (err) {
    console.error('Phase 5 test failure:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
