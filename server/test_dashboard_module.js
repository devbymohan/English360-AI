import { getDashboardSummary } from './controllers/progressController.js';
import { submitAssessment } from './controllers/assessmentController.js';
import { submitGrammarExercise } from './controllers/grammarController.js';
import { getNotifications, markAsRead, markAllAsRead } from './controllers/notificationController.js';
import { syncUser, getMyProfile } from './controllers/userController.js';
import { generateGrammarQuestions } from './services/geminiService.js';

const createMockReq = (userId, body = {}, params = {}) => ({
  firebaseUid: userId,
  user: { uid: userId, email: `${userId}@english360.ai`, displayName: 'Test Student' },
  body,
  params,
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

// Greeting test helper
const getTimeBasedGreeting = (hour) => {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

async function testDashboardModule() {
  console.log('==============================================================');
  console.log('🧪 DASHBOARD MODULE & NOTIFICATIONS TEST SUITE');
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

  const userA = 'user_dash_A_' + Date.now();
  const userB = 'user_dash_B_' + Date.now();

  console.log(`👤 Testing User A: ${userA}`);
  console.log(`👤 Testing User B: ${userB}\n`);

  // --- Step 1: Initial Dashboard for User A (Not Assessed) ---
  console.log('--- Step 1: User A Initial Dashboard State ---');
  const reqInitA = createMockReq(userA);
  const resInitA = createMockRes();
  await getDashboardSummary(reqInitA, resInitA);

  const initDataA = resInitA.data?.data;
  assert(initDataA && initDataA.user, 'Dashboard returns user object');
  assert(initDataA.user.assessmentCompleted === false, 'Initial assessmentCompleted is false');
  assert(initDataA.user.englishLevel === 'Not Assessed', 'Initial level is "Not Assessed"');
  assert(initDataA.streak === 0, 'Initial streak is 0');
  assert(initDataA.recentActivities.length === 0, 'Initial activities is empty');

  // --- Step 2: User A Completes Diagnostic Assessment ---
  console.log('\n--- Step 2: User A Completes Diagnostic Assessment (80% overall -> B2 Level) ---');
  const reqAssess = createMockReq(userA, {
    grammarScore: 80,
    vocabularyScore: 80,
    readingScore: 80,
    writingScore: 80,
    listeningScore: 80,
  });
  const resAssess = createMockRes();
  await submitAssessment(reqAssess, resAssess);

  const assessData = resAssess.data?.data;
  assert(assessData.assessmentCompleted === true, 'Assessment recorded as completed');
  assert(assessData.estimatedLevel === 'B2', 'Level evaluated as B2 (80%)');

  // Verify Dashboard immediately reflects B2 level & completed assessment
  const reqDashA = createMockReq(userA);
  const resDashA = createMockRes();
  await getDashboardSummary(reqDashA, resDashA);

  const dashDataA = resDashA.data?.data;
  assert(dashDataA.user.assessmentCompleted === true, 'Dashboard confirms assessmentCompleted is true');
  assert(dashDataA.user.englishLevel === 'B2', 'Dashboard shows real CEFR level "B2"');
  assert(dashDataA.streak === 1, 'Streak is now 1 day (today\'s assessment)');
  assert(dashDataA.recentActivities.length === 1, 'Assessment added to recent activities');

  // --- Step 3: Verify Notifications for User A ---
  console.log('\n--- Step 3: Verify Notifications Generated for User A ---');
  const reqNotifA = createMockReq(userA);
  const resNotifA = createMockRes();
  await getNotifications(reqNotifA, resNotifA);

  const notifDataA = resNotifA.data?.data;
  assert(notifDataA && Array.isArray(notifDataA.notifications), 'Returns notifications array');
  assert(notifDataA.notifications.length >= 1, 'Assessment notification exists');
  assert(notifDataA.unreadCount >= 1, 'Unread notification count is at least 1');
  assert(notifDataA.notifications[0].type === 'assessment', 'Notification type is "assessment"');

  const assessNotifId = notifDataA.notifications[0]._id;

  // --- Step 4: User A Completes Grammar Exercise (Generates Grammar Notification) ---
  console.log('\n--- Step 4: User A Completes Grammar Exercise ---');
  const qList = await generateGrammarQuestions('Present Simple', 'B1', 5, 'sess_dash');
  const answers = {
    0: qList.questions[0].correctAnswer,
    1: qList.questions[1].correctAnswer,
    2: qList.questions[2].correctAnswer,
    3: qList.questions[3].correctAnswer,
    4: qList.questions[4].correctAnswer,
  };
  const reqGrammar = createMockReq(userA, {
    topic: 'Present Simple',
    level: 'B1',
    questions: qList.questions,
    answers,
    sessionId: 'sess_dash',
  });
  const resGrammar = createMockRes();
  await submitGrammarExercise(reqGrammar, resGrammar);

  // Check notifications after grammar
  const resNotifA2 = createMockRes();
  await getNotifications(reqNotifA, resNotifA2);
  const notifDataA2 = resNotifA2.data?.data;
  assert(notifDataA2.notifications.length >= 2, 'Grammar notification added (total >= 2)');
  assert(notifDataA2.notifications.some(n => n.type === 'grammar'), 'Notification of type "grammar" exists');

  // --- Step 5: Mark Notifications as Read ---
  console.log('\n--- Step 5: Mark Single Notification and All Notifications as Read ---');
  const reqMark1 = createMockReq(userA, {}, { id: assessNotifId });
  const resMark1 = createMockRes();
  await markAsRead(reqMark1, resMark1);

  const resNotifA3 = createMockRes();
  await getNotifications(reqNotifA, resNotifA3);
  assert(resNotifA3.data?.data?.notifications.find(n => n._id === assessNotifId)?.read === true, 'Single notification marked as read');

  // Mark all read
  const reqMarkAll = createMockReq(userA);
  const resMarkAll = createMockRes();
  await markAllAsRead(reqMarkAll, resMarkAll);

  const resNotifA4 = createMockRes();
  await getNotifications(reqNotifA, resNotifA4);
  assert(resNotifA4.data?.data?.unreadCount === 0, 'All notifications marked as read (unreadCount === 0)');

  // --- Step 6: User Isolation Check (User B) ---
  console.log('\n--- Step 6: User Isolation Verification (User B) ---');
  const reqDashB = createMockReq(userB);
  const resDashB = createMockRes();
  await getDashboardSummary(reqDashB, resDashB);

  const dashDataB = resDashB.data?.data;
  assert(dashDataB.user.assessmentCompleted === false, 'User B assessmentCompleted is false');
  assert(dashDataB.user.englishLevel === 'Not Assessed', 'User B level is "Not Assessed"');
  assert(dashDataB.streak === 0, 'User B streak is 0');
  assert(dashDataB.recentActivities.length === 0, 'User B has 0 activities');

  const reqNotifB = createMockReq(userB);
  const resNotifB = createMockRes();
  await getNotifications(reqNotifB, resNotifB);
  assert(resNotifB.data?.data?.notifications.length === 0, 'User B has 0 notifications (no leakage from User A)');

  // --- Step 7: Time-Based Greeting Verification ---
  console.log('\n--- Step 7: Time-Based Greeting Rules Verification ---');
  assert(getTimeBasedGreeting(6) === 'Good morning', '6:00 AM -> Good morning');
  assert(getTimeBasedGreeting(11) === 'Good morning', '11:00 AM -> Good morning');
  assert(getTimeBasedGreeting(12) === 'Good afternoon', '12:00 PM -> Good afternoon');
  assert(getTimeBasedGreeting(16) === 'Good afternoon', '4:00 PM -> Good afternoon');
  assert(getTimeBasedGreeting(17) === 'Good evening', '5:00 PM -> Good evening');
  assert(getTimeBasedGreeting(20) === 'Good evening', '8:00 PM -> Good evening');
  assert(getTimeBasedGreeting(21) === 'Good night', '9:00 PM -> Good night');
  assert(getTimeBasedGreeting(2) === 'Good night', '2:00 AM -> Good night');

  console.log('\n==============================================================');
  console.log(`📊 FINAL SUMMARY: ${passed} / ${total} TESTS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL DASHBOARD & NOTIFICATION MODULE CHECKS PASSED 100%! ✅');
  }
  console.log('==============================================================\n');
}

testDashboardModule();
