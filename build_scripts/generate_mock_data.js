import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const mockDataFile = path.join(rootDir, 'client', 'src', 'data', 'mockData.js');

const mockDataContent = `// Static Mock Data for English360 AI UI (Design Source of Truth)

export const currentUser = {
  id: 'usr_arjun_01',
  name: 'Arjun',
  email: 'arjun@english360.ai',
  level: 'B1',
  levelLabel: 'B1 – Intermediate',
  levelProgress: 76,
  nextLevel: 'B2 Upper-Intermediate',
  streakDays: 12,
  notificationsCount: 3,
  points: 2410,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isPremium: false,
};

export const dashboardPlan = [
  { id: 'grammar', title: 'Grammar', time: '10 min', progress: '3 / 10', status: 'continue', color: 'emerald', icon: 'FileText' },
  { id: 'vocabulary', title: 'Vocabulary', time: '10 min', progress: '0 / 10', status: 'start', color: 'violet', icon: 'Sparkles' },
  { id: 'reading', title: 'Reading', time: '15 min', progress: '0 / 10', status: 'start', color: 'blue', icon: 'BookOpen' },
  { id: 'writing', title: 'Writing', time: '15 min', progress: '0 / 5', status: 'start', color: 'amber', icon: 'Edit3' },
  { id: 'listening', title: 'Listening', time: '10 min', progress: '0 / 10', status: 'start', color: 'rose', icon: 'Headphones' },
];

export const skillProgress = [
  { skill: 'Grammar', score: 82, status: 'Good', color: 'bg-emerald-500', barColor: '#10B981', delta: '+8%' },
  { skill: 'Vocabulary', score: 68, status: 'Needs Practice', color: 'bg-violet-500', barColor: '#8B5CF6', delta: '+5%' },
  { skill: 'Reading', score: 84, status: 'Great', color: 'bg-blue-500', barColor: '#3B82F6', delta: '+6%' },
  { skill: 'Writing', score: 71, status: 'Good', color: 'bg-amber-500', barColor: '#F97316', delta: '+4%' },
  { skill: 'Listening', score: 76, status: 'Good', color: 'bg-rose-500', barColor: '#EF4444', delta: '+3%' },
];

export const recentActivities = [
  { id: 1, title: 'Completed Reading Practice', subtitle: 'The Impact of Technology', score: '85%', timeAgo: '2h ago', type: 'Reading', icon: 'BookOpen', iconColor: 'text-blue-600 bg-blue-50' },
  { id: 2, title: 'Vocabulary Quiz', subtitle: 'Learned 15 new words', score: '78%', timeAgo: '4h ago', type: 'Vocabulary', icon: 'Sparkles', iconColor: 'text-violet-600 bg-violet-50' },
  { id: 3, title: 'Grammar Practice', subtitle: 'Articles and Determiners', score: '90%', timeAgo: '1d ago', type: 'Grammar', icon: 'FileText', iconColor: 'text-emerald-600 bg-emerald-50' },
  { id: 4, title: 'Listening Practice', subtitle: 'Daily Conversation – Part 1', score: '75%', timeAgo: '1d ago', type: 'Listening', icon: 'Headphones', iconColor: 'text-rose-600 bg-rose-50' },
  { id: 5, title: 'Writing Practice', subtitle: 'My Favorite Book (Essay)', score: '80%', timeAgo: '2d ago', type: 'Writing', icon: 'Edit3', iconColor: 'text-amber-600 bg-amber-50' },
];

export const recommendedForYou = [
  { id: 1, title: 'Improve Vocabulary', subtitle: 'Learn 20 high frequency words', icon: 'BookMarked', color: 'text-emerald-600 bg-emerald-100', route: '/vocabulary' },
  { id: 2, title: 'Grammar: Prepositions', subtitle: 'Practice prepositions exercises', icon: 'PenTool', color: 'text-amber-600 bg-amber-100', route: '/grammar' },
  { id: 3, title: 'Reading Practice', subtitle: 'Short stories for beginners', icon: 'BookOpen', color: 'text-blue-600 bg-blue-100', route: '/reading' },
];

export const grammarLessonData = {
  title: 'Present Perfect Tense',
  topic: 'Tenses',
  level: 'B1',
  description: 'The Present Perfect tense is used to talk about actions that started in the past and continue to the present or have a result now.',
  examples: [
    { text: 'I have finished my homework.', highlight: 'have finished' },
    { text: 'She has visited Paris.', highlight: 'has visited' },
    { text: 'They have been friends for 5 years.', highlight: 'have been' },
    { text: 'We have already seen this movie.', highlight: 'have already seen' },
  ],
  topicsList: [
    { id: 1, title: 'Present Simple', progress: '10/10', completed: true },
    { id: 2, title: 'Present Continuous', progress: '8/10', completed: true },
    { 
      id: 3, 
      title: 'Present Perfect', 
      progress: '6/10', 
      active: true,
      subtopics: [
        { id: '3a', title: 'Introduction', completed: true },
        { id: '3b', title: 'Positive Sentences', completed: true },
        { id: '3c', title: 'Negative Sentences', progress: '3/5', current: true },
        { id: '3d', title: 'Questions', progress: '0/5' },
      ]
    },
    { id: 4, title: 'Past Simple', progress: '0/10', locked: true },
    { id: 5, title: 'Future Tense', progress: '0/10', locked: true },
  ],
  currentQuestion: {
    questionNumber: 4,
    totalQuestions: 10,
    time: '05:32',
    prompt: 'Choose the correct option.',
    sentence: 'She ___________ her project already.',
    options: [
      { id: 'A', text: 'have completed' },
      { id: 'B', text: 'has completed', correct: true },
      { id: 'C', text: 'having completed' },
      { id: 'D', text: 'completes' }
    ],
    selectedAnswer: 'B',
    explanation: "We use 'has' with third person singular subjects (he, she, it)."
  }
};

export const vocabularyData = {
  todayGoal: { learned: 6, total: 20, newWords: 10, reviewed: 6, mastered: 2 },
  todayWords: [
    { id: 1, word: 'Abundant', meaning: 'More than enough', phonetic: "/əˈbʌndənt/", isNew: true, bookmarked: true },
    { id: 2, word: 'Diligent', meaning: 'Hardworking and careful', phonetic: "/ˈdɪlɪdʒənt/", bookmarked: false },
    { id: 3, word: 'Eloquent', meaning: 'Fluent or persuasive in speaking', phonetic: "/ˈɛləkwənt/", bookmarked: false },
    { id: 4, word: 'Futuristic', meaning: 'Relating to the future', phonetic: "/ˌfjuːtʃəˈrɪstɪk/", bookmarked: false },
    { id: 5, word: 'Genuine', meaning: 'Real and sincere', phonetic: "/ˈdʒɛnjuɪn/", bookmarked: false },
    { id: 6, word: 'Persist', meaning: 'Continue firmly', phonetic: "/pəˈsɪst/", bookmarked: false },
    { id: 7, word: 'Serene', meaning: 'Calm and peaceful', phonetic: "/səˈriːn/", bookmarked: false },
    { id: 8, word: 'Versatile', meaning: 'Able to adapt to many things', phonetic: "/ˈvɜːsətaɪl/", bookmarked: false },
  ],
  activeWord: {
    word: 'Abundant',
    phonetic: '/əˈbʌndənt/',
    tag: 'New Word',
    meaning: 'More than enough; very plentiful.',
    example: 'The garden was abundant with beautiful flowers.',
    synonyms: ['plentiful', 'ample', 'copious', 'numerous'],
    antonyms: ['scarce', 'insufficient', 'limited', 'rare'],
    practiceQuestion: {
      prompt: 'Choose the correct meaning of the word "Abundant".',
      options: [
        { id: 'A', text: 'To make a mistake' },
        { id: 'B', text: 'More than enough; plentiful', correct: true },
        { id: 'C', text: 'To be afraid of something' },
        { id: 'D', text: 'Without any help' },
      ],
      selectedAnswer: 'B'
    }
  },
  stats: {
    progress: 68,
    wordsLearned: 56,
    wordsReviewed: 34,
    wordsMastered: 12,
    streak: 12
  }
};

export const readingData = {
  title: 'The Power of Discipline',
  level: 'B1 Level',
  wordCount: 450,
  timer: '08:35',
  passage: \`Discipline is the bridge between goals and accomplishment. Many people have big dreams, but only a few succeed. The difference between those who achieve their goals and those who don't is discipline.

Discipline does not mean being harsh with yourself. It means training your mind to stay focused even when it is difficult. It means doing the right thing, even when you don't feel like it.

Small daily actions create big results over time. Waking up early, studying consistently, eating healthy, and avoiding distractions may seem small, but they shape your future.

The good news is that anyone can build discipline. It starts with a decision and continues with daily practice. When you are disciplined, you become stronger, more confident, and closer to your goals.\`,
  difficultWords: ['Discipline', 'Accomplishment', 'Consistently', 'Distractions', 'Confident'],
  questions: [
    { number: 1, status: 'answered' },
    { number: 2, status: 'answered' },
    { number: 3, status: 'current' },
    { number: 4, status: 'unanswered' },
    { number: 5, status: 'unanswered' },
    { number: 6, status: 'unanswered' },
    { number: 7, status: 'unanswered' },
    { number: 8, status: 'unanswered' },
    { number: 9, status: 'unanswered' },
    { number: 10, status: 'unanswered' },
  ],
  currentQuestion: {
    number: 3,
    prompt: 'What is the main idea of the passage?',
    options: [
      { id: 'A', text: 'Discipline is not important for success.' },
      { id: 'B', text: 'Only a few people have big dreams.' },
      { id: 'C', text: 'Discipline is the key to achieving goals.', correct: true },
      { id: 'D', text: 'Small actions have no impact.' }
    ],
    selectedAnswer: 'C',
    feedback: {
      isCorrect: true,
      text: 'The passage explains that discipline is the bridge between goals and accomplishment.'
    }
  },
  stats: {
    timeTaken: '08:35',
    wpm: 152,
    score: '3/10',
    accuracy: '60%'
  }
};

export const writingData = {
  task: {
    level: 'B1 Level',
    minWords: 150,
    topic: 'The Impact of Technology on Students\\' Learning',
    prompt: 'Write about the advantages and disadvantages of technology and give your own opinion.'
  },
  essayDraft: \`Technology has become an important part of students' lives. It has changed the way we learn and access information. There are many advantages and some disadvantages of technology in education.

One of the biggest advantages is that students can access a lot of information quickly. The internet, educational apps, and online videos make learning more interesting and engaging. Technology also helps in communication and collaboration through online platforms.

However, there are also some disadvantages. Students may get distracted by social media and games. Excessive use of technology can lead to health problems like eye strain and lack of physical activity.

In my opinion, technology is a useful tool if used in the right way. Students should balance technology with other activities for better learning and a healthy life.\`,
  wordCount: 186,
  scoreOverview: {
    overall: 78,
    status: 'Good',
    taskAchievement: 75,
    coherence: 80,
    lexicalResource: 76,
    grammar: 78
  },
  checklist: [
    { label: 'Word Count (150+ words)', checked: true },
    { label: 'Introduction', checked: true },
    { label: 'Body Paragraphs', checked: true },
    { label: 'Conclusion', checked: true }
  ],
  detailedFeedback: {
    whatsGood: 'Good introduction and clear ideas. You have supported your points well.',
    toImprove: 'Try to use more varied vocabulary. Some sentences can be more specific.',
    suggestions: 'Add more examples to support your ideas. Check minor grammar mistakes.'
  }
};

export const listeningData = {
  title: 'Conversation: At the Library',
  level: 'B1 Level',
  duration: '02:45',
  currentTime: '00:00',
  waveform: [30, 45, 60, 80, 50, 90, 75, 40, 65, 85, 95, 70, 55, 60, 45, 35, 70, 80, 60, 50, 40, 30, 20, 15, 25, 40, 55, 70, 65, 50, 40, 30],
  currentQuestion: {
    number: 3,
    prompt: 'What is the main reason the girl is going to the library today?',
    options: [
      { id: 'A', text: 'To return a book' },
      { id: 'B', text: 'To borrow a dictionary' },
      { id: 'C', text: 'To prepare for a presentation', correct: true },
      { id: 'D', text: 'To meet her friend' }
    ],
    selectedAnswer: 'C'
  },
  wordBank: ['presentation', 'research', 'topic', 'library', 'borrow', 'prepare'],
  tips: [
    'Listen carefully without looking at the questions.',
    'Take notes of key words while listening.',
    'Focus on the main ideas and details.',
    "Don't worry if you miss a word, keep going!"
  ],
  stats: {
    completedPercent: 30,
    answered: 3,
    total: 10,
    correct: 2,
    timeTaken: '01:25'
  }
};

export const testsCatalog = [
  { id: 'test_1', title: 'Mixed Grammar Test - Level B1', topics: 'Tenses, Articles, Prepositions and more', questions: 20, duration: '30 min', level: 'B1 Level', score: 85, date: '25 May 2024', color: 'emerald' },
  { id: 'test_2', title: 'Advanced Vocabulary Test', topics: 'Synonyms, Antonyms, Idioms and more', questions: 25, duration: '30 min', level: 'B1 Level', score: 76, date: '22 May 2024', color: 'amber' },
  { id: 'test_3', title: 'Reading Comprehension Test', topics: '3 Passages with Multiple Choice Questions', questions: 30, duration: '45 min', level: 'B1 Level', score: 90, date: '20 May 2024', color: 'blue' },
  { id: 'test_4', title: 'Listening Test - Conversations', topics: 'Listen and answer the questions', questions: 20, duration: '30 min', level: 'B1 Level', score: 68, date: '18 May 2024', color: 'purple' },
];

export const testResultDetail = {
  id: 'test_1',
  title: 'Mixed Grammar Test - Level B1',
  subtitle: 'Tenses, Articles, Prepositions and more',
  date: 'May 25, 2024',
  timeTaken: '30 min',
  totalQuestions: 20,
  score: 17,
  scorePercentage: 85,
  verdict: 'Excellent!',
  summary: { correct: 17, incorrect: 3, skipped: 0, accuracy: 85 },
  sectionScores: [
    { section: 'Grammar', score: '6 / 7', percent: 86, color: '#10B981' },
    { section: 'Vocabulary', score: '5 / 6', percent: 83, color: '#F97316' },
    { section: 'Reading', score: '4 / 5', percent: 80, color: '#3B82F6' },
    { section: 'Listening', score: '2 / 2', percent: 100, color: '#8B5CF6' },
  ],
  strengths: [
    'Strong understanding of tenses',
    'Good vocabulary usage',
    'Excellent listening skills'
  ],
  areasToImprove: [
    'Prepositions usage',
    'Article (A, An, The)',
    'Reading comprehension'
  ],
  questionsReview: [
    { id: 1, section: 'Grammar', prompt: 'Choose the correct tense: She ________ to school every day.', userAnswer: 'goes', correctAnswer: 'goes', isCorrect: true },
    { id: 2, section: 'Vocabulary', prompt: 'Synonym of "Happy"?', userAnswer: 'Joyful', correctAnswer: 'Joyful', isCorrect: true },
    { id: 3, section: 'Reading', prompt: 'What is the main idea of the passage?', userAnswer: 'Climate change', correctAnswer: 'Climate change', isCorrect: true },
    { id: 4, section: 'Grammar', prompt: 'Fill in the blank: He is good ________ math.', userAnswer: 'on', correctAnswer: 'at', isCorrect: false, explanation: "We use 'good at' when referring to skills or academic subjects." },
    { id: 5, section: 'Vocabulary', prompt: 'Antonym of "Difficult"?', userAnswer: 'Hard', correctAnswer: 'Easy', isCorrect: false, explanation: "'Hard' is a synonym of difficult. The antonym (opposite) is 'Easy'." },
  ]
};

export const mistakesData = {
  summary: {
    totalMistakes: 48,
    thisWeek: 16,
    thisWeekDelta: '12% down',
    accuracy: 68,
    topicsToImprove: 4
  },
  trend: [
    { day: 'May 20', mistakes: 18 },
    { day: 'May 21', mistakes: 15 },
    { day: 'May 22', mistakes: 22 },
    { day: 'May 23', mistakes: 14 },
    { day: 'May 24', mistakes: 16 },
    { day: 'May 25', mistakes: 12 },
    { day: 'May 26', mistakes: 16 },
  ],
  breakdown: [
    { name: 'Grammar', count: 18, percentage: 37.5, color: '#EF4444' },
    { name: 'Vocabulary', count: 12, percentage: 25.0, color: '#F59E0B' },
    { name: 'Reading', count: 9, percentage: 18.8, color: '#3B82F6' },
    { name: 'Listening', count: 6, percentage: 12.5, color: '#8B5CF6' },
    { name: 'Writing', count: 3, percentage: 6.2, color: '#10B981' },
  ],
  topMistakeTopics: [
    { topic: 'Tenses', count: 12, color: 'text-rose-600 bg-rose-50' },
    { topic: 'Synonyms & Antonyms', count: 9, color: 'text-amber-600 bg-amber-50' },
    { topic: 'Reading Main Idea', count: 7, color: 'text-blue-600 bg-blue-50' },
    { topic: 'Articles (A, An, The)', count: 6, color: 'text-rose-600 bg-rose-50' },
    { topic: 'Prepositions', count: 5, color: 'text-emerald-600 bg-emerald-50' },
  ],
  items: [
    {
      id: 1,
      category: 'Grammar',
      prompt: 'Fill in the blank: She ________ to school every day.',
      userAnswer: 'go',
      correctAnswer: 'goes',
      explanation: "For third person singular (he/she/it), we add '-es' to the verb.",
      source: 'Mixed Grammar Test',
      date: 'May 26, 2024 • 10:30 AM'
    },
    {
      id: 2,
      category: 'Vocabulary',
      prompt: 'Synonym of "Happy"?',
      userAnswer: 'Sad',
      correctAnswer: 'Joyful',
      explanation: "'Joyful' means feeling or showing great pleasure and happiness.",
      source: 'Vocabulary Builder - Set 12',
      date: 'May 25, 2024 • 09:15 PM'
    },
    {
      id: 3,
      category: 'Reading',
      prompt: 'What is the main idea of the passage?',
      userAnswer: 'Climate change effects',
      correctAnswer: 'The impact of human activities on climate change',
      explanation: 'The passage mainly discusses how human activities contribute to climate change.',
      source: 'Reading Practice - Article',
      date: 'May 25, 2024 • 06:45 PM'
    },
    {
      id: 4,
      category: 'Listening',
      prompt: 'What is the man looking for?',
      userAnswer: 'His bag',
      correctAnswer: 'His passport',
      explanation: 'The man lost his passport, not his bag.',
      source: 'Airport Conversation',
      date: 'May 24, 2024 • 12:20 PM'
    },
    {
      id: 5,
      category: 'Writing',
      prompt: "Identify the error: She don't like pizza.",
      userAnswer: "don't",
      correctAnswer: "doesn't",
      explanation: "With third person singular (she/he/it), use 'doesn\\'t'.",
      source: 'Writing Practice - Set 8',
      date: 'May 23, 2024 • 08:10 PM'
    },
    {
      id: 6,
      category: 'Vocabulary',
      prompt: 'Antonym of "Difficult"?',
      userAnswer: 'Hard',
      correctAnswer: 'Easy',
      explanation: "'Easy' means not difficult.",
      source: 'Vocabulary Builder - Set 11',
      date: 'May 23, 2024 • 07:30 PM'
    }
  ]
};

export const aiCoachData = {
  greeting: "Hi Arjun! 👋",
  intro: "I'm your AI Coach. I'm here to help you improve your English skills step by step. What would you like to work on today?",
  quickPills: ['Grammar', 'Vocabulary', 'Writing', 'Study Plan'],
  recommendedCards: [
    { title: 'Improve Articles', desc: 'Learn the correct usage of a, an, the.', tag: 'Grammar', color: 'emerald' },
    { title: 'Advanced Synonyms', desc: 'Expand your vocabulary with advanced words.', tag: 'Vocabulary', color: 'amber' },
    { title: 'Essay Writing Practice', desc: 'Practice writing essays with AI feedback.', tag: 'Writing', color: 'violet' },
    { title: 'Sentence Variety', desc: 'Improve complexity in compound sentences.', tag: 'Grammar', color: 'blue' }
  ],
  chatHistory: [
    { sender: 'coach', text: 'Hello Arjun! How can I help you today?', time: '10:30 AM' },
    { sender: 'user', text: 'I want to improve my essay writing. Any tips?', time: '10:31 AM' },
    { 
      sender: 'coach', 
      text: "Great! Here are some quick tips:\\n1. Plan your essay before you start.\\n2. Use clear structure: Introduction, Body, Conclusion.\\n3. Use examples and link your ideas.\\n4. Always proofread your essay.", 
      time: '10:31 AM' 
    }
  ],
  overview: {
    improvement: 72,
    topicsPracticed: 12,
    sessionsCount: 48,
    timeWithCoach: '18h 20m',
    recommendationsFollowed: '94%'
  },
  recentRecommendations: [
    { title: 'Use transition words in essays', desc: 'Improve flow in your writing.', date: 'May 20', color: 'emerald' },
    { title: 'Learn new idioms', desc: 'Idioms make your English natural.', date: 'May 18', color: 'amber' },
    { title: 'Practice describing graphs', desc: 'Useful for data interpretation.', date: 'May 15', color: 'violet' },
  ],
  dailyGoal: {
    completed: 3,
    total: 4,
    items: [
      { text: 'Practice 20 new words', done: true },
      { text: 'Write 1 paragraph', done: true },
      { text: 'Complete reading module', done: true },
      { text: 'AI session (10 min)', done: false },
    ]
  }
};

export const progressData = {
  overallScore: 78,
  lessonsCompleted: 120,
  questionsSolved: 512,
  averageAccuracy: 86,
  timeSpent: '42h 30m',
  levelProgress: 70,
  level: 'B1 Intermediate',
  levelRemaining: 30,
  trend: [
    { date: 'Apr 21', accuracy: 30 },
    { date: 'Apr 28', accuracy: 48 },
    { date: 'May 5', accuracy: 55 },
    { date: 'May 12', accuracy: 72 },
    { date: 'May 19', accuracy: 86 },
  ],
  weeklyActivity: [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: true },
    { day: 'Fri', active: true },
    { day: 'Sat', inProgress: true },
    { day: 'Sun', active: false },
  ],
  totalWeeklyHours: '6h 45m',
  streakDays: 12,
  recentActivities: [
    { title: 'Grammar: Tenses – Practice Test', level: 'B1 Level • 20 Questions', score: '92%', date: 'May 19, 2024', color: 'emerald' },
    { title: 'Vocabulary: Synonyms – Set 12', level: 'B1 Level • 15 Words', score: '80%', date: 'May 18, 2024', color: 'amber' },
    { title: 'Reading: Article – Technology', level: 'B1 Level • 5 Min Read', score: '88%', date: 'May 17, 2024', color: 'blue' },
    { title: 'Listening: Conversation at Airport', level: 'B1 Level • 8 Questions', score: '75%', date: 'May 16, 2024', color: 'purple' },
  ],
  areasToImprove: [
    { skill: 'Writing', desc: 'Work on sentence structure and cohesion.', icon: 'Edit3', color: 'violet', route: '/writing' },
    { skill: 'Listening', desc: 'Focus on understanding fast conversations.', icon: 'Headphones', color: 'cyan', route: '/listening' },
    { skill: 'Vocabulary', desc: 'Learn more advanced synonyms.', icon: 'Sparkles', color: 'amber', route: '/vocabulary' },
  ]
};

export const achievementsData = {
  stats: {
    unlocked: 24,
    inProgress: 3,
    points: 2410,
    streak: 12
  },
  summaryCategories: [
    { name: 'Learning', count: 14, color: '#3B82F6' },
    { name: 'Consistency', count: 6, color: '#10B981' },
    { name: 'Performance', count: 3, color: '#F59E0B' },
    { name: 'Special', count: 1, color: '#8B5CF6' },
  ],
  badges: [
    { id: 1, title: 'First Lesson', desc: 'Complete your first lesson', points: 10, status: 'unlocked', date: 'May 10, 2024', category: 'Learning', icon: 'BookOpen', color: 'emerald' },
    { id: 2, title: 'Keep Going', desc: 'Complete 10 lessons', points: 50, status: 'unlocked', date: 'May 14, 2024', category: 'Learning', icon: 'Award', color: 'blue' },
    { id: 3, title: 'Dedicated Learner', desc: 'Complete 50 lessons', points: 200, status: 'unlocked', date: 'May 20, 2024', category: 'Learning', icon: 'Shield', color: 'purple' },
    { id: 4, title: 'Streak Master', desc: 'Maintain a 7-day study streak', points: 100, status: 'unlocked', date: 'May 19, 2024', category: 'Consistency', icon: 'Flame', color: 'amber' },
    { id: 5, title: 'Listening Star', desc: 'Score 90% in any listening test', points: 75, status: 'unlocked', date: 'May 18, 2024', category: 'Performance', icon: 'Headphones', color: 'rose' },
    { id: 6, title: 'Perfect Score', desc: 'Score 100% in any test', points: 150, status: 'in_progress', progress: '3/5 Tests', category: 'Performance', icon: 'CheckCircle', color: 'teal' },
    { id: 7, title: 'Writer', desc: 'Write 5 essays', points: 60, status: 'in_progress', progress: '2/5 Essays', category: 'Learning', icon: 'Edit3', color: 'slate' },
    { id: 8, title: 'Vocabulary Pro', desc: 'Learn 500 new words', points: 120, status: 'locked', progress: '0/500 Words', category: 'Learning', icon: 'Lock', color: 'gray' },
  ],
  recentUnlocks: [
    { title: 'Streak Master', desc: 'Maintain a 7-day study streak', date: 'May 19, 2024', points: '+100 Pts', color: 'amber' },
    { title: 'Listening Star', desc: 'Score 90% in any listening test', date: 'May 18, 2024', points: '+75 Pts', color: 'rose' },
    { title: 'Keep Going', desc: 'Complete 10 lessons', date: 'May 14, 2024', points: '+50 Pts', color: 'blue' },
  ]
};
`;

fs.writeFileSync(mockDataFile, mockDataContent.trim());
console.log('Generated mockData.js successfully!');
