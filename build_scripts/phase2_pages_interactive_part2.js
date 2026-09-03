import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

// 1. MistakesPage.jsx with Recharts
fs.writeFileSync(path.join(pagesDir, 'MistakesPage.jsx'), `import React, { useState } from 'react';
import {
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { mistakesData } from '../data/mockData';

export const MistakesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewedIds, setReviewedIds] = useState([]);

  const filteredItems = mistakesData.items.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleReview = (id) => {
    if (!reviewedIds.includes(id)) {
      setReviewedIds([...reviewedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Dashboard &gt; My Mistakes
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">My Mistakes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review your mistakes to learn faster and improve smarter.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mistakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold">Total Mistakes</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{mistakesData.summary.totalMistakes}</h3>
          <span className="text-[10px] text-slate-400 mt-1">All Time</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold">This Week</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{mistakesData.summary.thisWeek}</h3>
          <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center justify-center gap-0.5 mt-1">
            <TrendingDown className="w-3 h-3" /> {mistakesData.summary.thisWeekDelta}
          </span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold">Accuracy</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{mistakesData.summary.accuracy}%</h3>
          <span className="text-[10px] text-slate-400 mt-1">Overall</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <p className="text-xs text-slate-400 font-semibold">Topics to Improve</p>
          <h3 className="text-2xl font-extrabold text-brand-600 mt-1">{mistakesData.summary.topicsToImprove}</h3>
          <span className="text-[10px] text-slate-400 mt-1">Targeted</span>
        </Card>
      </div>

      {/* Mistakes Over Time Line Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mistakes Over Time</h3>
            <p className="text-xs text-slate-400">7-Day trend of practice errors</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            Last 7 Days
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mistakesData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 30]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="mistakes" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Mistake items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={\`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap \${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }\`}
              >
                {cat} ({cat === 'All' ? mistakesData.summary.totalMistakes : mistakesData.breakdown.find((b) => b.name === cat)?.count || 0})
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isReviewed = reviewedIds.includes(item.id);
              return (
                <Card key={item.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{item.prompt}</h4>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100/60">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Your Answer:</span>
                      <p className="font-bold text-rose-600 line-through">{item.userAnswer}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Correct Answer:</span>
                      <p className="font-bold text-emerald-600">{item.correctAnswer}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                    <span className="font-bold">Explanation:</span> {item.explanation}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Source: {item.source}</span>
                    <Button
                      size="sm"
                      variant={isReviewed ? 'success' : 'outline'}
                      onClick={() => handleReview(item.id)}
                      className="text-xs font-bold rounded-xl"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      {isReviewed ? '✓ Reviewed' : 'Review Again'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Breakdown & Top Mistake Topics */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Mistake Breakdown</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mistakesData.breakdown}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {mistakesData.breakdown.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-1">
              {mistakesData.breakdown.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="font-semibold text-slate-700">{b.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{b.count} ({b.percentage}%)</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Top Mistake Topics</h4>
            <div className="space-y-2">
              {mistakesData.topMistakeTopics.map((top, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">{top.topic}</span>
                  <span className={\`font-extrabold px-2 py-0.5 rounded-md \${top.color}\`}>
                    {top.count} mistakes
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 2. ProgressPage.jsx with Recharts
fs.writeFileSync(path.join(pagesDir, 'ProgressPage.jsx'), `import React, { useState } from 'react';
import { BarChart2, CheckCircle2, TrendingUp, Trophy, ArrowRight, Clock, Award, Shield } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressData, skillProgress } from '../data/mockData';

