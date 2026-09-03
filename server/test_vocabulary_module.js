import {
  getVocabularyWords,
  submitVocabularyQuiz,
  toggleBookmarkWord,
  getBookmarkedWords,
} from './controllers/vocabularyController.js';
import { getMistakes } from './controllers/mistakeController.js';
import { getNotifications } from './controllers/notificationController.js';

const createMockReq = (userId, body = {}, params = {}, query = {}) => ({
  firebaseUid: userId,
  user: { uid: userId, email: `${userId}@english360.ai`, displayName: 'Vocab Student' },
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

async function testVocabularyModule() {
  console.log('==============================================================');
  console.log('🧪 VOCABULARY MODULE AUTOMATED VERIFICATION SUITE');
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

  const userA = 'user_vocab_A_' + Date.now();
  const userB = 'user_vocab_B_' + Date.now();

  // --- Step 1: Exactly 5 Daily Words Generation ---
  console.log('--- Step 1: Verify Initial 5 Daily Words Generation ---');
  const reqGen1 = createMockReq(userA, { level: 'B1', count: 5 });
  const resGen1 = createMockRes();
  await getVocabularyWords(reqGen1, resGen1);

  const data1 = resGen1.data?.data;
  assert(data1 && Array.isArray(data1.words), 'Returns words array');
  assert(data1.words.length === 5, 'Daily vocabulary set contains exactly 5 words');

  // Verify structure of every word
  data1.words.forEach((w, i) => {
    assert(Boolean(w.word && w.meaning && w.example), `Word ${i + 1} (${w.word}) has word, meaning, example`);
    assert(Boolean(w.phonetic), `Word ${i + 1} has phonetic pronunciation`);
    assert(Array.isArray(w.synonyms) && w.synonyms.length > 0, `Word ${i + 1} has synonyms`);
    assert(Array.isArray(w.antonyms) && w.antonyms.length > 0, `Word ${i + 1} has antonyms`);
    assert(Boolean(w.practiceQuestion && w.practiceQuestion.options?.length === 4), `Word ${i + 1} has 4-option practiceQuestion`);
    assert(Boolean(w.practiceQuestion.correctAnswer), `Word ${i + 1} has valid correctAnswer`);
  });

  const wordNames1 = data1.words.map((w) => w.word);
  console.log(`\n  Set 1 Words: ${wordNames1.join(', ')}`);

  // --- Step 2: "Generate New AI Words" returns 5 NEW words ---
  console.log('\n--- Step 2: Generate 5 NEW AI Words (No repetition) ---');
  const reqGen2 = createMockReq(userA, {
    level: 'B1',
    count: 5,
    excludedWords: wordNames1,
    sessionId: 'sess_new_' + Date.now(),
    timestamp: Date.now() + 1000,
  });
  const resGen2 = createMockRes();
  await getVocabularyWords(reqGen2, resGen2);

  const data2 = resGen2.data?.data;
  assert(data2.words.length === 5, 'Generated set 2 contains exactly 5 words');

  const wordNames2 = data2.words.map((w) => w.word);
  console.log(`  Set 2 Words: ${wordNames2.join(', ')}`);

  const overlap = wordNames1.filter((w) => wordNames2.includes(w));
  assert(overlap.length === 0, `Set 2 is completely distinct from Set 1 (Overlap: 0 words)`);

  // --- Step 3: Take Quick Quiz (Testing 5 Current Words) ---
  console.log('\n--- Step 3: Quiz Evaluation on Current 5 Words ---');
  // Scenario A: 5/5 Correct
  const allCorrectAnswers = {};
  data2.words.forEach((w, idx) => {
    allCorrectAnswers[idx] = w.practiceQuestion.correctAnswer;
  });

  const reqQuizA = createMockReq(userA, {
    words: data2.words,
    answers: allCorrectAnswers,
  });
  const resQuizA = createMockRes();
  await submitVocabularyQuiz(reqQuizA, resQuizA);

  const quizResultA = resQuizA.data?.data;
  assert(quizResultA.score === 100, 'Score is 100% when all 5 answers are correct');
  assert(quizResultA.correctCount === 5, 'Correct count is 5');
  assert(quizResultA.wrongCount === 0, 'Wrong count is 0');
  assert(quizResultA.mistakesCount === 0, 'No mistakes recorded for 100% score');

  // Scenario B: 3 Correct, 2 Wrong
  const partialAnswers = { ...allCorrectAnswers };
  // Deliberately choose wrong option for word 0 and word 1
  const wrongOpt0 = data2.words[0].practiceQuestion.options.find(
    (o) => o.id !== data2.words[0].practiceQuestion.correctAnswer
  ).id;
  const wrongOpt1 = data2.words[1].practiceQuestion.options.find(
    (o) => o.id !== data2.words[1].practiceQuestion.correctAnswer
  ).id;

  partialAnswers[0] = wrongOpt0;
  partialAnswers[1] = wrongOpt1;

  const reqQuizB = createMockReq(userA, {
    words: data2.words,
    answers: partialAnswers,
  });
  const resQuizB = createMockRes();
  await submitVocabularyQuiz(reqQuizB, resQuizB);

  const quizResultB = resQuizB.data?.data;
  assert(quizResultB.score === 60, 'Score is 60% for 3/5 correct answers');
  assert(quizResultB.correctCount === 3, 'Correct count is 3');
  assert(quizResultB.wrongCount === 2, 'Wrong count is 2');
  assert(quizResultB.mistakesCount === 2, 'Exactly 2 mistakes recorded in My Mistakes');

  // --- Step 4: Verify Mistakes in My Mistakes ---
  console.log('\n--- Step 4: Verify Wrong Answers in My Mistakes ---');
  const reqMistakes = createMockReq(userA);
  const resMistakes = createMockRes();
  await getMistakes(reqMistakes, resMistakes);

  const mistakeList = resMistakes.data?.data || [];
  const vocabMistakes = mistakeList.filter((m) => m.category === 'Vocabulary');
  assert(vocabMistakes.length >= 2, 'Vocabulary mistakes appear in My Mistakes');
  assert(vocabMistakes.some((m) => m.topic === data2.words[0].word), `Mistake recorded for ${data2.words[0].word}`);
  assert(vocabMistakes.some((m) => m.topic === data2.words[1].word), `Mistake recorded for ${data2.words[1].word}`);

  // --- Step 5: Notifications Integration ---
  console.log('\n--- Step 5: Verify Notification Created for Vocabulary Quiz ---');
  const reqNotif = createMockReq(userA);
  const resNotif = createMockRes();
  await getNotifications(reqNotif, resNotif);

  const notifList = resNotif.data?.data?.notifications || [];
  assert(notifList.some((n) => n.type === 'vocabulary'), 'Vocabulary completion notification exists');

  // --- Step 6: Bookmarking System ---
  console.log('\n--- Step 6: Verify Flashcard / Word Bookmarking ---');
  const targetBookmarkWord = data2.words[2];
  const reqBm1 = createMockReq(userA, { word: targetBookmarkWord });
  const resBm1 = createMockRes();
  await toggleBookmarkWord(reqBm1, resBm1);

  assert(resBm1.data?.data?.bookmarked === true, `Successfully bookmarked "${targetBookmarkWord.word}"`);

  const reqGetBm = createMockReq(userA);
  const resGetBm = createMockRes();
  await getBookmarkedWords(reqGetBm, resGetBm);
  const savedBookmarks = resGetBm.data?.data?.bookmarks || [];
  assert(savedBookmarks.some((b) => b.word.toLowerCase() === targetBookmarkWord.word.toLowerCase()), `Word Bank contains "${targetBookmarkWord.word}"`);

  // --- Step 7: User Isolation Check (User B) ---
  console.log('\n--- Step 7: Verify User Data Isolation (User B) ---');
  const reqBmB = createMockReq(userB);
  const resBmB = createMockRes();
  await getBookmarkedWords(reqBmB, resBmB);
  assert((resBmB.data?.data?.bookmarks || []).length === 0, 'User B has 0 bookmarks (No leakage from User A)');

  const reqMistakesB = createMockReq(userB);
  const resMistakesB = createMockRes();
  await getMistakes(reqMistakesB, resMistakesB);
  assert((resMistakesB.data?.data || []).length === 0, 'User B has 0 mistakes (No leakage from User A)');

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} VOCABULARY TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL VOCABULARY MODULE REQUIREMENTS FULLY VERIFIED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testVocabularyModule();
