import { submitGrammarExercise, getGrammarProgress, resetGrammarProgress } from './controllers/grammarController.js';
import { generateGrammarQuestions } from './services/geminiService.js';

const createMockReq = (userId, body = {}) => ({
  firebaseUid: userId,
  user: { uid: userId },
  body,
});

const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
};

async function testAccuracyReset() {
  console.log('==============================================================');
  console.log('🧪 GRAMMAR ACCURACY & ATTEMPT COUNT RESET TEST SUITE');
  console.log('==============================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (cond, desc) => {
    total++;
    if (cond) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      process.exitCode = 1;
    }
  };

  const userId = 'student_acc_reset_' + Date.now();
  console.log(`👤 Testing with student: ${userId}\n`);

  // --- Step 1: User completes Present Simple first time: 4 correct, 1 wrong (4/5, 80%) ---
  console.log('--- Step 1: User completes Present Simple (4/5, 80%) ---');
  const sess1 = 'sess_1';
  const qList1 = await generateGrammarQuestions('Present Simple', 'B1', 5, sess1);
  const answers1 = {
    0: qList1.questions[0].correctAnswer,
    1: qList1.questions[1].correctAnswer,
    2: qList1.questions[2].correctAnswer,
    3: qList1.questions[3].correctAnswer,
    4: qList1.questions[4].correctAnswer === 'A' ? 'B' : 'A', // 1 wrong
  };

  const req1 = createMockReq(userId, {
    topic: 'Present Simple',
    level: 'B1',
    questions: qList1.questions,
    answers: answers1,
    sessionId: sess1,
  });
  const res1 = createMockRes();
  await submitGrammarExercise(req1, res1);

  const ps1 = res1.data?.data?.topicBreakdown?.find(t => t.topic === 'Present Simple');
  assert(ps1 && ps1.attempted === 5, `Present Simple attempted is 5 (got ${ps1?.attempted})`);
  assert(ps1 && ps1.correct === 4, `Present Simple correct is 4 (got ${ps1?.correct})`);
  assert(ps1 && ps1.wrong === 1, `Present Simple wrong is 1 (got ${ps1?.wrong})`);
  assert(ps1 && ps1.accuracy === 80, `Present Simple accuracy is 80% (got ${ps1?.accuracy}%)`);

  // --- Step 2: User clicks "Generate New AI Exercises" (Reset Triggered) ---
  console.log('\n--- Step 2: User clicks "Generate New AI Exercises" -> Reset Curriculum & Stats ---');
  const reqReset = createMockReq(userId);
  const resReset = createMockRes();
  await resetGrammarProgress(reqReset, resReset);

  const dataReset = resReset.data?.data;
  assert(dataReset && dataReset.completedTopics?.length === 0, 'Reset cleared completedTopics');
  assert(dataReset.overallPerformance?.totalQuestions === 0, 'Reset cleared totalQuestions to 0');
  assert(dataReset.overallPerformance?.correctAnswers === 0, 'Reset cleared correctAnswers to 0');
  assert(dataReset.overallPerformance?.wrongAnswers === 0, 'Reset cleared wrongAnswers to 0');
  assert(dataReset.overallPerformance?.overallAccuracy === 0, 'Reset cleared overallAccuracy to 0%');

  const psAfterReset = dataReset.topicBreakdown?.find(t => t.topic === 'Present Simple');
  assert(psAfterReset && psAfterReset.attempted === 0, `Present Simple attempted reset to 0 (got ${psAfterReset?.attempted})`);
  assert(psAfterReset && psAfterReset.correct === 0, `Present Simple correct reset to 0 (got ${psAfterReset?.correct})`);

  // --- Step 3: In the new exercise, User gets 5/5 (100%) on Present Simple ---
  console.log('\n--- Step 3: In the new exercise, user gets 5/5 (100%) on Present Simple ---');
  const sess2 = 'sess_2';
  const qList2 = await generateGrammarQuestions('Present Simple', 'B1', 5, sess2);
  const answers2 = {
    0: qList2.questions[0].correctAnswer,
    1: qList2.questions[1].correctAnswer,
    2: qList2.questions[2].correctAnswer,
    3: qList2.questions[3].correctAnswer,
    4: qList2.questions[4].correctAnswer, // All 5 correct!
  };

  const req2 = createMockReq(userId, {
    topic: 'Present Simple',
    level: 'B1',
    questions: qList2.questions,
    answers: answers2,
    sessionId: sess2,
  });
  const res2 = createMockRes();
  await submitGrammarExercise(req2, res2);

  const ps2 = res2.data?.data?.topicBreakdown?.find(t => t.topic === 'Present Simple');
  assert(ps2 && ps2.attempted === 5, `Present Simple attempted in new session is 5, NOT 10 (got ${ps2?.attempted})`);
  assert(ps2 && ps2.correct === 5, `Present Simple correct in new session is 5, NOT 9 (got ${ps2?.correct})`);
  assert(ps2 && ps2.wrong === 0, `Present Simple wrong in new session is 0 (got ${ps2?.wrong})`);
  assert(ps2 && ps2.accuracy === 100, `Present Simple accuracy is 100%, NOT 90% (got ${ps2?.accuracy}%)`);

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL ACCURACY & STAT RESET CHECKS PASSED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testAccuracyReset();
