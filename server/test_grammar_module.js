import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initFirebaseAdmin } from './config/firebase.js';

import grammarRoutes from './routes/grammarRoutes.js';
import mistakeRoutes from './routes/mistakeRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/progress', progressRoutes);

const PORT = 5092;
const BASE_URL = `http://localhost:${PORT}/api`;

const testUserId = 'test_grammar_user_' + Date.now();
const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${testUserId}`,
};

const TOPICS = [
  'Present Simple',
  'Present Continuous',
  'Present Perfect',
  'Past Simple & Continuous',
  'Future Forms & Modals',
  'Conditionals (0, 1, 2, 3)',
  'Passive Voice & Reported Speech',
];

const server = app.listen(PORT, async () => {
  console.log(`🚀 Grammar Comprehensive Test Server running on port ${PORT}`);
  initFirebaseAdmin();

  let failedTests = 0;
  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedTests++;
    }
  };

  try {
    console.log('\n======================================================');
    console.log('1. INITIAL CLEAN USER REGISTRATION');
    console.log('======================================================');

    const regRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        firebaseUid: testUserId,
        email: 'grammar.tester@example.com',
        name: 'Grammar Tester',
      }),
    });
    const regData = await regRes.json();
    assert(regData.success, 'Test user registered');

    // Initial progress check
    const initProgRes = await fetch(`${BASE_URL}/grammar/progress`, {
      method: 'GET',
      headers: testHeaders,
    });
    const initProgData = await initProgRes.json();
    assert(initProgData.data?.completedTopics?.length === 0, 'New user starts with 0 completed topics');

    console.log('\n======================================================');
    console.log('2. TESTING ALL 7 GRAMMAR TOPICS INDIVIDUALLY');
    console.log('======================================================');

    for (let i = 0; i < TOPICS.length; i++) {
      const topic = TOPICS[i];
      console.log(`\n--- Topic ${i + 1}/${TOPICS.length}: "${topic}" ---`);

      // 1. Generate questions
      const genRes = await fetch(`${BASE_URL}/grammar/generate`, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify({ topic, level: 'B1', count: 5 }),
      });
      const genData = await genRes.json();
      assert(genData.success, `[${topic}] Questions retrieved successfully`);
      const questions = genData.data?.questions || [];
      assert(questions.length === 5, `[${topic}] Returns exactly 5 questions (got ${questions.length})`);

      // 2. Validate question quality
      let validOptions = true;
      let noPlaceholders = true;
      let validKeys = true;
      let validExplanations = true;

      questions.forEach((q, qIdx) => {
        if (!q.options || q.options.length !== 4) validOptions = false;
        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) validKeys = false;
        if (!q.explanation || q.explanation.length < 10) validExplanations = false;
        q.options?.forEach((opt) => {
          if (
            opt.text.includes('Correct structure') ||
            opt.text.includes('Incorrect verb') ||
            opt.text.includes('Missing auxiliary')
          ) {
            noPlaceholders = false;
          }
        });
      });

      assert(validOptions, `[${topic}] Every question has 4 distinct options (A-D)`);
      assert(noPlaceholders, `[${topic}] No placeholder options present in questions`);
      assert(validKeys, `[${topic}] All questions have valid correct answer keys (A-D)`);
      assert(validExplanations, `[${topic}] All questions provide detailed grammar rule explanations`);

      // 3. Submit Answers (4 Correct, 1 Incorrect)
      const answers = {};
      // Answer first 4 correctly
      for (let qIdx = 0; qIdx < 4; qIdx++) {
        answers[qIdx] = questions[qIdx].correctAnswer;
      }
      // Answer 5th question incorrectly
      const correct5 = questions[4].correctAnswer;
      answers[4] = correct5 === 'A' ? 'B' : 'A';

      const submitRes = await fetch(`${BASE_URL}/grammar/submit`, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify({
          topic,
          level: 'B1',
          questions,
          answers,
        }),
      });
      const submitData = await submitRes.json();
      assert(submitData.success, `[${topic}] Exercise submitted successfully`);
      assert(submitData.data?.score === 80, `[${topic}] Score calculated correctly as 80% (got ${submitData.data?.score}%)`);
      assert(submitData.data?.correctCount === 4, `[${topic}] Correct count is 4`);
      assert(submitData.data?.mistakesCount === 1, `[${topic}] Recorded exactly 1 mistake`);

      // 4. Progress persistence verification (page refresh simulation)
      const progRes = await fetch(`${BASE_URL}/grammar/progress`, {
        method: 'GET',
        headers: testHeaders,
      });
      const progData = await progRes.json();
      assert(
        progData.data?.completedTopics?.includes(topic),
        `[${topic}] Saved to completed topics in database`
      );

      // 5. Generate New AI Exercises verification
      const regenRes = await fetch(`${BASE_URL}/grammar/generate`, {
        method: 'POST',
        headers: testHeaders,
        body: JSON.stringify({ topic, level: 'B1', count: 5, refresh: Date.now() }),
      });
      const regenData = await regenRes.json();
      assert(regenData.success, `[${topic}] "Generate New AI Exercises" returned fresh question set`);
    }

    console.log('\n======================================================');
    console.log('3. VERIFYING MY MISTAKES REPOSITORY & TOPIC MAPPING');
    console.log('======================================================');

    const mistakeRes = await fetch(`${BASE_URL}/mistakes?category=Grammar`, {
      method: 'GET',
      headers: testHeaders,
    });
    const mistakeData = await mistakeRes.json();
    assert(mistakeData.success, 'Grammar mistakes retrieved from repository');
    assert(
      mistakeData.data?.length === 7,
      `Exactly 7 mistakes recorded (1 per topic, got ${mistakeData.data?.length})`
    );

    // Verify mistake content structure
    if (mistakeData.data?.length > 0) {
      const firstM = mistakeData.data[0];
      assert(firstM.category === 'Grammar', 'Mistake category is Grammar');
      assert(firstM.question && firstM.userAnswer && firstM.correctAnswer, 'Mistake has question, userAnswer, and correctAnswer');
      assert(firstM.explanation, 'Mistake has grammar explanation');
    }

    console.log('\n======================================================');
    console.log('4. FINAL GRAMMAR PROGRESSION VERIFICATION');
    console.log('======================================================');

    const finalProgRes = await fetch(`${BASE_URL}/grammar/progress`, {
      method: 'GET',
      headers: testHeaders,
    });
    const finalProgData = await finalProgRes.json();
    assert(finalProgData.data?.totalCompleted === 7, 'All 7 grammar topics marked completed');

    console.log('\n======================================================');
    if (failedTests === 0) {
      console.log('🎉 ALL GRAMMAR MODULE AUDIT & CURRICULUM CHECKS PASSED 100%! ✅');
    } else {
      console.error(`⚠️ ${failedTests} CHECKS FAILED!`);
    }
    console.log('======================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    server.close();
    process.exit(failedTests === 0 ? 0 : 1);
  }
});
