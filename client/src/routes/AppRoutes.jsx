import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Learning & Assessment Pages
import { AssessmentPage } from '../pages/AssessmentPage';
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
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Assessment (standalone onboarding flow) */}
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Authenticated Learning App Shell */}
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
          <Route path="/mistakes" element={<Navigate to="/my-mistakes" replace />} />
          <Route path="/ai-coach" element={<AICoachPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 3. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
