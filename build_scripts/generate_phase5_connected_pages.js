import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

// 1. GrammarPage.jsx
fs.writeFileSync(path.join(pagesDir, 'GrammarPage.jsx'), `import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Lock, Lightbulb, Download, Flame, Bot, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { AnswerOption } from '../components/common/AnswerOption';
import { grammarService } from '../services/grammarService';
import { grammarLessonData } from '../data/mockData';

export const GrammarPage = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [currentTopic, setCurrentTopic] = useState('Present Perfect');
  const [lessonData, setLessonData] = useState(grammarLessonData);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const fetchLesson = async (topic) => {
    setIsGenerating(true);
    try {
      const data = await grammarService.getLesson(topic, 'B1', 5);
      if (data && data.questions && data.questions.length > 0) {
        setLessonData({
          ...grammarLessonData,
          title: data.title || \`\${topic} Tense\`,
          description: data.description || grammarLessonData.description,
          examples: data.examples || grammarLessonData.examples,
          questions: data.questions,
        });
        setCurrentQuestionIdx(0);
        setAnswers({});
        setShowResult(false);
        setSubmissionResult(null);
      }
    } catch (err) {
      console.warn('[GrammarPage] Using fallback lesson data:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optId) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optId });
    setShowResult(true);
  };

  const handleSubmitAll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await grammarService.submitExercise({
        topic: currentTopic,
        level: 'B1',
        questions: lessonData.questions || [grammarLessonData.currentQuestion],
        answers,
      });
      setSubmissionResult(result);
    } catch (err) {
      console.warn('[GrammarPage] Submit exercise error:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = (lessonData.questions && lessonData.questions[currentQuestionIdx]) || grammarLessonData.currentQuestion;
  const currentAnswer = answers[currentQuestionIdx];

  return (
    <div className="space-y-6">
      {/* Top Lesson Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/50 border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Dashboard &gt; Grammar &gt; {currentTopic}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">{lessonData.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {lessonData.description}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchLesson(currentTopic)}
              disabled={isGenerating}
              className="rounded-xl mt-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-brand-600" /> : <BookOpen className="w-4 h-4 mr-1.5 text-brand-600" />}
              {isGenerating ? 'AI Generating Questions...' : 'Generate New AI Exercises'}
            </Button>
          </div>

          <div className="lg:col-span-5 bg-white/90 p-4 rounded-2xl border border-indigo-100/60 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Grammar Examples</h4>
            <ul className="text-xs text-slate-600 space-y-1.5">
              {lessonData.examples.map((ex, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{ex.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Main Practice Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topics */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Grammar Topics</h3>
            <span className="text-xs text-slate-400">Level B1</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, title: 'Present Simple', progress: '10/10', completed: true },
              { id: 2, title: 'Present Continuous', progress: '8/10', completed: true },
              { id: 3, title: 'Present Perfect', progress: '6/10', active: true },
              { id: 4, title: 'Past Simple', progress: '0/10', locked: true },
              { id: 5, title: 'Future Tenses', progress: '0/10', locked: true },
            ].map((topic) => (
              <div
                key={topic.id}
                onClick={() => {
                  if (!topic.locked) {
                    setCurrentTopic(topic.title);
                    fetchLesson(topic.title);
                  }
                }}
                className={\`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs font-bold \${
                  currentTopic === topic.title
                    ? 'bg-brand-50 border-brand-200 text-brand-700'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                }\`}
              >
                <span>{topic.id}. {topic.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{topic.progress}</span>
                  {topic.completed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  {topic.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Center: Question Exercise */}
        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400">
              Question {currentQuestionIdx + 1} of {lessonData.questions?.length || 5}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              ⏱ 05:32
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {currentQ.prompt}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {currentQ.sentence || currentQ.prompt}
            </h3>

            <div className="space-y-2.5">
              {currentQ.options.map((opt) => (
                <AnswerOption
                  key={opt.id}
                  optionKey={opt.id}
                  text={opt.text}
                  selected={currentAnswer === opt.id}
                  isCorrect={opt.id === currentQ.correctAnswer}
                  showResult={showResult}
                  onClick={() => handleSelectAnswer(opt.id)}
                />
              ))}
            </div>

            {showResult && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>Explanation:</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIdx === 0}
              onClick={() => {
                setCurrentQuestionIdx(currentQuestionIdx - 1);
                setShowResult(false);
              }}
            >
              Previous
            </Button>
            {currentQuestionIdx < (lessonData.questions?.length || 5) - 1 ? (
              <Button
                size="sm"
                onClick={() => {
                  setCurrentQuestionIdx(currentQuestionIdx + 1);
                  setShowResult(false);
                }}
              >
                Next Question →
              </Button>
            ) : (
              <Button
                size="sm"
                variant="success"
                disabled={isSubmitting}
                onClick={handleSubmitAll}
              >
                {isSubmitting ? 'Saving Progress...' : 'Submit Exercise ✓'}
              </Button>
            )}
          </div>
        </Card>

        {/* Right: Progress & AI Coach */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Progress</h4>
            <div className="flex justify-center py-2">
              <ProgressCircle value={submissionResult ? submissionResult.score : 60} size={84} strokeWidth={8} color="#10B981">
                <span className="text-base font-extrabold text-slate-900">{submissionResult ? \`\${submissionResult.score}%\` : '60%'}</span>
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
        </div>
      </div>
    </div>
  );
};
`);

