import { submitGrammarExercise, getGrammarProgress, getGrammarLesson } from './controllers/grammarController.js';
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

async function testCurriculumCompletionState() {
  console.log('==============================================================');
  console.log('🧪 GRAMMAR CURRICULUM COMPLETION & PROGRESSION TEST SUITE');
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

  const newUserId = 'clean_student_' + Date.now();
  console.log(`👤 Testing with brand-new student account: ${newUserId}\n`);

  // --- Step 1: Initial State for Brand-New User ---
  console.log('--- Step 1: Check Initial Curriculum State for Brand-New Student ---');
  const reqInit = createMockReq(newUserId);
  const resInit = createMockRes();
  await getGrammarProgress(reqInit, resInit);

  const initData = resInit.data?.data;
  assert(initData && Array.isArray(initData.completedTopics), 'Returns completedTopics array');
  assert(initData.completedTopics.length === 0, `Initial completed topics is 0 (got ${initData.completedTopics.length})`);

  const initLocks = computeTopicLocks(initData.completedTopics);
  assert(initLocks[0].isUnlocked === true, 'Present Simple is UNLOCKED (available)');
  assert(initLocks[0].isCompleted === false, 'Present Simple is NOT completed yet');
  for (let i = 1; i < 7; i++) {
    assert(initLocks[i].isUnlocked === false, `${CANONICAL_GRAMMAR_TOPICS[i]} is LOCKED`);
    assert(initLocks[i].isCompleted === false, `${CANONICAL_GRAMMAR_TOPICS[i]} is NOT completed`);
  }

  // --- Step 2: Student completes ONLY Present Simple ---
  console.log('\n--- Step 2: Student submits and completes ONLY "Present Simple" ---');
  const session1 = 'sess_ps_1';
  const psQuestions = await generateGrammarQuestions('Present Simple', 'B1', 5, session1);
  const answers1 = {
    0: psQuestions.questions[0].correctAnswer,
    1: psQuestions.questions[1].correctAnswer,
    2: psQuestions.questions[2].correctAnswer,
    3: psQuestions.questions[3].correctAnswer,
    4: psQuestions.questions[4].correctAnswer,
  };

  const reqSubmit1 = createMockReq(newUserId, {
    topic: 'Present Simple',
    level: 'B1',
    questions: psQuestions.questions,
    answers: answers1,
    sessionId: session1,
  });
  const resSubmit1 = createMockRes();
  await submitGrammarExercise(reqSubmit1, resSubmit1);

  const submit1Data = resSubmit1.data?.data;
  assert(submit1Data && submit1Data.completedTopics, 'Submit returns completedTopics');
  assert(submit1Data.completedTopics.length === 1, `Exactly 1 topic is completed (got ${submit1Data.completedTopics.length})`);
  assert(submit1Data.completedTopics[0] === 'Present Simple', 'Completed topic is "Present Simple"');

  const locksAfter1 = computeTopicLocks(submit1Data.completedTopics);
  assert(locksAfter1[0].isCompleted === true, '✓ Present Simple is COMPLETED');
  assert(locksAfter1[1].isUnlocked === true, '✓ Present Continuous is UNLOCKED (next available)');
  assert(locksAfter1[1].isCompleted === false, '🔒 Present Continuous is NOT completed');
  for (let i = 2; i < 7; i++) {
    assert(locksAfter1[i].isUnlocked === false, `🔒 ${CANONICAL_GRAMMAR_TOPICS[i]} remains LOCKED`);
    assert(locksAfter1[i].isCompleted === false, `🔒 ${CANONICAL_GRAMMAR_TOPICS[i]} is NOT completed`);
  }

  // --- Step 3: Student clicks "Generate New AI Exercises" on Present Simple ---
  console.log('\n--- Step 3: Student clicks "Generate New AI Exercises" for "Present Simple" ---');
  const session2 = 'sess_ps_2';
  const reqGen = createMockReq(newUserId, {
    topic: 'Present Simple',
    level: 'B1',
    count: 5,
    sessionId: session2,
    timestamp: Date.now(),
  });
  const resGen = createMockRes();
  await getGrammarLesson(reqGen, resGen);

  const genData = resGen.data?.data;
  assert(genData && Array.isArray(genData.questions), 'New questions generated successfully');
  assert(genData.questions.length === 5, 'Returned 5 questions');

  // Verify that generating new questions DID NOT modify or corrupt the completedTopics
  const reqCheck = createMockReq(newUserId);
  const resCheck = createMockRes();
  await getGrammarProgress(reqCheck, resCheck);

  const checkData = resCheck.data?.data;
  assert(checkData.completedTopics.length === 1, `After new generation: Completed topics is STILL strictly 1 (got ${checkData.completedTopics.length})`);
  assert(checkData.completedTopics[0] === 'Present Simple', 'Completed topic is STILL strictly "Present Simple"');

  const locksAfterGen = computeTopicLocks(checkData.completedTopics);
  assert(locksAfterGen[0].isCompleted === true, '✓ Present Simple is STILL COMPLETED');
  assert(locksAfterGen[1].isUnlocked === true, '✓ Present Continuous REMAINS UNLOCKED');
  assert(locksAfterGen[1].isCompleted === false, '🔒 Present Continuous is NOT completed');
  for (let i = 2; i < 7; i++) {
    assert(locksAfterGen[i].isUnlocked === false, `🔒 ${CANONICAL_GRAMMAR_TOPICS[i]} REMAINS LOCKED`);
    assert(locksAfterGen[i].isCompleted === false, `🔒 ${CANONICAL_GRAMMAR_TOPICS[i]} is NOT completed`);
  }

  // --- Step 4: Refresh Page Simulation ---
  console.log('\n--- Step 4: Refresh Page Verification ---');
  const reqRefresh = createMockReq(newUserId);
  const resRefresh = createMockRes();
  await getGrammarProgress(reqRefresh, resRefresh);

  const refreshData = resRefresh.data?.data;
  assert(refreshData.completedTopics.length === 1, 'Refreshed completed topics count is 1');
  assert(refreshData.completedTopics[0] === 'Present Simple', 'Refreshed completed topic is "Present Simple"');

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL CURRICULUM COMPLETION & PROGRESSION CHECKS PASSED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testCurriculumCompletionState();
