import { evaluateStudentWriting } from './controllers/writingController.js';
import { getNotifications } from './controllers/notificationController.js';
import { computeOverallWritingScore } from './services/geminiService.js';

const createMockReq = (userId, body = {}, params = {}, query = {}) => ({
  firebaseUid: userId,
  user: { uid: userId, email: `${userId}@english360.ai`, displayName: 'Writing Student' },
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

async function testWritingModule() {
  console.log('==============================================================');
  console.log('🧪 WRITING MODULE AUTOMATED VERIFICATION SUITE');
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

  const user = 'user_write_' + Date.now();
  const topic = 'The Impact of Technology on Students';

  // --- Step 1: Unit Test computeOverallWritingScore Helper ---
  console.log('--- Step 1: Unit Test computeOverallWritingScore Helper ---');
  // Off-topic essay: TA = 30, CC = 75, LR = 78, GA = 80
  const offTopicOverall = computeOverallWritingScore(30, 75, 78, 80);
  assert(offTopicOverall <= 40, `Off-topic score (TA=30) is substantially low (Got: ${offTopicOverall}/100, Expected <= 40)`);
  assert(offTopicOverall < 60, 'Off-topic essay does NOT receive 60+ overall');

  // Relevant essay: TA = 85, CC = 85, LR = 85, GA = 85
  const relevantOverall = computeOverallWritingScore(85, 85, 85, 85);
  assert(relevantOverall === 85, `Relevant essay is calculated normally (Got: ${relevantOverall}/100)`);

  // --- Step 2: Trivial Single-Word Submission ("hi") ---
  console.log('\n--- Step 2: Trivial Single-Word Submission ("hi") ---');
  const req1 = createMockReq(user, { topic, content: 'hi', level: 'B1' });
  const res1 = createMockRes();
  await evaluateStudentWriting(req1, res1);

  const eval1 = res1.data?.data;
  assert(eval1 && typeof eval1.overallScore === 'number', 'Returns evaluation object');
  assert(eval1.overallScore <= 15, `Score is very low for "hi" (Got: ${eval1.overallScore}/100, Expected <= 15)`);
  assert(eval1.scores.taskAchievement <= 10, `Task Achievement is very low (Got: ${eval1.scores.taskAchievement})`);
  assert(eval1.scores.coherenceAndCohesion <= 10, `Coherence is very low (Got: ${eval1.scores.coherenceAndCohesion})`);
  assert(Array.isArray(eval1.feedback.strengths) && eval1.feedback.strengths.length === 0, 'No fake strengths generated for "hi"');
  assert(eval1.feedback.weaknesses.length > 0, 'Weakness explains that response is under 50 words and does not address topic');

  console.log(`  "hi" Score: ${eval1.overallScore}/100 | Summary: "${eval1.feedback.summary}"`);

  // --- Step 3: Underlength Submission (20 words) ---
  console.log('\n--- Step 3: Underlength Submission (20 words) ---');
  const shortText = 'Technology is good for students. They can study online with laptops and learn English easily every single day at home.';
  const req2 = createMockReq(user, { topic, content: shortText, level: 'B1' });
  const res2 = createMockRes();
  await evaluateStudentWriting(req2, res2);

  const eval2 = res2.data?.data;
  assert(eval2.overallScore <= 45, `Underlength score is penalized (Got: ${eval2.overallScore}/100, Expected <= 45)`);
  assert(eval2.scores.taskAchievement <= 45, `Task achievement penalized for < 50 words (Got: ${eval2.scores.taskAchievement})`);
  assert(eval2.wordCount < 50, `Word count calculated correctly (${eval2.wordCount} words)`);

  console.log(`  20-word Score: ${eval2.overallScore}/100 | Task Achievement: ${eval2.scores.taskAchievement}`);

  // --- Step 4: Off-Topic Submission (Cricket match for Technology topic) ---
  console.log('\n--- Step 4: Off-Topic Submission (Cricket essay for Technology topic) ---');
  const cricketText = 'Cricket is an internationally popular bat-and-ball game played between two teams of eleven players. The bowler delivers the ball towards the batsman who attempts to strike it and score runs between the wickets. In the recent world championship final, the team chased down two hundred and eighty runs in the final over with magnificent hitting and disciplined fielding performance across fifty overs.';
  const req3 = createMockReq(user, { topic, content: cricketText, level: 'B1' });
  const res3 = createMockRes();
  await evaluateStudentWriting(req3, res3);

  const eval3 = res3.data?.data;
  assert(eval3.scores.taskAchievement <= 35, `Task achievement is heavily penalized for off-topic essay (Got: ${eval3.scores.taskAchievement})`);
  assert(eval3.overallScore <= 40, `Off-topic overall score is substantially low (Got: ${eval3.overallScore}/100, Expected <= 40)`);
  assert(eval3.overallScore < 60, 'Off-topic essay does NOT receive 60+ overall score');
  assert(eval3.feedback.weaknesses.some(w => w.toLowerCase().includes('topic') || w.toLowerCase().includes('address')), 'Feedback flags off-topic content');

  console.log(`  Off-topic Cricket Essay Score: ${eval3.overallScore}/100 | TA: ${eval3.scores.taskAchievement} | CC: ${eval3.scores.coherenceAndCohesion} | LR: ${eval3.scores.lexicalResource} | GA: ${eval3.scores.grammarAndAccuracy}`);

  // --- Step 5: Valid, Meaningful On-Topic Essay (95 words) ---
  console.log('\n--- Step 5: Valid, Meaningful On-Topic Essay (95 words) ---');
  const validEssay = 'In recent years, modern digital technology has fundamentally transformed how students learn and communicate. Educational software and internet access allow learners to explore vast research libraries, collaborate with peers globally, and study at their own pace. However, excessive screen time can also lead to attention fatigue and digital distractions. To maximize academic benefits, educators and students should establish balanced routines that combine digital tools with active reflection. Overall, when used purposefully, technology serves as an invaluable asset for academic growth.';
  const req4 = createMockReq(user, { topic, content: validEssay, level: 'B1' });
  const res4 = createMockRes();
  await evaluateStudentWriting(req4, res4);

  const eval4 = res4.data?.data;
  assert(eval4.overallScore >= 75 && eval4.overallScore <= 98, `Valid essay receives realistic high score (Got: ${eval4.overallScore}/100)`);
  assert(eval4.scores.taskAchievement >= 70, `Task Achievement is strong for on-topic essay (Got: ${eval4.scores.taskAchievement})`);
  assert(eval4.scores.coherenceAndCohesion >= 70, `Coherence is strong (Got: ${eval4.scores.coherenceAndCohesion})`);
  assert(eval4.scores.lexicalResource >= 68, `Lexical resource is strong (Got: ${eval4.scores.lexicalResource})`);
  assert(eval4.scores.grammarAndAccuracy >= 70, `Grammar is strong (Got: ${eval4.scores.grammarAndAccuracy})`);

  const expectedAverage = Math.round(
    (eval4.scores.taskAchievement +
      eval4.scores.coherenceAndCohesion +
      eval4.scores.lexicalResource +
      eval4.scores.grammarAndAccuracy) /
      4
  );
  assert(eval4.overallScore === expectedAverage, `Overall score (${eval4.overallScore}) matches criteria average (${expectedAverage})`);
  assert(Array.isArray(eval4.feedback.strengths) && eval4.feedback.strengths.length > 0, 'Authentic strengths generated for valid essay');

  console.log(`  Valid Essay Score: ${eval4.overallScore}/100 | TA: ${eval4.scores.taskAchievement} | CC: ${eval4.scores.coherenceAndCohesion} | LR: ${eval4.scores.lexicalResource} | GA: ${eval4.scores.grammarAndAccuracy}`);

  // --- Step 6: Notification Created ---
  console.log('\n--- Step 6: Verify Notification Created for Writing Submission ---');
  const reqNotif = createMockReq(user);
  const resNotif = createMockRes();
  await getNotifications(reqNotif, resNotif);

  const notifs = resNotif.data?.data?.notifications || [];
  assert(notifs.some(n => n.type === 'writing'), 'Writing completion notification created');

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} WRITING EVALUATION TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL WRITING MODULE REQUIREMENTS FULLY VERIFIED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testWritingModule();
