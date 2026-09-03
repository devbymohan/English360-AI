import { getReadingPassage, submitReadingAttempt } from './controllers/readingController.js';
import { getVocabularyWords, submitVocabularyQuiz } from './controllers/vocabularyController.js';
import { shuffleQuestionOptions } from './services/geminiService.js';

const createMockReq = (userId, body = {}, params = {}, query = {}) => ({
  firebaseUid: userId,
  user: { uid: userId, email: `${userId}@english360.ai`, displayName: 'Shuffle Student' },
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

async function testOptionShuffling() {
  console.log('==============================================================');
  console.log('🧪 OPTION SHUFFLING AUTOMATED VERIFICATION SUITE');
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

  // --- Step 1: Unit Test shuffleQuestionOptions Helper ---
  console.log('--- Step 1: Unit Test shuffleQuestionOptions Helper ---');
  const sampleQ = {
    prompt: 'What does "Diligent" mean?',
    options: [
      { id: 'A', text: 'Hardworking and earnest' },
      { id: 'B', text: 'Lazy and careless' },
      { id: 'C', text: 'Hesitant and slow' },
      { id: 'D', text: 'Impatient and reckless' },
    ],
    correctAnswer: 'A',
  };

  const correctText = 'Hardworking and earnest';
  const observedPositions = new Set();

  for (let i = 0; i < 30; i++) {
    const shuffled = shuffleQuestionOptions(sampleQ);
    const newCorrectOpt = shuffled.options.find((o) => o.id === shuffled.correctAnswer);
    assert(
      newCorrectOpt && newCorrectOpt.text === correctText,
      `Iteration ${i + 1}: correctAnswer ('${shuffled.correctAnswer}') correctly points to "${correctText}"`
    );
    observedPositions.add(shuffled.correctAnswer);
  }

  assert(
    observedPositions.size >= 3,
    `Correct answer position varies across multiple letters (Observed: ${Array.from(observedPositions).join(', ')})`
  );

  // --- Step 2: Test Reading Module Option Shuffling ---
  console.log('\n--- Step 2: Test Reading Module Option Shuffling ---');
  const user = 'user_shuf_' + Date.now();
  const reqRead = createMockReq(user, { level: 'B1' });
  const resRead = createMockRes();
  await getReadingPassage(reqRead, resRead);

  const readingData = resRead.data?.data;
  assert(readingData && Array.isArray(readingData.questions), 'Reading passage has questions array');
  assert(readingData.questions.length === 10, 'Reading passage has 10 questions');

  const readingLetters = readingData.questions.map((q) => q.correctAnswer);
  const readingUniqueLetters = new Set(readingLetters);
  console.log(`  Reading 10 Questions Correct Answers: ${readingLetters.join(', ')}`);

  assert(
    readingUniqueLetters.size >= 2,
    `Reading questions correct answers are distributed across different letters (Found: ${Array.from(readingUniqueLetters).join(', ')})`
  );
  assert(
    !readingLetters.every((l) => l === 'A'),
    'Reading questions correct answers are NOT all option A'
  );

  // Test submitting answers with new option letters
  const readingAnswers = {};
  readingData.questions.forEach((q, idx) => {
    readingAnswers[idx] = q.correctAnswer;
  });

  const reqReadSubmit = createMockReq(user, {
    passageId: readingData.title,
    title: readingData.title,
    wordCount: readingData.wordCount,
    readingTimeSeconds: 120,
    questions: readingData.questions,
    answers: readingAnswers,
  });
  const resReadSubmit = createMockRes();
  await submitReadingAttempt(reqReadSubmit, resReadSubmit);

  assert(
    resReadSubmit.data?.data?.score === 100,
    'Reading attempt evaluates 100% score when selecting the shuffled correct answers'
  );
  assert(
    resReadSubmit.data?.data?.correctCount === 10,
    'Reading attempt has 10/10 correct count'
  );

  // --- Step 3: Test Vocabulary Module Option Shuffling ---
  console.log('\n--- Step 3: Test Vocabulary Module Option Shuffling ---');
  const reqVocab = createMockReq(user, { level: 'B1', count: 5 });
  const resVocab = createMockRes();
  await getVocabularyWords(reqVocab, resVocab);

  const vocabData = resVocab.data?.data;
  assert(vocabData && Array.isArray(vocabData.words), 'Vocabulary has words array');
  assert(vocabData.words.length === 5, 'Vocabulary has exactly 5 words');

  const vocabLetters = vocabData.words.map((w) => w.practiceQuestion.correctAnswer);
  const vocabUniqueLetters = new Set(vocabLetters);
  console.log(`  Vocabulary 5 Questions Correct Answers: ${vocabLetters.join(', ')}`);

  assert(
    vocabUniqueLetters.size >= 2,
    `Vocabulary questions correct answers are distributed across different letters (Found: ${Array.from(vocabUniqueLetters).join(', ')})`
  );
  assert(
    !vocabLetters.every((l) => l === 'A'),
    'Vocabulary questions correct answers are NOT all option A'
  );

  // Test submitting vocabulary quiz with new option letters
  const vocabAnswers = {};
  vocabData.words.forEach((w, idx) => {
    vocabAnswers[idx] = w.practiceQuestion.correctAnswer;
  });

  const reqVocabSubmit = createMockReq(user, {
    words: vocabData.words,
    answers: vocabAnswers,
  });
  const resVocabSubmit = createMockRes();
  await submitVocabularyQuiz(reqVocabSubmit, resVocabSubmit);

  assert(
    resVocabSubmit.data?.data?.score === 100,
    'Vocabulary quiz evaluates 100% score when selecting shuffled correct answers'
  );
  assert(
    resVocabSubmit.data?.data?.correctCount === 5,
    'Vocabulary quiz has 5/5 correct count'
  );

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} OPTION SHUFFLING TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL OPTION SHUFFLING REQUIREMENTS FULLY VERIFIED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testOptionShuffling();