// 2. WritingPage.jsx
fs.writeFileSync(path.join(pagesDir, 'WritingPage.jsx'), `import React, { useState } from 'react';
import { Edit3, Sparkles, CheckCircle2, AlertCircle, Award, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { writingService } from '../services/writingService';
import { writingData } from '../data/mockData';

export const WritingPage = () => {
  const [topic, setTopic] = useState('The Impact of Technology on Students');
  const [essayContent, setEssayContent] = useState(
    "Technology has revolutionized modern education. Today, students can access boundless information online and collaborate with peers worldwide. However, overuse of digital screens can lead to reduced focus and social isolation. Therefore, balance is key to maximizing the benefits of educational technology."
  );
  const [evaluation, setEvaluation] = useState(writingData.aiFeedback);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [wordCount, setWordCount] = useState(48);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setEssayContent(text);
    const count = text.trim() ? text.trim().split(/\\s+/).length : 0;
    setWordCount(count);
  };

  const handleEvaluate = async () => {
    if (isEvaluating || !essayContent.trim()) return;
    setIsEvaluating(true);
    try {
      const result = await writingService.evaluate(topic, essayContent, 'B1');
      if (result) {
        setEvaluation(result);
      }
    } catch (err) {
      console.warn('[WritingPage] Evaluation error:', err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          Dashboard &gt; Writing &gt; AI Essay Evaluator
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Writing Practice</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Editor */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Writing Prompt / Topic:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Your Essay:</span>
                <span>Word Count: <strong className="text-slate-900">{wordCount}</strong> / 150 target</span>
              </div>
              <textarea
                rows={10}
                value={essayContent}
                onChange={handleTextChange}
                placeholder="Write your essay here..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setEssayContent('')}>
                Clear
              </Button>
              <Button
                size="sm"
                disabled={isEvaluating || !essayContent.trim()}
                onClick={handleEvaluate}
                className="rounded-xl shadow-md"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    AI Evaluating Submission...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Submit for AI Evaluation
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Real AI Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/40 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">AI Evaluation Report</h3>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                Score: {evaluation.overallScore || 78}/100
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <ProgressCircle value={evaluation.overallScore || 78} size={90} strokeWidth={8} color="#4F46E5">
                <span className="text-xl font-extrabold text-slate-900">{evaluation.overallScore || 78}</span>
              </ProgressCircle>
            </div>

            {/* Criteria Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Task Achievement</span>
                <span className="font-extrabold text-slate-800">{evaluation.scores?.taskAchievement || 75}%</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Coherence & Cohesion</span>
                <span className="font-extrabold text-slate-800">{evaluation.scores?.coherenceAndCohesion || 80}%</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Lexical Resource</span>
                <span className="font-extrabold text-slate-800">{evaluation.scores?.lexicalResource || 76}%</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Grammar & Accuracy</span>
                <span className="font-extrabold text-slate-800">{evaluation.scores?.grammarAndAccuracy || 78}%</span>
              </div>
            </div>

            {/* Strengths & Suggestions */}
            <div className="space-y-2 text-xs">
              {evaluation.feedback?.strengths && evaluation.feedback.strengths.length > 0 && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths:
                  </span>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-emerald-800">
                    {evaluation.feedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.feedback?.suggestions && evaluation.feedback.suggestions.length > 0 && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Suggestions for Improvement:
                  </span>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
                    {evaluation.feedback.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 3. ListeningPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ListeningPage.jsx'), `import React, { useState, useEffect } from 'react';
import { Headphones, FileText, CheckCircle2, HelpCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { Modal } from '../components/common/Modal';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { AnswerOption } from '../components/common/AnswerOption';
import { listeningService } from '../services/listeningService';
import { listeningData } from '../data/mockData';

export const ListeningPage = () => {
  const [lesson, setLesson] = useState(listeningData);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchLesson = async () => {
    setIsGenerating(true);
    try {
      const data = await listeningService.getLesson('At the University Library', 'B1');
      if (data && data.questions) {
        setLesson({
          ...listeningData,
          title: data.title || listeningData.title,
          transcript: data.transcript || listeningData.transcript,
          wordBank: data.wordBank || listeningData.wordBank,
          questions: data.questions,
        });
        setCurrentQuestionIdx(0);
        setSelectedAnswers({});
        setShowResult(false);
      }
    } catch (err) {
      console.warn('[ListeningPage] Error loading lesson:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = (lesson.questions && lesson.questions[currentQuestionIdx]) || listeningData.currentQuestion;
  const currentAnswer = selectedAnswers[currentQuestionIdx];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-white via-rose-50/40 to-pink-50/40 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Dashboard &gt; Listening &gt; B1 Level
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">{lesson.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Listen to the spoken audio and answer comprehension questions.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isGenerating}
          onClick={fetchLesson}
          className="rounded-xl shrink-0"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Headphones className="w-4 h-4 mr-1.5 text-rose-600" />}
          {isGenerating ? 'Generating Audio Lesson...' : 'Generate New Audio Lesson'}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Audio Player & Questions */}
        <div className="lg:col-span-8 space-y-6">
          <AudioPlayer
            title={lesson.title}
            subtitle="Real voice playback with animated waveform"
            scriptText={lesson.transcript || "Speaker A: Hello! Welcome to the library. How can I help you? Speaker B: Hi! I need books about climate science."}
            duration={135}
          />

          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400">
                Question {currentQuestionIdx + 1} of {lesson.questions?.length || 5}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowTranscript(true)}>
                <FileText className="w-3.5 h-3.5 mr-1" /> View Script
              </Button>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {currentQ.prompt}
            </h4>

            <div className="space-y-2.5">
              {currentQ.options?.map((opt) => (
                <AnswerOption
                  key={opt.id}
                  optionKey={opt.id}
                  text={opt.text}
                  selected={currentAnswer === opt.id}
                  isCorrect={opt.id === currentQ.correctAnswer}
                  showResult={showResult}
                  onClick={() => {
                    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIdx]: opt.id });
                    setShowResult(true);
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIdx === 0}
                onClick={() => {
                  setCurrentQuestionIdx(currentQuestionIdx - 1);
                  setShowResult(false);
                }}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (currentQuestionIdx < (lesson.questions?.length || 5) - 1) {
                    setCurrentQuestionIdx(currentQuestionIdx + 1);
                    setShowResult(false);
                  }
                }}
              >
                Next Question →
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Word Bank & Progress */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Word Bank</h4>
            <div className="flex flex-wrap gap-1.5">
              {(lesson.wordBank || listeningData.wordBank).map((word) => (
                <span key={word} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  {word}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-2 bg-slate-50">
            <h5 className="text-xs font-bold text-slate-800">Listening Tips</h5>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Focus on keywords and tone of voice.</li>
              <li>Replay difficult sections at 0.75x speed.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Transcript Modal */}
      <Modal isOpen={showTranscript} onClose={() => setShowTranscript(false)} title="Conversation Transcript">
        <div className="text-xs text-slate-700 space-y-3 leading-relaxed whitespace-pre-line">
          {lesson.transcript || "Speaker A: Hello! How can I assist you today?\\nSpeaker B: I am searching for science journals."}
        </div>
      </Modal>
    </div>
  );
};
`);

console.log('Connected frontend pages generated successfully.');
