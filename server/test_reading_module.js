import { getReadingPassage, submitReadingAttempt } from './controllers/readingController.js';
import { getMistakes } from './controllers/mistakeController.js';
import { getNotifications } from './controllers/notificationController.js';

const createMockReq = (userId, body = {}, params = {}, query = {}) => ({
  firebaseUid: userId,
  user: { uid: userId, email: `${userId}@english360.ai`, displayName: 'Reading Student' },
  body,
  params,
  query,
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

async function testReadingModule() {
  console.log('==============================================================');
  console.log('🧪 READING MODULE AUTOMATED VERIFICATION SUITE');
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

  const userA = 'user_read_A_' + Date.now();
  const userB = 'user_read_B_' + Date.now();

  // --- Step 1: Initial Passage Generation with Exactly 10 Questions ---
  console.log('--- Step 1: Initial Reading Passage with Exactly 10 Questions ---');
  const reqGen1 = createMockReq(userA, { level: 'B1' });
  const resGen1 = createMockRes();
  await getReadingPassage(reqGen1, resGen1);

  const data1 = resGen1.data?.data;
  assert(data1 && data1.title && data1.passage, 'Passage generated with title and passage text');
  assert(Array.isArray(data1.questions), 'Questions array exists');
  assert(data1.questions.length === 10, `Passage contains EXACTLY 10 questions (Got ${data1.questions.length})`);

  // Verify all 10 questions structure
  data1.questions.forEach((q, i) => {
    assert(Boolean(q.prompt), `Question ${i + 1} has valid prompt`);
    assert(Array.isArray(q.options) && q.options.length === 4, `Question ${i + 1} has 4 options (A-D)`);
    assert(['A', 'B', 'C', 'D'].includes(q.correctAnswer), `Question ${i + 1} has valid correctAnswer`);
    assert(Boolean(q.explanation), `Question ${i + 1} has explanation`);
  });

  console.log(`\n  Passage 1 Title: "${data1.title}" (${data1.wordCount} words)`);

  // --- Step 2: "New Passage" Generates a Distinct Passage ---
  console.log('\n--- Step 2: "New Passage" Generates a Different Passage ---');
  const reqGen2 = createMockReq(userA, {
    level: 'B1',
    excludedTopics: [data1.title],
    sessionId: 'sess_read_2_' + Date.now(),
    timestamp: Date.now() + 1000,
  });
  const resGen2 = createMockRes();
  await getReadingPassage(reqGen2, resGen2);

  const data2 = resGen2.data?.data;
  assert(data2.title !== data1.title, `Passage 2 ("${data2.title}") is distinct from Passage 1 ("${data1.title}")`);
  assert(data2.questions.length === 10, 'Passage 2 also contains exactly 10 questions');

  console.log(`  Passage 2 Title: "${data2.title}" (${data2.wordCount} words)`);

  // --- Step 3: Quiz Evaluation on 10 Questions ---
  console.log('\n--- Step 3: Quiz Evaluation on 10 Questions ---');
  // Scenario A: 10/10 Correct
  const answersAll10 = {};
  data2.questions.forEach((q, idx) => {
    answersAll10[idx] = q.correctAnswer;
  });

  const reqQuizA = createMockReq(userA, {
    passageId: data2.title,
    title: data2.title,
    wordCount: data2.wordCount,
    readingTimeSeconds: 90,
    questions: data2.questions,
    answers: answersAll10,
  });
  const resQuizA = createMockRes();
  await submitReadingAttempt(reqQuizA, resQuizA);

  const resultA = resQuizA.data?.data;
  assert(resultA.score === 100, 'Score is 100% when 10/10 questions are correct');
  assert(resultA.correctCount === 10, 'Correct count is 10');
  assert(resultA.wrongCount === 0, 'Wrong count is 0');
  assert(resultA.total === 10, 'Total questions is 10');
  assert(resultA.wpm > 0, `WPM calculated correctly (${resultA.wpm} WPM for 90s)`);
  assert(resultA.mistakesCount === 0, 'No mistakes for 100% score');

  // Scenario B: 7 Correct, 3 Wrong
  const partialAnswers = { ...answersAll10 };
  // Modify 3 answers to wrong options
  const wrongOpt0 = data2.questions[0].options.find(o => o.id !== data2.questions[0].correctAnswer).id;
  const wrongOpt1 = data2.questions[1].options.find(o => o.id !== data2.questions[1].correctAnswer).id;
  const wrongOpt2 = data2.questions[2].options.find(o => o.id !== data2.questions[2].correctAnswer).id;

  partialAnswers[0] = wrongOpt0;
  partialAnswers[1] = wrongOpt1;
  partialAnswers[2] = wrongOpt2;

  const reqQuizB = createMockReq(userA, {
    passageId: data2.title,
    title: data2.title,
    wordCount: data2.wordCount,
    readingTimeSeconds: 120,
    questions: data2.questions,
    answers: partialAnswers,
  });
  const resQuizB = createMockRes();
  await submitReadingAttempt(reqQuizB, resQuizB);

  const resultB = resQuizB.data?.data;
  assert(resultB.score === 70, 'Score is 70% when 7/10 questions are correct');
  assert(resultB.correctCount === 7, 'Correct count is 7');
  assert(resultB.wrongCount === 3, 'Wrong count is 3');
  assert(resultB.mistakesCount === 3, 'Exactly 3 mistakes recorded for 7/10 score');

  // --- Step 4: Verify Mistakes in My Mistakes ---
  console.log('\n--- Step 4: Verify Incorrect Answers Recorded in My Mistakes ---');
  const reqMistakes = createMockReq(userA, {}, {}, { category: 'Reading' });
  const resMistakes = createMockRes();
  await getMistakes(reqMistakes, resMistakes);

  const mistakesList = resMistakes.data?.data || [];
  const readingMistakes = mistakesList.filter(m => m.category === 'Reading');
  assert(readingMistakes.length >= 3, `My Mistakes has at least 3 reading mistakes (Found ${readingMistakes.length})`);
  assert(readingMistakes.some(m => m.topic === data2.title), `Mistakes contain passage topic "${data2.title}"`);

  // --- Step 5: Notifications Integration ---
  console.log('\n--- Step 5: Verify Notification Created for Reading Practice ---');
  const reqNotif = createMockReq(userA);
  const resNotif = createMockRes();
  await getNotifications(reqNotif, resNotif);

  const notifList = resNotif.data?.data?.notifications || [];
  assert(notifList.some(n => n.type === 'reading'), 'Reading practice notification created');

  // --- Step 6: User Isolation Check (User B) ---
  console.log('\n--- Step 6: User Isolation Verification (User B) ---');
  const reqMistakesB = createMockReq(userB, {}, {}, { category: 'Reading' });
  const resMistakesB = createMockRes();
  await getMistakes(reqMistakesB, resMistakesB);
  assert((resMistakesB.data?.data || []).length === 0, 'User B has 0 mistakes (No data leakage from User A)');

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} READING TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL READING MODULE REQUIREMENTS FULLY VERIFIED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testReadingModule();
