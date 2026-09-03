import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const servicesDir = path.join(rootDir, 'client', 'src', 'services');

// 1. grammarService.js
fs.writeFileSync(path.join(servicesDir, 'grammarService.js'), `import api from './api';

export const grammarService = {
  getLesson: async (topic = 'Present Perfect', level = 'B1', count = 5) => {
    const response = await api.post('/grammar/generate', { topic, level, count });
    return response.data?.data;
  },
  submitExercise: async (submissionData) => {
    const response = await api.post('/grammar/submit', submissionData);
    return response.data?.data;
  },
};
`);

// 2. vocabularyService.js
fs.writeFileSync(path.join(servicesDir, 'vocabularyService.js'), `import api from './api';

export const vocabularyService = {
  getWords: async (level = 'B1', count = 8) => {
    const response = await api.post('/vocabulary/generate', { level, count });
    return response.data?.data;
  },
  submitQuiz: async (quizData) => {
    const response = await api.post('/vocabulary/submit-quiz', quizData);
    return response.data?.data;
  },
};
`);

// 3. readingService.js
fs.writeFileSync(path.join(servicesDir, 'readingService.js'), `import api from './api';

export const readingService = {
  getPassage: async (topic = 'The Power of Discipline', level = 'B1') => {
    const response = await api.post('/reading/generate', { topic, level });
    return response.data?.data;
  },
  submitAttempt: async (attemptData) => {
    const response = await api.post('/reading/submit', attemptData);
    return response.data?.data;
  },
};
`);

// 4. writingService.js
fs.writeFileSync(path.join(servicesDir, 'writingService.js'), `import api from './api';

export const writingService = {
  evaluate: async (topic, content, level = 'B1') => {
    const response = await api.post('/writing/evaluate', { topic, content, level });
    return response.data?.data;
  },
};
`);

// 5. listeningService.js
fs.writeFileSync(path.join(servicesDir, 'listeningService.js'), `import api from './api';

export const listeningService = {
  getLesson: async (topic = 'At the University Library', level = 'B1') => {
    const response = await api.post('/listening/generate', { topic, level });
    return response.data?.data;
  },
  submitAttempt: async (attemptData) => {
    const response = await api.post('/listening/submit', attemptData);
    return response.data?.data;
  },
};
`);

// 6. assessmentService.js
fs.writeFileSync(path.join(servicesDir, 'assessmentService.js'), `import api from './api';

export const assessmentService = {
  getAssessment: async (level = 'B1') => {
    const response = await api.post('/assessment/generate', { level });
    return response.data?.data;
  },
  submitAssessment: async (resultsData) => {
    const response = await api.post('/assessment/submit', resultsData);
    return response.data?.data;
  },
};
`);

// 7. testService.js
fs.writeFileSync(path.join(servicesDir, 'testService.js'), `import api from './api';

export const testService = {
  generateTest: async (category = 'Mixed', level = 'B1', count = 10, difficulty = 'Medium') => {
    const response = await api.post('/tests/generate', { category, level, count, difficulty });
    return response.data?.data;
  },
  submitTest: async (testData) => {
    const response = await api.post('/tests/submit', testData);
    return response.data?.data;
  },
  getResultById: async (id) => {
    const response = await api.get(\`/tests/results/\${id}\`);
    return response.data?.data;
  },
};
`);

// 8. mistakeService.js
fs.writeFileSync(path.join(servicesDir, 'mistakeService.js'), `import api from './api';

export const mistakeService = {
  getMistakes: async (params = {}) => {
    const response = await api.get('/mistakes', { params });
    return response.data?.data;
  },
  markReviewed: async (id) => {
    const response = await api.put(\`/mistakes/\${id}/review\`);
    return response.data?.data;
  },
  getStats: async () => {
    const response = await api.get('/mistakes/stats');
    return response.data?.data;
  },
};
`);

// 9. aiCoachService.js
fs.writeFileSync(path.join(servicesDir, 'aiCoachService.js'), `import api from './api';

export const aiCoachService = {
  chat: async (messages) => {
    const response = await api.post('/ai-coach/chat', { messages });
    return response.data?.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/ai-coach/recommendations');
    return response.data?.data;
  },
};
`);

// 10. progressService.js
fs.writeFileSync(path.join(servicesDir, 'progressService.js'), `import api from './api';

export const progressService = {
  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data?.data;
  },
  getDashboard: async () => {
    const response = await api.get('/progress/dashboard');
    return response.data?.data;
  },
};
`);

// 11. achievementService.js
fs.writeFileSync(path.join(servicesDir, 'achievementService.js'), `import api from './api';

export const achievementService = {
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data?.data;
  },
};
`);

console.log('Client API services updated successfully.');
