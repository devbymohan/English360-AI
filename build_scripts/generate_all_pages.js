import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

// 5. DashboardPage.jsx
fs.writeFileSync(path.join(pagesDir, 'DashboardPage.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ArrowRight,
  Play,
  CheckCircle,
  FileText,
  Sparkles,
  BookOpen,
  Edit3,
  Headphones,
  Bot,
  Crown,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import {
  dashboardPlan,
  skillProgress,
  recentActivities,
  recommendedForYou,
  currentUser
} from '../data/mockData';

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Streak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Welcome & Level Progress */}
        <Card className="lg:col-span-8 p-6 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/40 border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Good morning, {currentUser.name}! 👋
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Let's learn something new today and improve your English.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              {currentUser.levelLabel}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700">Your English Level Progress</span>
              <span className="font-extrabold text-brand-600">{currentUser.levelProgress}%</span>
            </div>
            <ProgressBar value={currentUser.levelProgress} color="bg-brand-600" height="h-2.5" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>You're 24% away from {currentUser.nextLevel}</span>
              <Link to="/progress" className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1">
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* 12 Day Streak Card */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-7 h-7 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{currentUser.streakDays} Day Streak</h3>
              <p className="text-xs text-slate-400">Keep it up! Consistency is the key.</p>
            </div>
          </div>

          {/* Days dots */}
          <div className="grid grid-cols-7 gap-1.5 pt-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const active = i < 5;
              const inProgress = i === 5;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">{day}</span>
                  <div
                    className={\`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold \${
                      active
                        ? 'bg-emerald-500 text-white'
                        : inProgress
                        ? 'border-2 border-orange-400 text-orange-500'
                        : 'bg-slate-100 text-slate-300'
                    }\`}
                  >
                    {active ? <CheckCircle className="w-3.5 h-3.5" /> : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Today's Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Today's Plan</h3>
          <Link to="/progress" className="text-xs font-bold text-brand-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardPlan.map((plan) => {
            const icons = {
              FileText: FileText,
              Sparkles: Sparkles,
              BookOpen: BookOpen,
              Edit3: Edit3,
              Headphones: Headphones
            };
            const Icon = icons[plan.icon] || BookOpen;
            const isContinue = plan.status === 'continue';

            return (
              <Card key={plan.id} className="p-4 flex flex-col justify-between space-y-4 hover:shadow-soft transition">
                <div className="flex items-center justify-between">
                  <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${
                    plan.id === 'grammar' ? 'bg-emerald-50 text-emerald-600' :
                    plan.id === 'vocabulary' ? 'bg-purple-50 text-purple-600' :
                    plan.id === 'reading' ? 'bg-blue-50 text-blue-600' :
                    plan.id === 'writing' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }\`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{plan.time}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">{plan.title}</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{plan.progress}</p>
                </div>

                <Link to={\`/\${plan.id}\`} className="w-full">
                  <Button
                    size="sm"
                    variant={isContinue ? 'success' : 'secondary'}
                    className="w-full text-xs font-bold py-2 rounded-xl"
                  >
                    {isContinue ? 'Continue ▶' : 'Start ▶'}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Progress */}
        <Card className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Overall Progress</h3>
            <span className="text-xs text-slate-400">This Week</span>
          </div>

          <div className="space-y-3 pt-2">
            {skillProgress.map((skill) => (
              <div key={skill.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{skill.score}%</span>
                    <span className="text-[10px] text-slate-400 font-medium">({skill.status})</span>
                  </div>
                </div>
                <ProgressBar value={skill.score} color={skill.color} height="h-2" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4">
            <ProgressCircle value={76} size={64} strokeWidth={6} color="#4F46E5" />
            <div>
              <h5 className="text-sm font-bold text-slate-800">Good Progress!</h5>
              <p className="text-xs text-slate-400">Keep learning consistently.</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <Link to="/progress" className="text-xs font-bold text-brand-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentActivities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={\`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 \${act.iconColor}\`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{act.subtitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-600 block">{act.score}</span>
                  <span className="text-[10px] text-slate-400">{act.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Coach Quick Card */}
        <Card className="lg:col-span-4 p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Coach</h4>
            </div>
            <Link to="/ai-coach" className="text-xs text-brand-600 hover:underline font-bold">
              Open Coach →
            </Link>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-indigo-100/60 space-y-2">
            <p className="text-xs font-bold text-slate-800">Good job, Arjun! 👏</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your reading score improved by 8% this week. Focus more on vocabulary and writing to level up faster.
            </p>
          </div>

          <Link to="/ai-coach" className="w-full">
            <Button size="sm" className="w-full rounded-xl">
              Chat with AI Coach →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recommended For You Section */}
      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedForYou.map((rec) => (
            <Card key={rec.id} className="p-4 flex items-center justify-between gap-3 hover:shadow-soft transition">
              <div className="flex items-center gap-3">
                <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${rec.color}\`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400">{rec.subtitle}</p>
                </div>
              </div>
              <Link to={rec.route}>
                <Button size="sm" variant="secondary" className="text-xs font-bold rounded-xl px-3 py-1.5">
                  Start
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
`);

// 6. GrammarPage.jsx
fs.writeFileSync(path.join(pagesDir, 'GrammarPage.jsx'), `import React, { useState } from 'react';
import { BookOpen, CheckCircle, Lock, Lightbulb, Download, Flame, Bot, ChevronRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { grammarLessonData } from '../data/mockData';

export const GrammarPage = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [selectedAnswer, setSelectedAnswer] = useState('B');

  const tabs = [
    { id: 'practice', label: 'Practice' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'fill', label: 'Fill in the Blanks' },
    { id: 'error', label: 'Error Correction' },
    { id: 'transform', label: 'Sentence Transformation' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Present Perfect Tense */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/50 border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Dashboard &gt; Grammar &gt; Tenses &gt; Present Perfect
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">{grammarLessonData.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {grammarLessonData.description}
            </p>
            <Button size="sm" variant="outline" className="rounded-xl mt-2">
              <BookOpen className="w-4 h-4 mr-1.5 text-brand-600" /> View Full Explanation
            </Button>
          </div>

          {/* Examples Card */}
          <div className="lg:col-span-5 bg-white/90 p-4 rounded-2xl border border-indigo-100/60 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Examples</h4>
            <ul className="text-xs text-slate-600 space-y-1.5">
              {grammarLessonData.examples.map((ex, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{ex.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap \${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }\`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main 3-Column Practice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grammar Topics Accordion */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Grammar Topics</h3>
            <span className="text-xs text-slate-400">Level B1</span>
          </div>

          <div className="space-y-2">
            {grammarLessonData.topicsList.map((topic) => (
              <div key={topic.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <div
                  className={\`flex items-center justify-between p-3 text-xs font-bold \${
                    topic.active ? 'bg-brand-50 text-brand-700' : 'bg-slate-50/60 text-slate-700'
                  }\`}
                >
                  <div className="flex items-center gap-2">
                    <span>{topic.id}.</span>
                    <span>{topic.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">{topic.progress}</span>
                    {topic.completed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {topic.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                {topic.subtopics && (
                  <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                    {topic.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        className={\`flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg \${
                          sub.current ? 'bg-brand-50 font-bold text-brand-700' : 'text-slate-600'
                        }\`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                          <span>{sub.title}</span>
                        </div>
                        {sub.completed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className="text-slate-400">{sub.progress}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Notes
          </Button>
        </Card>

        {/* Center: Question Card */}
        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400">
              Question {grammarLessonData.currentQuestion.questionNumber} of {grammarLessonData.currentQuestion.totalQuestions}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              ⏱ {grammarLessonData.currentQuestion.time}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {grammarLessonData.currentQuestion.prompt}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {grammarLessonData.currentQuestion.sentence}
            </h3>

            <div className="space-y-2.5">
              {grammarLessonData.currentQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedAnswer(opt.id)}
                  className={\`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition text-xs font-bold \${
                    selectedAnswer === opt.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {selectedAnswer === opt.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </label>
              ))}
            </div>

            {/* Explanation box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Explanation:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {grammarLessonData.currentQuestion.explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">Next Question →</Button>
          </div>
        </Card>

        {/* Right: Progress & Need Help */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Progress</h4>
            <div className="flex justify-center py-2">
              <ProgressCircle value={60} size={84} strokeWidth={8} color="#10B981">
                <span className="text-base font-extrabold text-slate-900">60%</span>
              </ProgressCircle>
            </div>
            <p className="text-xs text-slate-500">6 of 10 lessons completed</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">Grammar Streak</h5>
                <p className="text-xs font-extrabold text-orange-500">12 Days Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-600" />
              <h5 className="text-xs font-bold text-slate-800">Need Help?</h5>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ask our AI Coach anytime if you get stuck with rules or examples.
            </p>
            <Button size="sm" variant="secondary" className="w-full text-xs font-bold rounded-xl">
              Chat Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 7. VocabularyPage.jsx
fs.writeFileSync(path.join(pagesDir, 'VocabularyPage.jsx'), `import React, { useState } from 'react';
import { Sparkles, Volume2, Bookmark, CheckCircle, ArrowRight, Play, Edit3 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { vocabularyData } from '../data/mockData';

export const VocabularyPage = () => {
  const [selectedWord, setSelectedWord] = useState(vocabularyData.todayWords[0]);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState('B');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-gradient-to-r from-white via-purple-50/40 to-indigo-50/40 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Dashboard &gt; Vocabulary &gt; Daily Words
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Learn new words every day and build your vocabulary.
            </h2>
            <p className="text-xs text-slate-500 mt-1">Consistency is the key!</p>
          </div>
          <div className="pt-4">
            <Button size="sm" className="rounded-xl">Start Practice →</Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center justify-between gap-4">
          <ProgressCircle value={30} size={80} strokeWidth={8} color="#8B5CF6">
            <span className="text-xs font-extrabold text-slate-900">6/20</span>
          </ProgressCircle>
          <div className="text-right text-xs space-y-1">
            <h4 className="font-bold text-slate-900">Today's Goal</h4>
            <p className="text-slate-400">New Words: <span className="font-bold text-slate-800">10</span></p>
            <p className="text-slate-400">Reviewed: <span className="font-bold text-slate-800">6</span></p>
            <p className="text-slate-400">Mastered: <span className="font-bold text-slate-800">2</span></p>
          </div>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Words list */}
        <Card className="lg:col-span-4 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Today's Words (10)</h3>
            <span className="text-xs text-brand-600 font-bold cursor-pointer">Filter</span>
          </div>

          <div className="space-y-2">
            {vocabularyData.todayWords.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedWord(item)}
                className={\`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs \${
                  selectedWord.id === item.id
                    ? 'border-purple-400 bg-purple-50 text-purple-900 font-bold'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{item.id}</span>
                  <div>
                    <p className="font-bold">{item.word}</p>
                    <p className="text-[10px] text-slate-400">{item.meaning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 hover:text-slate-700" />
                  <Bookmark className={\`w-3.5 h-3.5 \${item.bookmarked ? 'fill-purple-600 text-purple-600' : ''}\`} />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
            View All Words →
          </Button>
        </Card>

        {/* Center: Active Word Card & Practice */}
        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">{vocabularyData.activeWord.word}</h2>
                <button className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{vocabularyData.activeWord.phonetic}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              {vocabularyData.activeWord.tag}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-500">Meaning:</span>
              <p className="text-slate-800 mt-0.5">{vocabularyData.activeWord.meaning}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500">Example:</span>
              <p className="text-slate-800 italic mt-0.5">"{vocabularyData.activeWord.example}"</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-1.5">Synonyms:</span>
              <div className="flex flex-wrap gap-1.5">
                {vocabularyData.activeWord.synonyms.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-1.5">Antonyms:</span>
              <div className="flex flex-wrap gap-1.5">
                {vocabularyData.activeWord.antonyms.map((a) => (
                  <span key={a} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold text-[11px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Practice Question */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">
              {vocabularyData.activeWord.practiceQuestion.prompt}
            </h4>
            <div className="space-y-2">
              {vocabularyData.activeWord.practiceQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedPracticeOption(opt.id)}
                  className={\`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer \${
                    selectedPracticeOption === opt.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }\`}
                >
                  <span>{opt.id}. {opt.text}</span>
                  {selectedPracticeOption === opt.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">Next Word →</Button>
          </div>
        </Card>

        {/* Right: Stats & Quiz Widget */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Vocabulary Progress</h4>
            <div className="flex justify-center py-1">
              <ProgressCircle value={vocabularyData.stats.progress} size={80} strokeWidth={8} color="#8B5CF6" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsLearned}</p>
                <p>Learned</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsReviewed}</p>
                <p>Reviewed</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsMastered}</p>
                <p>Mastered</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Quick Quiz</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Test your knowledge with 5 quick vocabulary questions.
            </p>
            <Button size="sm" className="w-full text-xs font-bold rounded-xl">
              Start Quiz
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Generated Dashboard, Grammar, Vocabulary pages.');
`);

console.log('Writing generate_all_pages.js part 1.');
