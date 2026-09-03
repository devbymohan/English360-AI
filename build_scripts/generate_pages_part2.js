import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

// 8. ReadingPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ReadingPage.jsx'), `import React, { useState } from 'react';
import { BookOpen, Clock, Pause, Play, CheckCircle2, Lightbulb, ArrowRight, ChevronRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { readingData } from '../data/mockData';

export const ReadingPage = () => {
  const [selectedAnswer, setSelectedAnswer] = useState('C');
  const [selectedWordPopup, setSelectedWordPopup] = useState(null);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Dashboard &gt; Reading &gt; B1 Level &gt; Practice
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{readingData.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {readingData.level} • {readingData.wordCount} words
          </span>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-bold">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{readingData.timer}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reading Passage Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
              {readingData.passage.split('\\n\\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Difficult Words Tap-to-Reveal */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Difficult Words (Tap to see meaning):</span>
              <div className="flex flex-wrap gap-2">
                {readingData.difficultWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => setSelectedWordPopup(word)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
                  >
                    {word}
                  </button>
                ))}
              </div>
              {selectedWordPopup && (
                <div className="mt-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <span className="font-bold">{selectedWordPopup}:</span> Key vocabulary word extracted from passage.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm">Previous Passage</Button>
              <Button size="sm" variant="success">I'm Finished</Button>
            </div>
          </Card>
        </div>

        {/* Right: Question & Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Question Index Pills */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Questions</h3>
              <span className="text-xs font-bold text-brand-600">3 of 10</span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {readingData.questions.map((q) => (
                <button
                  key={q.number}
                  className={\`py-2 rounded-xl text-xs font-bold transition \${
                    q.status === 'answered'
                      ? 'bg-emerald-100 text-emerald-700'
                      : q.status === 'current'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400'
                  }\`}
                >
                  {q.number}
                </button>
              ))}
            </div>

            {/* Current Question Body */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {readingData.currentQuestion.number}. {readingData.currentQuestion.prompt}
              </h4>

              <div className="space-y-2">
                {readingData.currentQuestion.options.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedAnswer(opt.id)}
                    className={\`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition \${
                      selectedAnswer === opt.id
                        ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }\`}
                  >
                    <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${
                      selectedAnswer === opt.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                    }\`}>
                      {selectedAnswer === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                    <span>{opt.id}. {opt.text}</span>
                  </label>
                ))}
              </div>

              {/* Instant feedback callout */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {readingData.currentQuestion.feedback.text}
                </p>
              </div>
            </div>
          </Card>

          {/* Reading Stats */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Reading Stats</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Time</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{readingData.stats.timeTaken}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">WPM</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{readingData.stats.wpm}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Score</p>
                <p className="font-extrabold text-emerald-600 mt-0.5">{readingData.stats.score}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Accuracy</p>
                <p className="font-extrabold text-brand-600 mt-0.5">{readingData.stats.accuracy}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-xs text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Tip: Read actively and try to identify the topic sentence of each paragraph.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 9. WritingPage.jsx
fs.writeFileSync(path.join(pagesDir, 'WritingPage.jsx'), `import React, { useState } from 'react';
import { Edit3, Bot, CheckCircle2, ChevronDown, ChevronUp, Save, Send } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { writingData } from '../data/mockData';

export const WritingPage = () => {
  const [essay, setEssay] = useState(writingData.essayDraft);
  const [openSection, setOpenSection] = useState('good');

  const wordCount = essay.trim() ? essay.trim().split(/\\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-orange-50/40 to-amber-50/40 border border-slate-100">
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          Dashboard &gt; Writing &gt; B1 Level &gt; Practice
        </span>
        <div className="mt-2 space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">
            Writing Task: "{writingData.task.topic}"
          </h2>
          <p className="text-xs text-slate-600">
            {writingData.task.prompt} (Minimum {writingData.task.minWords} words)
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Rich Editor */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-4">
            {/* Formatting Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded-lg cursor-pointer">B</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg italic cursor-pointer">I</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg underline cursor-pointer">U</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg cursor-pointer">• List</span>
              </div>
              <span className="text-slate-400 font-semibold">
                Word Count: <span className="font-bold text-slate-800">{wordCount}</span> / {writingData.task.minWords}
              </span>
            </div>

            {/* Textarea */}
            <textarea
              rows={12}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="w-full bg-slate-50/60 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-brand-500 transition resize-none font-sans"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved just now</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
                </Button>
                <Button size="sm">
                  <Send className="w-3.5 h-3.5 mr-1" /> Submit for Feedback
                </Button>
              </div>
            </div>
          </Card>

          {/* Checklist */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Writing Checklist</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {writingData.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: AI Feedback & Scores */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Evaluation & Feedback</h3>
                <p className="text-[11px] text-slate-400">Automated structural and grammatical review</p>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex items-center justify-center gap-6">
              <ProgressCircle value={writingData.scoreOverview.overall} size={90} strokeWidth={8} color="#4F46E5">
                <span className="text-xl font-extrabold text-slate-900">{writingData.scoreOverview.overall}</span>
                <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
              </ProgressCircle>
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Task Achievement:</span>
                  <span className="font-bold text-slate-800">{writingData.scoreOverview.taskAchievement}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coherence:</span>
                  <span className="font-bold text-slate-800">{writingData.scoreOverview.coherence}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lexical Resource:</span>
                  <span className="font-bold text-slate-800">{writingData.scoreOverview.lexicalResource}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grammar:</span>
                  <span className="font-bold text-slate-800">{writingData.scoreOverview.grammar}/100</span>
                </div>
              </div>
            </div>

            {/* Feedback Accordion */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <h5 className="font-bold text-emerald-900">✓ What's Good</h5>
                <p className="text-[11px] text-emerald-800 leading-relaxed">{writingData.detailedFeedback.whatsGood}</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 text-xs space-y-1">
                <h5 className="font-bold text-amber-900">⚠ To Improve</h5>
                <p className="text-[11px] text-amber-800 leading-relaxed">{writingData.detailedFeedback.toImprove}</p>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
                <h5 className="font-bold text-purple-900">💡 Suggestions</h5>
                <p className="text-[11px] text-purple-800 leading-relaxed">{writingData.detailedFeedback.suggestions}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 10. ListeningPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ListeningPage.jsx'), `import React, { useState } from 'react';
import { Headphones, Play, Pause, RotateCcw, RotateCw, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { Modal } from '../components/common/Modal';
import { listeningData } from '../data/mockData';

export const ListeningPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('C');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-rose-50/40 to-pink-50/40 border border-slate-100">
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          Dashboard &gt; Listening &gt; B1 Level &gt; Practice
        </span>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{listeningData.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Listen to the conversation and answer the questions that follow.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
            {listeningData.level} • {listeningData.duration}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Audio Player & Questions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Audio Waveform Player */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Audio Player</h3>
              <span className="text-xs font-semibold text-slate-400">1.0x Speed</span>
            </div>

            {/* Waveform Visualization */}
            <div className="h-16 flex items-center gap-1.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
              {listeningData.waveform.map((height, i) => (
                <div
                  key={i}
                  className={\`flex-1 rounded-full transition-all duration-300 \${
                    i < 12 ? 'bg-brand-600' : 'bg-slate-200'
                  }\`}
                  style={{ height: \`\${height}%\` }}
                />
              ))}
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-6">
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md hover:bg-brand-700 transition"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400">
                Question {listeningData.currentQuestion.number} of 10
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowTranscript(true)}>
                <FileText className="w-3.5 h-3.5 mr-1" /> View Script
              </Button>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {listeningData.currentQuestion.prompt}
            </h4>

            <div className="space-y-2.5">
              {listeningData.currentQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedAnswer(opt.id)}
                  className={\`flex items-center justify-between p-3.5 rounded-2xl border text-xs cursor-pointer transition \${
                    selectedAnswer === opt.id
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-200'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }\`}
                >
                  <span>{opt.id}. {opt.text}</span>
                  {selectedAnswer === opt.id && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm">Previous</Button>
              <Button size="sm">Next Question →</Button>
            </div>
          </Card>
        </div>

        {/* Right: Progress & Word Bank */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Progress</h4>
            <div className="flex justify-center py-1">
              <ProgressCircle value={listeningData.stats.completedPercent} size={80} strokeWidth={8} color="#EF4444" />
            </div>
            <div className="flex justify-around text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{listeningData.stats.answered}/10</p>
                <p className="text-[10px]">Answered</p>
              </div>
              <div>
                <p className="font-bold text-emerald-600">{listeningData.stats.correct}</p>
                <p className="text-[10px]">Correct</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{listeningData.stats.timeTaken}</p>
                <p className="text-[10px]">Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Word Bank</h4>
            <div className="flex flex-wrap gap-1.5">
              {listeningData.wordBank.map((word) => (
                <span key={word} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {word}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-2 bg-slate-50">
            <h5 className="text-xs font-bold text-slate-800">Listening Tips</h5>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc list-inside">
              {listeningData.tips.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Transcript Modal */}
      <Modal isOpen={showTranscript} onClose={() => setShowTranscript(false)} title="Conversation Transcript">
        <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
          <p><span className="font-bold text-slate-900">Student:</span> Hello! Could you help me find research papers on modern artificial intelligence?</p>
          <p><span className="font-bold text-slate-900">Librarian:</span> Of course! They are located in Section B, 2nd floor.</p>
        </div>
      </Modal>
    </div>
  );
};
`);

// 11. TestsPage.jsx
fs.writeFileSync(path.join(pagesDir, 'TestsPage.jsx'), `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Award, Clock, ArrowRight, Play } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { testsCatalog } from '../data/mockData';

export const TestsPage = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-cyan-50/40 to-blue-50/40 border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
            Dashboard &gt; Smart Tests
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Master English with our Smart Tests
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Take full diagnostic tests, challenge yourself, and track your progress to improve every day.
          </p>
        </div>
        <div className="pt-4">
          <Button size="sm" className="rounded-xl">Start New Test →</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Test List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Grammar', 'Vocabulary', 'Reading', 'Listening'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }\`}
              >
                {tab} Tests
              </button>
            ))}
          </div>

          {/* Test Cards */}
          <div className="space-y-3">
            {testsCatalog.map((test) => (
              <Card key={test.id} className="p-5 flex items-center justify-between gap-4 hover:shadow-soft transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{test.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{test.topics}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold mt-2">
                      <span>{test.questions} Questions</span>
                      <span>•</span>
                      <span>⏱ {test.duration}</span>
                      <span>•</span>
                      <span>{test.level}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Score: {test.score}%
                  </span>
                  <Link to={\`/test-results/\${test.id}\`}>
                    <Button variant="secondary" size="sm" className="text-xs font-bold rounded-xl px-3 py-1.5">
                      View Results
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Test Progress */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 text-center space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Your Test Progress</h4>
            <div className="flex justify-center">
              <ProgressCircle value={72} size={84} strokeWidth={8} color="#06B6D4">
                <span className="text-base font-extrabold text-slate-900">72%</span>
                <span className="text-[10px] text-slate-400 font-bold">Overall</span>
              </ProgressCircle>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">18</p>
                <p className="text-[10px]">Tests Taken</p>
              </div>
              <div>
                <p className="font-bold text-emerald-600">90%</p>
                <p className="text-[10px]">Best Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-50/60 to-orange-50/60 border border-amber-100 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h5 className="text-xs font-bold text-slate-900">Challenge Yourself!</h5>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Take the Daily Challenge to increase your score streak and earn bonus badges.
            </p>
            <Button size="sm" className="w-full text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700">
              Daily Challenge →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 12. TestResultsPage.jsx
fs.writeFileSync(path.join(pagesDir, 'TestResultsPage.jsx'), `import React from 'react';
import { CheckCircle2, XCircle, Clock, ChevronDown, Award, RotateCcw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { testResultDetail } from '../data/mockData';

export const TestResultsPage = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Dashboard &gt; Tests &gt; Test Results
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{testResultDetail.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{testResultDetail.subtitle} • {testResultDetail.date}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ProgressCircle value={testResultDetail.scorePercentage} size={74} strokeWidth={7} color="#10B981">
            <span className="text-base font-extrabold text-slate-900">{testResultDetail.scorePercentage}%</span>
          </ProgressCircle>
          <div>
            <h4 className="text-sm font-bold text-emerald-600">{testResultDetail.verdict}</h4>
            <p className="text-xs text-slate-400">{testResultDetail.score} / {testResultDetail.totalQuestions} Correct</p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4 bg-emerald-50/60 border-emerald-100">
          <h3 className="text-xl font-extrabold text-emerald-600">{testResultDetail.summary.correct}</h3>
          <p className="text-xs font-bold text-emerald-800 mt-0.5">Correct</p>
        </Card>
        <Card className="p-4 bg-rose-50/60 border-rose-100">
          <h3 className="text-xl font-extrabold text-rose-600">{testResultDetail.summary.incorrect}</h3>
          <p className="text-xs font-bold text-rose-800 mt-0.5">Incorrect</p>
        </Card>
        <Card className="p-4 bg-amber-50/60 border-amber-100">
          <h3 className="text-xl font-extrabold text-amber-600">{testResultDetail.summary.skipped}</h3>
          <p className="text-xs font-bold text-amber-800 mt-0.5">Skipped</p>
        </Card>
        <Card className="p-4 bg-blue-50/60 border-blue-100">
          <h3 className="text-xl font-extrabold text-blue-600">{testResultDetail.summary.accuracy}%</h3>
          <p className="text-xs font-bold text-blue-800 mt-0.5">Accuracy</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Question by Question Review */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Question Review</h3>

          <div className="space-y-3">
            {testResultDetail.questionsReview.map((q) => (
              <Card key={q.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {q.section}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{q.prompt}</h4>
                    </div>
                  </div>
                  <span className={\`text-xs font-bold px-2 py-0.5 rounded-md \${
                    q.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }\`}>
                    {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400">Your Answer:</span>
                    <p className={\`font-bold \${q.isCorrect ? 'text-emerald-700' : 'text-rose-600'}\`}>
                      {q.userAnswer}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Correct Answer:</span>
                    <p className="font-bold text-emerald-700">{q.correctAnswer}</p>
                  </div>
                </div>

                {q.explanation && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                    <span className="font-bold text-slate-800">Explanation:</span> {q.explanation}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Section Scores & Strengths */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Section Performance</h4>
            <div className="space-y-3">
              {testResultDetail.sectionScores.map((sec) => (
                <div key={sec.section} className="text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">{sec.section}</span>
                    <span className="text-slate-900">{sec.score} ({sec.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: \`\${sec.percent}%\`, backgroundColor: sec.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Strengths & Improvements</h4>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-emerald-700">✓ Strengths:</p>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                {testResultDetail.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <p className="font-bold text-rose-700 pt-2">⚠ Areas to Improve:</p>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                {testResultDetail.areasToImprove.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 13. MistakesPage.jsx
fs.writeFileSync(path.join(pagesDir, 'MistakesPage.jsx'), `import React, { useState } from 'react';
import { AlertCircle, RotateCcw, Filter, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { mistakesData } from '../data/mockData';

export const MistakesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Dashboard &gt; My Mistakes
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">My Mistakes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review your mistakes to learn faster and improve smarter.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold">Total Mistakes</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{mistakesData.summary.totalMistakes}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold">This Week</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{mistakesData.summary.thisWeek}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold">Accuracy</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{mistakesData.summary.accuracy}%</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 font-semibold">Topics to Improve</p>
          <h3 className="text-2xl font-extrabold text-brand-600 mt-1">{mistakesData.summary.topicsToImprove}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Mistake items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }\`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {mistakesData.items.map((item) => (
              <Card key={item.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">{item.prompt}</h4>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Your Answer:</span>
                    <p className="font-bold text-rose-600">{item.userAnswer}</p>
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
                  <Button size="sm" variant="outline" className="text-xs">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Review Again
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Breakdown & Top Mistake Topics */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Mistake Breakdown</h4>
            <div className="space-y-2.5">
              {mistakesData.breakdown.map((b) => (
                <div key={b.name} className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">{b.name}</span>
                    <span className="font-bold text-slate-900">{b.count} ({b.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: \`\${b.percentage}%\`, backgroundColor: b.color }} />
                  </div>
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
                    {top.count}
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

// 14. AICoachPage.jsx
fs.writeFileSync(path.join(pagesDir, 'AICoachPage.jsx'), `import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { aiCoachData } from '../data/mockData';

export const AICoachPage = () => {
  const [messages, setMessages] = useState(aiCoachData.chatHistory);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg = { sender: 'user', text: inputText, time: 'Now' };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Sample placeholder coach reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'coach', text: "I'm ready to help you practice that! Let's start with a few sample exercises.", time: 'Now' }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 border border-slate-100 flex items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{aiCoachData.greeting}</h2>
              <p className="text-xs text-slate-500">{aiCoachData.intro}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {aiCoachData.quickPills.map((pill) => (
              <button key={pill} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                {pill}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chat Container */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6 h-[480px] flex flex-col justify-between">
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
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <input
                type="text"
                placeholder="Ask anything about English grammar, vocabulary or writing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-brand-500"
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
              <ProgressCircle value={aiCoachData.overview.improvement} size={80} strokeWidth={8} color="#4F46E5">
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
              <span className="text-[11px] font-bold text-brand-600">{aiCoachData.dailyGoal.completed}/{aiCoachData.dailyGoal.total}</span>
            </div>
            <div className="space-y-2 text-xs">
              {aiCoachData.dailyGoal.items.map((g, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className={\`w-4 h-4 \${g.done ? 'text-emerald-500' : 'text-slate-300'}\`} />
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

// 15. ProgressPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ProgressPage.jsx'), `import React from 'react';
import { BarChart2, CheckCircle2, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressData, skillProgress } from '../data/mockData';

export const ProgressPage = () => {
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Skill Progress & Weekly */}
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

        {/* Right: Level Meter & Areas to Improve */}
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

// 16. AchievementsPage.jsx
fs.writeFileSync(path.join(pagesDir, 'AchievementsPage.jsx'), `import React, { useState } from 'react';
import { Trophy, Award, Shield, Flame, Headphones, CheckCircle2, Edit3, Lock, Star } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { achievementsData } from '../data/mockData';

export const AchievementsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-amber-50/40 to-orange-50/40 border border-slate-100 flex items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
            Dashboard &gt; Achievements
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Celebrate Your Progress!</h2>
          <p className="text-xs text-slate-500 mt-0.5">Earn achievements by learning consistently and improving your English skills.</p>
        </div>

        <div className="flex items-center gap-6 text-center shrink-0">
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900">{achievementsData.stats.unlocked}</h4>
            <p className="text-[11px] text-slate-400 font-bold">Unlocked</p>
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-amber-500">{achievementsData.stats.points}</h4>
            <p className="text-[11px] text-slate-400 font-bold">Points</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Badges Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Learning', 'Consistency', 'Performance', 'Special'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={\`px-4 py-2 rounded-xl text-xs font-bold transition \${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }\`}
              >
                {cat} Badges
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievementsData.badges.map((badge) => {
              const isUnlocked = badge.status === 'unlocked';
              const isInProgress = badge.status === 'in_progress';

              return (
                <Card key={badge.id} className="p-5 flex items-start gap-4 hover:shadow-soft transition">
                  <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 \${
                    isUnlocked ? 'bg-amber-100 text-amber-600' : isInProgress ? 'bg-indigo-50 text-brand-600' : 'bg-slate-100 text-slate-400'
                  }\`}>
                    {isUnlocked ? <Trophy className="w-6 h-6" /> : isInProgress ? <Star className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{badge.title}</h4>
                      <span className="text-[11px] font-extrabold text-amber-600">+{badge.points} Pts</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {isUnlocked && <span className="font-bold text-emerald-600">Unlocked • {badge.date}</span>}
                      {isInProgress && <span className="font-bold text-brand-600">In Progress ({badge.progress})</span>}
                      {badge.status === 'locked' && <span className="font-bold text-slate-400">Locked</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Summary & Recent Unlocks */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900">Achievement Summary</h4>
            <div className="space-y-2.5">
              {achievementsData.summaryCategories.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{c.name}</span>
                  <span className="font-extrabold text-slate-900">{c.count} Badges</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Recent Unlocks</h4>
            <div className="space-y-3">
              {achievementsData.recentUnlocks.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{u.title}</h5>
                    <p className="text-[10px] text-slate-400">{u.date}</p>
                  </div>
                  <span className="font-bold text-amber-600">{u.points}</span>
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

// 17. SettingsPage.jsx
fs.writeFileSync(path.join(pagesDir, 'SettingsPage.jsx'), `import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Shield, Save } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || 'Arjun');
  const [email, setEmail] = useState(currentUser?.email || 'arjun@english360.ai');
  const [level, setLevel] = useState('B1');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Dashboard &gt; Settings
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your profile, learning preferences, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Personal Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Select
                label="Target English Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                options={[
                  { value: 'A1', label: 'A1 – Beginner' },
                  { value: 'A2', label: 'A2 – Elementary' },
                  { value: 'B1', label: 'B1 – Intermediate' },
                  { value: 'B2', label: 'B2 – Upper-Intermediate' },
                  { value: 'C1', label: 'C1 – Advanced' },
                ]}
              />
              <Select
                label="Daily Goal"
                value="20"
                options={[
                  { value: '10', label: '10 mins / day (Casual)' },
                  { value: '20', label: '20 mins / day (Regular)' },
                  { value: '45', label: '45 mins / day (Intensive)' },
                ]}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button size="sm">
                <Save className="w-4 h-4 mr-1.5" /> Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Notifications & Reminders</h3>
            <div className="space-y-3 text-xs">
              {[
                { title: 'Daily Study Reminders', desc: 'Receive a notification to maintain your study streak' },
                { title: 'AI Coach Recommendations', desc: 'Get weekly personalized suggestions and study plans' },
                { title: 'New Test Results', desc: 'Get notified when detailed evaluation reports are ready' },
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50">
                  <div>
                    <h5 className="font-bold text-slate-800">{item.title}</h5>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4" />
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Account Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Membership Tier</h4>
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-2">
              <span className="font-extrabold text-brand-700 block">Free Student Plan</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Upgrade to Premium for unlimited AI evaluations, tests, and priority coaching.
              </p>
              <Button size="sm" className="w-full text-xs font-bold rounded-xl mt-2">
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

console.log('All 17 pages generated successfully!');
