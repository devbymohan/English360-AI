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

const PORT = 5093;
const BASE_URL = `http://localhost:${PORT}/api`;

const userAUid = 'user_mohan_kumar_' + Date.now();
const userBUid = 'user_priya_sharma_' + Date.now();

const userAHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userAUid}`,
};

const userBHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userBUid}`,
};

const server = app.listen(PORT, async () => {
  console.log(`🚀 Master Specification Verification Server started on port ${PORT}`);
  initFirebaseAdmin();

  let testFailures = 0;
  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      testFailures++;
    }
  };

  try {
    console.log('\n======================================================');
    console.log('1. NEW USER REGISTRATION & INITIAL CLEAN STATE (USER A)');
    console.log('======================================================');

    const regRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        firebaseUid: userAUid,
        email: 'mohan.kumar@example.com',
        name: 'Mohan Kumar',
      }),
    });
    const regData = await regRes.json();
    assert(regData.success, 'User registered successfully');
    assert(regData.data?.name === 'Mohan Kumar', 'User name matches entered registration name "Mohan Kumar"');
    assert(regData.data?.englishLevel === 'Not Assessed', 'User English Level defaults to "Not Assessed"');
    assert(regData.data?.streak === 0, 'User initial streak is 0');
    assert(regData.data?.assessmentCompleted === false, 'Assessment completed is false');

    const progRes1 = await fetch(`${BASE_URL}/progress`, {
      method: 'GET',
      headers: userAHeaders,
    });
    const progData1 = await progRes1.json();
    assert(progData1.data?.lessonsCompleted === 0, 'New user completed lessons is 0');
    assert(progData1.data?.streak === 0, 'New user progress streak is 0');
    assert(progData1.data?.mistakesCount === 0, 'New user mistakes count is 0');

    console.log('\n======================================================');
    console.log('2. INITIAL ASSESSMENT DIAGNOSTIC FLOW & LEVEL ESTIMATE');
    console.log('======================================================');

    const assessSubmitRes = await fetch(`${BASE_URL}/assessment/submit`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        grammarScore: 80,
        vocabularyScore: 85,
        readingScore: 90,
        writingScore: 75,
        listeningScore: 80,
      }),
    });
    const assessData = await assessSubmitRes.json();
    assert(assessData.success, 'Assessment submitted successfully');
    assert(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(assessData.data?.estimatedLevel), 'CEFR level estimated (e.g. B2)');
    assert(assessData.data?.overallScore > 0, `Assessment overall score calculated: ${assessData.data?.overallScore}%`);
    assert(assessData.data?.assessmentCompleted === true, 'Assessment completed flag set to true');

    console.log('\n======================================================');
    console.log('3. GRAMMAR MODULE QUESTION GENERATION & EVALUATION');
    console.log('======================================================');

    const gramGenRes = await fetch(`${BASE_URL}/grammar/generate`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({ topic: 'Present Simple', level: 'A2', count: 3 }),
    });
    const gramGenData = await gramGenRes.json();
    assert(gramGenData.success, 'Grammar questions generated by Gemini');
    assert(gramGenData.data?.questions?.length === 3, '3 independent grammar questions returned');
    assert(gramGenData.data?.questions?.[0]?.options?.length >= 2, 'Options normalized with id and text');

    const correctAns = gramGenData.data?.questions?.[0]?.correctAnswer;
    const gramSubmitRes = await fetch(`${BASE_URL}/grammar/submit`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        topic: 'Present Simple',
        level: 'A2',
        questions: gramGenData.data?.questions || [],
        answers: { 0: correctAns, 1: 'WRONG_ANSWER' },
      }),
    });
    const gramSubmitData = await gramSubmitRes.json();
    assert(gramSubmitData.success, 'Grammar exercise submitted');
    assert(gramSubmitData.data?.correctCount === 1, 'Evaluated correct answer as 1');
    assert(gramSubmitData.data?.mistakesCount === 1, 'Recorded 1 incorrect answer to Mistakes');

    console.log('\n======================================================');
    console.log('4. READING MODULE TIMER, WPM & COMPREHENSION');
    console.log('======================================================');

    const readSubmitRes = await fetch(`${BASE_URL}/reading/submit`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        title: 'The Architecture of Focus',
        wordCount: 300,
        readingTimeSeconds: 120, // 2 minutes -> WPM = 150
        questions: [
          { id: 1, prompt: 'Q1', correctAnswer: 'A' },
          { id: 2, prompt: 'Q2', correctAnswer: 'B' },
        ],
        answers: { 0: 'A', 1: 'B' },
      }),
    });
    const readSubmitData = await readSubmitRes.json();
    assert(readSubmitData.success, 'Reading attempt submitted');
    assert(readSubmitData.data?.wpm === 150, `WPM calculated correctly as 150 (got ${readSubmitData.data?.wpm})`);
    assert(readSubmitData.data?.accuracy === 100, 'Reading accuracy calculated as 100%');

    console.log('\n======================================================');
    console.log('5. WRITING EVALUATION VIA GEMINI (4 CRITERIA)');
    console.log('======================================================');

    const writeRes = await fetch(`${BASE_URL}/writing/evaluate`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        topic: 'The Impact of Technology on Students',
        content: 'Technology has revolutionized how students learn today. Online platforms provide immediate access to educational materials. However, excessive screen time can cause distractions.',
        level: 'B1',
      }),
    });
    const writeData = await writeRes.json();
    assert(writeData.success, 'Writing evaluated by Gemini');
    assert(writeData.data?.overallScore > 0, `Overall writing score: ${writeData.data?.overallScore}`);
    assert(writeData.data?.scores?.taskAchievement !== undefined, 'Task Achievement score provided');
    assert(writeData.data?.scores?.coherenceAndCohesion !== undefined, 'Coherence score provided');
    assert(writeData.data?.scores?.lexicalResource !== undefined, 'Lexical Resource score provided');
    assert(writeData.data?.scores?.grammarAndAccuracy !== undefined, 'Grammar score provided');

    console.log('\n======================================================');
    console.log('6. LISTENING MODULE SUBMISSION');
    console.log('======================================================');

    const listenSubmitRes = await fetch(`${BASE_URL}/listening/submit`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        lessonId: 'Library Dialogue',
        title: 'Library Dialogue',
        questions: [
          { id: 1, prompt: 'Q1', correctAnswer: 'B' },
          { id: 2, prompt: 'Q2', correctAnswer: 'A' },
        ],
        answers: { 0: 'B', 1: 'A' },
        timeTaken: '01:30',
      }),
    });
    const listenData = await listenSubmitRes.json();
    assert(listenData.success, 'Listening attempt submitted');
    assert(listenData.data?.score === 100, 'Listening score evaluated accurately as 100%');

    console.log('\n======================================================');
    console.log('7. STANDARDIZED TEST GENERATION & SUBMISSION');
    console.log('======================================================');

    const testSubmitRes = await fetch(`${BASE_URL}/tests/submit`, {
      method: 'POST',
      headers: userAHeaders,
      body: JSON.stringify({
        testId: 'grammar_test_1',
        title: 'Grammar Mastery Exam',
        questions: [
          { id: 1, category: 'Grammar', prompt: 'Q1', correctAnswer: 'A' },
          { id: 2, category: 'Grammar', prompt: 'Q2', correctAnswer: 'B' },
        ],
        answers: { 0: 'A', 1: 'WRONG' },
        timeTaken: '05:00',
      }),
    });
    const testData = await testSubmitRes.json();
    assert(testData.success, 'Test submitted successfully');
    assert(testData.data?.score === 50, 'Test score calculated as 50%');

    console.log('\n======================================================');
    console.log('8. MY MISTAKES REPOSITORY & REVIEW PERSISTENCE');
    console.log('======================================================');

    const mistakeRes = await fetch(`${BASE_URL}/mistakes`, {
      method: 'GET',
      headers: userAHeaders,
    });
    const mistakeData = await mistakeRes.json();
    assert(mistakeData.success, 'Mistakes fetched for Mohan Kumar');
    assert(mistakeData.data?.length >= 1, `Recorded mistakes found in repository: ${mistakeData.data?.length}`);

    if (mistakeData.data?.length > 0) {
      const mistakeId = mistakeData.data[0]._id;
      const reviewRes = await fetch(`${BASE_URL}/mistakes/${mistakeId}/review`, {
        method: 'PUT',
        headers: userAHeaders,
      });
      const reviewData = await reviewRes.json();
      assert(reviewData.success, 'Mistake marked as reviewed');
    }

    console.log('\n======================================================');
    console.log('9. USER B REGISTRATION & DATA ISOLATION VERIFICATION');
    console.log('======================================================');

    const userBRegRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: userBHeaders,
      body: JSON.stringify({
        firebaseUid: userBUid,
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
      }),
    });
    const userBRegData = await userBRegRes.json();
    assert(userBRegData.data?.name === 'Priya Sharma', 'User B registered as "Priya Sharma"');

    const userBMistakesRes = await fetch(`${BASE_URL}/mistakes`, {
      method: 'GET',
      headers: userBHeaders,
    });
    const userBMistakesData = await userBMistakesRes.json();
    assert(userBMistakesData.data?.length === 0, 'User B has 0 mistakes (No leaks from Mohan Kumar)');

    const userBProgRes = await fetch(`${BASE_URL}/progress`, {
      method: 'GET',
      headers: userBHeaders,
    });
    const userBProgData = await userBProgRes.json();
    assert(userBProgData.data?.userName === 'Priya Sharma', 'User B progress shows "Priya Sharma"');
    assert(userBProgData.data?.lessonsCompleted === 0, 'User B lessons completed is 0 (Clean state)');
    assert(userBProgData.data?.streak === 0, 'User B streak is 0');

    console.log('\n======================================================');
    console.log('10. RE-VERIFICATION OF USER A (MOHAN KUMAR) INTEGRITY');
    console.log('======================================================');

    const userAProgRes2 = await fetch(`${BASE_URL}/progress`, {
      method: 'GET',
      headers: userAHeaders,
    });
    const userAProgData2 = await userAProgRes2.json();
    assert(userAProgData2.data?.userName === 'Mohan Kumar', 'User A progress remains "Mohan Kumar"');
    assert(userAProgData2.data?.lessonsCompleted >= 4, `User A has completed ${userAProgData2.data?.lessonsCompleted} lessons`);
    assert(userAProgData2.data?.assessmentCompleted === true, 'User A assessment completed flag is preserved');

    console.log('\n======================================================');
    if (testFailures === 0) {
      console.log('🎉 ALL 28 FUNCTIONAL & ISOLATION CHECKS PASSED 100%! ✅');
    } else {
      console.error(`⚠️ ${testFailures} TEST CHECKS FAILED!`);
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    server.close();
    process.exit(testFailures === 0 ? 0 : 1);
  }
});
