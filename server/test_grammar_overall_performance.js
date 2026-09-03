import { submitGrammarExercise, getGrammarProgress } from './controllers/grammarController.js';
import { generateGrammarQuestions } from './services/geminiService.js';

// Mock Express req/res
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

async function testOverallPerformance() {
  console.log('======================================================');
  console.log('🧪 GRAMMAR OVERALL PERFORMANCE & ISOLATION TEST SUITE');
  console.log('======================================================\n');

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

  const userA = 'user_student_A_' + Date.now();
  const userB = 'user_student_B_' + Date.now();

  console.log(`👤 Testing with Authenticated User A: ${userA}`);
  console.log(`👤 Testing with Authenticated User B: ${userB}\n`);

  // --- Step 1: User A completes Topic 1: Present Simple ---
  console.log('--- Step 1: User A submits 5 questions for "Present Simple" (4 correct, 1 wrong) ---');
  const sessA1 = 'sess_userA_1';
  const topic1Questions = await generateGrammarQuestions('Present Simple', 'B1', 5, sessA1);

  // Provide 4 correct answers and 1 wrong answer
  const answersA1 = {
    0: topic1Questions.questions[0].correctAnswer, // Correct
    1: topic1Questions.questions[1].correctAnswer, // Correct
    2: topic1Questions.questions[2].correctAnswer, // Correct
    3: topic1Questions.questions[3].correctAnswer, // Correct
    4: topic1Questions.questions[4].correctAnswer === 'A' ? 'B' : 'A', // Wrong
  };

  const reqA1 = createMockReq(userA, {
    topic: 'Present Simple',
    level: 'B1',
    questions: topic1Questions.questions,
    answers: answersA1,
    sessionId: sessA1,
  });
  const resA1 = createMockRes();
  await submitGrammarExercise(reqA1, resA1);

  const dataA1 = resA1.data?.data;
  assert(dataA1 && dataA1.overallPerformance, 'Submit returns overallPerformance object');
  assert(dataA1.overallPerformance.totalQuestions === 5, `Total attempted is 5 (got ${dataA1.overallPerformance.totalQuestions})`);
  assert(dataA1.overallPerformance.correctAnswers === 4, `Correct count is 4 (got ${dataA1.overallPerformance.correctAnswers})`);
  assert(dataA1.overallPerformance.wrongAnswers === 1, `Wrong count is 1 (got ${dataA1.overallPerformance.wrongAnswers})`);
  assert(dataA1.overallPerformance.overallAccuracy === 80, `Overall accuracy is 80% (got ${dataA1.overallPerformance.overallAccuracy}%)`);

  // Topic Breakdown for Present Simple
  const psBreakdown1 = dataA1.topicBreakdown.find(t => t.topic === 'Present Simple');
  assert(psBreakdown1 && psBreakdown1.attempted === 5, 'Present Simple breakdown: 5 attempted');
  assert(psBreakdown1.correct === 4, 'Present Simple breakdown: 4 correct');
  assert(psBreakdown1.wrong === 1, 'Present Simple breakdown: 1 wrong');
  assert(psBreakdown1.accuracy === 80, 'Present Simple breakdown: 80% accuracy');

  // --- Step 2: User A completes Topic 2: Present Continuous (2 correct, 3 wrong) ---
  console.log('\n--- Step 2: User A submits 5 questions for "Present Continuous" (2 correct, 3 wrong) ---');
  const sessA2 = 'sess_userA_2';
  const topic2Questions = await generateGrammarQuestions('Present Continuous', 'B1', 5, sessA2);

  const answersA2 = {
    0: topic2Questions.questions[0].correctAnswer, // Correct
    1: topic2Questions.questions[1].correctAnswer, // Correct
    2: topic2Questions.questions[2].correctAnswer === 'A' ? 'B' : 'A', // Wrong
    3: topic2Questions.questions[3].correctAnswer === 'A' ? 'B' : 'A', // Wrong
    4: topic2Questions.questions[4].correctAnswer === 'A' ? 'B' : 'A', // Wrong
  };

  const reqA2 = createMockReq(userA, {
    topic: 'Present Continuous',
    level: 'B1',
    questions: topic2Questions.questions,
    answers: answersA2,
    sessionId: sessA2,
  });
  const resA2 = createMockRes();
  await submitGrammarExercise(reqA2, resA2);

  const dataA2 = resA2.data?.data;
  assert(dataA2.overallPerformance.totalQuestions === 10, `Combined Total attempted is 10 (got ${dataA2.overallPerformance.totalQuestions})`);
  assert(dataA2.overallPerformance.correctAnswers === 6, `Combined Correct count is 6 (got ${dataA2.overallPerformance.correctAnswers})`);
  assert(dataA2.overallPerformance.wrongAnswers === 4, `Combined Wrong count is 4 (got ${dataA2.overallPerformance.wrongAnswers})`);
  // Combined accuracy: 6 / 10 = 60%
  assert(dataA2.overallPerformance.overallAccuracy === 60, `Overall accuracy correctly calculated as 60% (6/10 = 60%, got ${dataA2.overallPerformance.overallAccuracy}%)`);

  // --- Step 3: User A completes Topic 3: Present Perfect (5 correct, 0 wrong) ---
  console.log('\n--- Step 3: User A submits 5 questions for "Present Perfect" (5 correct, 0 wrong) ---');
  const sessA3 = 'sess_userA_3';
  const topic3Questions = await generateGrammarQuestions('Present Perfect', 'B1', 5, sessA3);

  const answersA3 = {
    0: topic3Questions.questions[0].correctAnswer,
    1: topic3Questions.questions[1].correctAnswer,
    2: topic3Questions.questions[2].correctAnswer,
    3: topic3Questions.questions[3].correctAnswer,
    4: topic3Questions.questions[4].correctAnswer,
  };

  const reqA3 = createMockReq(userA, {
    topic: 'Present Perfect',
    level: 'B1',
    questions: topic3Questions.questions,
    answers: answersA3,
    sessionId: sessA3,
  });
  const resA3 = createMockRes();
  await submitGrammarExercise(reqA3, resA3);

  const dataA3 = resA3.data?.data;
  assert(dataA3.overallPerformance.totalQuestions === 15, `Combined Total attempted is 15 (got ${dataA3.overallPerformance.totalQuestions})`);
  assert(dataA3.overallPerformance.correctAnswers === 11, `Combined Correct count is 11 (got ${dataA3.overallPerformance.correctAnswers})`);
  assert(dataA3.overallPerformance.wrongAnswers === 4, `Combined Wrong count is 4 (got ${dataA3.overallPerformance.wrongAnswers})`);
  // Overall accuracy: (11 / 15) * 100 = 73.333% -> 73%
  assert(dataA3.overallPerformance.overallAccuracy === 73, `Overall accuracy correctly calculated from actual questions as 73% (11/15 = 73%, got ${dataA3.overallPerformance.overallAccuracy}%)`);

  // --- Step 4: Verify Refresh via GET /api/grammar/progress ---
  console.log('\n--- Step 4: Verify Progress Retrieval for User A via getGrammarProgress ---');
  const reqProgA = createMockReq(userA);
  const resProgA = createMockRes();
  await getGrammarProgress(reqProgA, resProgA);

  const progDataA = resProgA.data?.data;
  assert(progDataA && progDataA.overallPerformance, 'Progress route returns overallPerformance');
  assert(progDataA.overallPerformance.totalQuestions === 15, 'Persisted total questions is 15');
  assert(progDataA.overallPerformance.correctAnswers === 11, 'Persisted correct answers is 11');
  assert(progDataA.overallPerformance.wrongAnswers === 4, 'Persisted wrong answers is 4');
  assert(progDataA.overallPerformance.overallAccuracy === 73, 'Persisted overall accuracy is 73%');
  assert(progDataA.completedTopics.length >= 3, 'Persisted at least 3 completed topics');

  // --- Step 5: Verify Duplicate Submission Prevention ---
  console.log('\n--- Step 5: Verify duplicate submission does NOT double count ---');
  const resDup = createMockRes();
  await submitGrammarExercise(reqA3, resDup); // Submitting same session A3 again

  const reqProgDup = createMockReq(userA);
  const resProgDup = createMockRes();
  await getGrammarProgress(reqProgDup, resProgDup);

  const progDataDup = resProgDup.data?.data;
  assert(progDataDup.overallPerformance.totalQuestions === 15, `Deduplication verified: Total questions remained 15 (got ${progDataDup.overallPerformance.totalQuestions})`);
  assert(progDataDup.overallPerformance.correctAnswers === 11, `Deduplication verified: Correct answers remained 11 (got ${progDataDup.overallPerformance.correctAnswers})`);

  // --- Step 6: Verify Complete User Isolation (User B has 0 questions) ---
  console.log('\n--- Step 6: Verify User B cannot see User A\'s Grammar results ---');
  const reqProgB = createMockReq(userB);
  const resProgB = createMockRes();
  await getGrammarProgress(reqProgB, resProgB);

  const progDataB = resProgB.data?.data;
  assert(progDataB.overallPerformance.totalQuestions === 0, `User B total questions is 0 (got ${progDataB.overallPerformance.totalQuestions})`);
  assert(progDataB.overallPerformance.correctAnswers === 0, `User B correct answers is 0 (got ${progDataB.overallPerformance.correctAnswers})`);
  assert(progDataB.overallPerformance.wrongAnswers === 0, `User B wrong answers is 0 (got ${progDataB.overallPerformance.wrongAnswers})`);
  assert(progDataB.overallPerformance.overallAccuracy === 0, `User B overall accuracy is 0% (got ${progDataB.overallPerformance.overallAccuracy}%)`);
  assert(progDataB.completedTopics.length === 0, 'User B has 0 completed topics');

  console.log('\n======================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL GRAMMAR OVERALL PERFORMANCE & ISOLATION CHECKS PASSED 100%! ✅');
  }
  console.log('======================================================\n');
}

testOverallPerformance();