export const ProgressPage = () => {
  const [timeRange, setTimeRange] = useState('30');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Dashboard &gt; Learning Analytics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">My Progress</h1>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-5">
          <p className="text-xs text-slate-400 font-semibold">Lessons Completed</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{progressData.lessonsCompleted}</h3>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-400 font-semibold">Questions Solved</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{progressData.questionsSolved}</h3>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-400 font-semibold">Average Accuracy</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{progressData.averageAccuracy}%</h3>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-400 font-semibold">Time Spent</p>
          <h3 className="text-2xl font-extrabold text-brand-600 mt-1">{progressData.timeSpent}</h3>
        </Card>
      </div>

      {/* Performance Over Time Accuracy Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Performance Over Time</h3>
            <p className="text-xs text-slate-400">Your average accuracy trend</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Skill Progress */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Skills Progress (Last 30 Days)</h3>
            <div className="space-y-4">
              {skillProgress.map((skill) => (
                <div key={skill.skill} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{skill.score}%</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {skill.delta}
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={skill.score} color={skill.color} height="h-2.5" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Learning Activities</h3>
            <div className="space-y-3">
              {progressData.recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{act.title}</h5>
                    <p className="text-[11px] text-slate-400">{act.level}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">{act.score}</span>
                    <p className="text-[10px] text-slate-400">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Level Progress & Areas to Improve */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 text-center space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Level Progress</h4>
            <div className="flex justify-center">
              <ProgressCircle value={progressData.levelProgress} size={84} strokeWidth={8} color="#4F46E5">
                <span className="text-base font-extrabold text-slate-900">{progressData.levelProgress}%</span>
              </ProgressCircle>
            </div>
            <p className="text-xs font-bold text-slate-800">{progressData.level}</p>
            <p className="text-[11px] text-slate-400">You are {progressData.levelRemaining}% away from B2 Level</p>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Areas to Improve</h4>
            <div className="space-y-2">
              {progressData.areasToImprove.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.skill}</span>
                    <Button size="sm" variant="secondary" className="text-[10px] px-2.5 py-1">Practice</Button>
                  </div>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 3. AICoachPage.jsx with dynamic chat and goal toggles
fs.writeFileSync(path.join(pagesDir, 'AICoachPage.jsx'), `import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ChevronRight, MessageSquare, BookOpen, Edit3, Award } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { aiCoachData } from '../data/mockData';

export const AICoachPage = () => {
  const [messages, setMessages] = useState(aiCoachData.chatHistory);
  const [inputText, setInputText] = useState('');
  const [goals, setGoals] = useState(aiCoachData.dailyGoal.items);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text, time: 'Now' };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = "I'm ready to help you practice that! Let's work on a few targeted examples.";
      if (text.toLowerCase().includes('essay') || text.toLowerCase().includes('writing')) {
        reply = "Here is a quick essay structure tip:\\n1. Start with a hook and thesis statement.\\n2. Use clear topic sentences for each body paragraph.\\n3. Use linking words like 'Moreover', 'Consequently', and 'In summary'.";
      } else if (text.toLowerCase().includes('grammar') || text.toLowerCase().includes('article')) {
        reply = "Remember: Use 'a' before consonant sounds (a book, a university) and 'an' before vowel sounds (an apple, an hour).";
      }

      setMessages((prev) => [...prev, { sender: 'coach', text: reply, time: 'Now' }]);
    }, 600);
  };

  const toggleGoal = (idx) => {
    setGoals((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, done: !g.done } : g))
    );
  };

  const completedCount = goals.filter((g) => g.done).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{aiCoachData.greeting}</h2>
              <p className="text-xs text-slate-500">{aiCoachData.intro}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {aiCoachData.quickPills.map((pill) => (
              <button
                key={pill}
                onClick={() => handleSendMessage(\`Can you give me tips on \${pill}?\`)}
                className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:border-brand-200 transition"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chat Container */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 h-[500px] flex flex-col justify-between">
            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={\`flex items-start gap-3 \${
                    m.sender === 'user' ? 'flex-row-reverse' : ''
                  }\`}
                >
                  <div
                    className={\`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 \${
                      m.sender === 'user'
                        ? 'bg-slate-800 text-white text-xs font-bold'
                        : 'bg-brand-600 text-white'
                    }\`}
                  >
                    {m.sender === 'user' ? 'A' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={\`p-4 rounded-2xl max-w-md text-xs leading-relaxed \${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                    }\`}
                  >
                    <p>{m.text}</p>
                    <span className={\`text-[10px] block mt-1 \${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }\`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-4 border-t border-slate-100"
            >
              <input
                type="text"
                placeholder="Ask anything about English grammar, vocabulary or writing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-brand-500 transition"
              />
              <Button type="submit" size="sm" className="rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Overview & Daily Goals */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Coach Overview</h4>
            <div className="flex justify-center py-1">
              <ProgressCircle value={aiCoachData.overview.improvement} size={84} strokeWidth={8} color="#4F46E5">
                <span className="text-base font-extrabold text-slate-900">{aiCoachData.overview.improvement}%</span>
                <span className="text-[10px] text-slate-400">Growth</span>
              </ProgressCircle>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{aiCoachData.overview.topicsPracticed}</p>
                <p className="text-[10px]">Topics</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{aiCoachData.overview.sessionsCount}</p>
                <p className="text-[10px]">Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Daily Goal</h4>
              <span className="text-[11px] font-bold text-brand-600">{completedCount}/{goals.length}</span>
            </div>
            <div className="space-y-2 text-xs">
              {goals.map((g, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleGoal(idx)}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer select-none"
                >
                  <CheckCircle2 className={\`w-4 h-4 transition \${g.done ? 'text-emerald-500' : 'text-slate-300'}\`} />
                  <span className={g.done ? 'line-through text-slate-400' : ''}>{g.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Phase 2 interactive pages part 2 generated successfully.');
