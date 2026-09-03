import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');

// 1. client/src/routes/AppRoutes.jsx
fs.writeFileSync(path.join(clientDir, 'src', 'routes', 'AppRoutes.jsx'), `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AssessmentPage } from '../pages/AssessmentPage';

// Authenticated Pages
import { DashboardPage } from '../pages/DashboardPage';
import { GrammarPage } from '../pages/GrammarPage';
import { VocabularyPage } from '../pages/VocabularyPage';
import { ReadingPage } from '../pages/ReadingPage';
import { WritingPage } from '../pages/WritingPage';
import { ListeningPage } from '../pages/ListeningPage';
import { TestsPage } from '../pages/TestsPage';
import { TestResultsPage } from '../pages/TestResultsPage';
import { MistakesPage } from '../pages/MistakesPage';
import { AICoachPage } from '../pages/AICoachPage';
import { ProgressPage } from '../pages/ProgressPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
      </Route>

      {/* Authenticated Learning Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/test-results/:id" element={<TestResultsPage />} />
        <Route path="/my-mistakes" element={<MistakesPage />} />
        <Route path="/ai-coach" element={<AICoachPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
`);

// 2. client/src/App.jsx
fs.writeFileSync(path.join(clientDir, 'src', 'App.jsx'), `import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
`);

// 3. client/src/main.jsx
fs.writeFileSync(path.join(clientDir, 'src', 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);

console.log('Routes, App.jsx, and main.jsx generated successfully.');
