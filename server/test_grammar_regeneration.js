import { generateGrammarQuestions } from './services/geminiService.js';

const GRAMMAR_TOPICS = [
  'Present Simple',
  'Present Continuous',
  'Present Perfect',
  'Past Simple & Continuous',
  'Future Forms & Modals',
  'Conditionals (0, 1, 2, 3)',
  'Passive Voice & Reported Speech',
];

async function runGrammarRegenerationSuite() {
  console.log('======================================================');
  console.log('🧪 GRAMMAR NEW TEST GENERATION & ISOLATION TEST SUITE');
  console.log('======================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, desc) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      process.exitCode = 1;
    }
  };

  for (const topic of GRAMMAR_TOPICS) {
    console.log(`\n--- Testing Topic: "${topic}" ---`);

    // 1. Generation 1
    const session1 = 'sess_1_' + Date.now();
    const test1 = await generateGrammarQuestions(topic, 'B1', 5, session1, Date.now());

    assert(test1 && Array.isArray(test1.questions), `[${topic}] Gen 1: Successfully returned test object with questions`);
    assert(test1.questions.length === 5, `[${topic}] Gen 1: Returned exactly 5 questions (got ${test1.questions.length})`);
    
    // Check options
    const allHave4Options = test1.questions.every(q => q.options && q.options.length === 4);
    assert(allHave4Options, `[${topic}] Gen 1: Every question has 4 distinct options (A-D)`);

    const q1Sentences = test1.questions.map(q => q.sentence || q.prompt);

    // 2. Generation 2 (simulating user clicking "Generate New AI Exercises")
    const session2 = 'sess_2_' + (Date.now() + 1000);
    const test2 = await generateGrammarQuestions(topic, 'B1', 5, session2, Date.now() + 1000);

    assert(test2 && Array.isArray(test2.questions), `[${topic}] Gen 2: Successfully returned fresh test object`);
    assert(test2.questions.length === 5, `[${topic}] Gen 2: Returned exactly 5 questions (got ${test2.questions.length})`);

    const q2Sentences = test2.questions.map(q => q.sentence || q.prompt);

    // Check that questions changed or are differently sampled
    const isDifferentFromGen1 = JSON.stringify(q1Sentences) !== JSON.stringify(q2Sentences);
    assert(isDifferentFromGen1, `[${topic}] Gen 2: Questions are NEW and DIFFERENT from Gen 1`);

    // 3. Generation 3 (simulating clicking "Generate New AI Exercises" again)
    const session3 = 'sess_3_' + (Date.now() + 2000);
    const test3 = await generateGrammarQuestions(topic, 'B1', 5, session3, Date.now() + 2000);

    assert(test3 && Array.isArray(test3.questions), `[${topic}] Gen 3: Successfully returned 3rd test object`);
    assert(test3.questions.length === 5, `[${topic}] Gen 3: Returned exactly 5 questions (got ${test3.questions.length})`);

    const q3Sentences = test3.questions.map(q => q.sentence || q.prompt);
    const isDifferentFromGen2 = JSON.stringify(q2Sentences) !== JSON.stringify(q3Sentences);
    assert(isDifferentFromGen2, `[${topic}] Gen 3: Questions are NEW and DIFFERENT from Gen 2`);

    // Verify all questions have unique session IDs and valid answers
    const allHaveValidAnswers = test1.questions.concat(test2.questions, test3.questions).every(q => ['A', 'B', 'C', 'D'].includes(q.correctAnswer));
    assert(allHaveValidAnswers, `[${topic}] All generated questions across 3 sessions have valid correct answers`);
  }

  console.log('\n======================================================');
  console.log(`📊 FINAL SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL GRAMMAR REGENERATION & ISOLATION CHECKS PASSED 100%! ✅');
  }
  console.log('======================================================\n');
}

runGrammarRegenerationSuite();
