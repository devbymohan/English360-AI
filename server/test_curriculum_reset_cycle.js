import { submitGrammarExercise, getGrammarProgress, getGrammarLesson, resetGrammarProgress } from './controllers/grammarController.js';
import { generateGrammarQuestions } from './services/geminiService.js';

const CANONICAL_GRAMMAR_TOPICS = [
  'Present Simple',
  'Present Continuous',
  'Present Perfect',
  'Past Simple & Continuous',
  'Future Forms & Modals',
  'Conditionals (0, 1, 2, 3)',
  'Passive Voice & Reported Speech',
];

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

// Simulate frontend lock/unlock logic
const computeTopicLocks = (completedTopics = []) => {
  return CANONICAL_GRAMMAR_TOPICS.map((topicTitle, idx) => {
    const isCompleted = completedTopics.includes(topicTitle);
    const isUnlocked = idx === 0 || completedTopics.includes(CANONICAL_GRAMMAR_TOPICS[idx - 1]);
    return {
      topic: topicTitle,
      isCompleted,
      isUnlocked,
    };
  });
};

async function testCurriculumResetCycle() {
  console.log('==============================================================');
  console.log('🧪 GRAMMAR CURRICULUM RESET & NEW CYCLE TEST SUITE');
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

  const userId = 'student_cycle_' + Date.now();
  console.log(`👤 Testing with student: ${userId}\n`);

  // --- Step 1: Simulate user having completed all 7 topics ---
  console.log('--- Step 1: User completes all 7 topics ---');
  for (const topic of CANONICAL_GRAMMAR_TOPICS) {
    const qList = await generateGrammarQuestions(topic, 'B1', 5, `sess_${topic}`);
    const answers = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'A' };
    const req = createMockReq(userId, {
      topic,
      level: 'B1',
      questions: qList.questions,
      answers,
      sessionId: `sess_${topic}`,
    });
    const res = createMockRes();
    await submitGrammarExercise(req, res);
  }

  // Verify all 7 completed
  const reqCheckAll = createMockReq(userId);
  const resCheckAll = createMockRes();
  await getGrammarProgress(reqCheckAll, resCheckAll);
  assert(resCheckAll.data?.data?.completedTopics?.length === 7, 'User initially has 7/7 topics completed');

  // --- Step 2: User clicks "Generate New AI Exercises" (Triggers Curriculum Reset) ---
  console.log('\n--- Step 2: User clicks "Generate New AI Exercises" -> Reset Curriculum Cycle ---');
  const reqReset = createMockReq(userId);
  const resReset = createMockRes();
  await resetGrammarProgress(reqReset, resReset);

  assert(resReset.data?.data?.completedTopics?.length === 0, 'Reset returns 0 completed topics');

  // Check locks immediately after reset
  const reqProgAfterReset = createMockReq(userId);
  const resProgAfterReset = createMockRes();
  await getGrammarProgress(reqProgAfterReset, resProgAfterReset);

  const completedAfterReset = resProgAfterReset.data?.data?.completedTopics || [];
  const locksAfterReset = computeTopicLocks(completedAfterReset);

  assert(locksAfterReset[0].isUnlocked === true, '01. Present Simple -> Available / Unlocked (Not completed)');
  assert(locksAfterReset[0].isCompleted === false, '01. Present Simple -> Not completed (no checkmark)');

  for (let i = 1; i < 7; i++) {
    assert(locksAfterReset[i].isUnlocked === false, `0${i+1}. ${CANONICAL_GRAMMAR_TOPICS[i]} -> 🔒 Locked`);
    assert(locksAfterReset[i].isCompleted === false, `0${i+1}. ${CANONICAL_GRAMMAR_TOPICS[i]} -> Not completed`);
  }

  // --- Step 3: Student completes ONLY Present Simple in the new cycle ---
  console.log('\n--- Step 3: Student completes ONLY "Present Simple" in the new cycle ---');
  const sessionPS = 'sess_ps_new_cycle';
  const psQuestions = await generateGrammarQuestions('Present Simple', 'B1', 5, sessionPS);
  const answersPS = {
    0: psQuestions.questions[0].correctAnswer,
    1: psQuestions.questions[1].correctAnswer,
    2: psQuestions.questions[2].correctAnswer,
    3: psQuestions.questions[3].correctAnswer,
    4: psQuestions.questions[4].correctAnswer,
  };

  const reqSubmitPS = createMockReq(userId, {
    topic: 'Present Simple',
    level: 'B1',
    questions: psQuestions.questions,
    answers: answersPS,
    sessionId: sessionPS,
  });
  const resSubmitPS = createMockRes();
  await submitGrammarExercise(reqSubmitPS, resSubmitPS);

  const completedAfterPS = resSubmitPS.data?.data?.completedTopics || [];
  assert(completedAfterPS.length === 1, `Exactly 1 topic is completed (got ${completedAfterPS.length})`);
  assert(completedAfterPS[0] === 'Present Simple', 'Completed topic is "Present Simple"');

  const locksAfterPS = computeTopicLocks(completedAfterPS);
  assert(locksAfterPS[0].isCompleted === true, '01. Present Simple -> ✓ COMPLETED (checkmark)');
  assert(locksAfterPS[1].isUnlocked === true, '02. Present Continuous -> 🔓 UNLOCKED (next available)');
  assert(locksAfterPS[1].isCompleted === false, '02. Present Continuous -> 🔒 Not completed');

  for (let i = 2; i < 7; i++) {
    assert(locksAfterPS[i].isUnlocked === false, `0${i+1}. ${CANONICAL_GRAMMAR_TOPICS[i]} -> 🔒 REMAINS LOCKED`);
    assert(locksAfterPS[i].isCompleted === false, `0${i+1}. ${CANONICAL_GRAMMAR_TOPICS[i]} -> 🔒 Not completed`);
  }

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL CURRICULUM RESET & PROGRESSION CYCLE CHECKS PASSED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testCurriculumResetCycle();
