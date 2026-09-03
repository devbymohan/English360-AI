import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  Sparkles,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AnswerOption } from '../components/common/AnswerOption';
import { readingService } from '../services/readingService';
import { useAuth } from '../context/AuthContext';

export const ReadingPage = () => {
  const { user } = useAuth();
  const [passageData, setPassageData] = useState(null);
  const [seenTopics, setSeenTopics] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReading, setIsReading] = useState(true);
  const [isFinishedReading, setIsFinishedReading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readingResult, setReadingResult] = useState(null);
  const [activeWordDefinition, setActiveWordDefinition] = useState(null);

  useEffect(() => {
    loadPassage(false);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isReading && !isFinishedReading && !isTimerPaused && !isGenerating) {
      interval = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isReading, isFinishedReading, isTimerPaused, isGenerating]);

  const loadPassage = async (forceNew = false) => {
    setIsGenerating(true);
    setReadingResult(null);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setSecondsElapsed(0);
    setIsFinishedReading(false);
    setIsTimerPaused(false);
    setActiveWordDefinition(null);

    try {
      const currentTopic = passageData?.title || passageData?.topic;
      const excluded = forceNew && currentTopic
        ? Array.from(new Set([...seenTopics, currentTopic]))
        : seenTopics;

      const userLevel = user?.level || user?.englishLevel || 'B1';
      const sessionId = 'reading_' + Date.now();

      const data = await readingService.getPassage(
        null,
        userLevel,
        excluded,
        sessionId,
        Date.now()
      );

      if (data && data.questions && data.questions.length > 0) {
        setPassageData(data);
        if (data.title) {
          setSeenTopics((prev) => Array.from(new Set([...prev, data.title])));
        }
      }
    } catch (err) {
      console.warn('[ReadingPage] Load passage notice:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFinishReading = () => {
    setIsFinishedReading(true);
    setCurrentQuestionIdx(0);
  };

  const handleSelectAnswer = (optId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optId }));
  };

  const handleSubmitAttempt = async () => {
    if (isSubmitting || !passageData?.questions) return;
    setIsSubmitting(true);

    const safeElapsed = Math.max(15, secondsElapsed);
    const totalWords = passageData.wordCount || 300;

    try {
      const result = await readingService.submitAttempt({
        passageId: passageData.title || 'reading_passage',
        title: passageData.title || 'Reading Comprehension',
        wordCount: totalWords,
        readingTimeSeconds: safeElapsed,
        questions: passageData.questions,
        answers,
      });

      if (result) {
        setReadingResult(result);
      } else {
        // Fallback calculation
        let correct = 0;
        passageData.questions.forEach((q, idx) => {
          if (answers[idx] === q.correctAnswer) correct++;
        });
        const total = passageData.questions.length;
        const accuracy = Math.round((correct / total) * 100);
        const wpm = Math.round(totalWords / (safeElapsed / 60));
        setReadingResult({
          score: accuracy,
          accuracy,
          correctCount: correct,
          wrongCount: total - correct,
          total,
          wpm,
          readingTimeSeconds: safeElapsed,
        });
      }
    } catch (err) {
      console.warn('[ReadingPage] Submit reading error:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = passageData?.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const currentAnswer = answers[currentQuestionIdx];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  const calculatedWpm = Math.round(
    (passageData?.wordCount || 300) / (Math.max(15, secondsElapsed) / 60)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Dashboard &gt; Reading Comprehension &gt; {user?.level || user?.englishLevel || 'B1'}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {passageData?.title || 'Reading Comprehension'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={isGenerating}
            onClick={() => loadPassage(true)}
            className="rounded-xl font-bold flex-1 sm:flex-initial"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
            )}
            {isGenerating ? 'Generating...' : 'New Passage'}
          </Button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-mono">{formatTimer(secondsElapsed)}</span>
            {!isFinishedReading && (
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="text-[10px] text-slate-400 hover:text-slate-700 ml-1 font-semibold"
              >
                {isTimerPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Reading Passage */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-4 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Passage</h3>
              <span className="text-xs font-medium text-slate-400">
                {passageData?.wordCount || 300} words • {user?.level || user?.englishLevel || 'B1'} Level
              </span>
            </div>

            {isGenerating ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  AI is generating new reading passage & 10 questions...
                </p>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4 font-normal">
                {passageData?.passage ? (
                  passageData.passage.split('\n\n').map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))
                ) : (
                  <p>Loading passage content...</p>
                )}
              </div>
            )}

            {/* Difficult Words */}
            {passageData?.difficultWords && passageData.difficultWords.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Vocabulary Highlights:
                </span>
                <div className="flex flex-wrap gap-2">
                  {passageData.difficultWords.map((w) => (
                    <button
                      key={w}
                      onClick={() => setActiveWordDefinition(w)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition"
                    >
                      {w}
                    </button>
                  ))}
                </div>
                {activeWordDefinition && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between animate-in fade-in">
                    <span>
                      <strong className="text-blue-950">{activeWordDefinition}:</strong> Key contextual vocabulary word from the passage.
                    </span>
                    <button
                      onClick={() => setActiveWordDefinition(null)}
                      className="text-blue-600 font-bold ml-2 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {isFinishedReading ? '✓ Reading phase completed' : '⏱ Reading timer active'}
              </span>
              <Button
                size="sm"
                variant={isFinishedReading ? 'outline' : 'success'}
                onClick={handleFinishReading}
                className="font-bold"
              >
                {isFinishedReading ? '✓ Finished Reading (Answer Questions)' : "I'm Finished Reading"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: 10 Comprehension Questions & Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Results Card if Submitted */}
          {readingResult !== null ? (
            <Card className="p-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Reading Comprehension Complete!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Attempt recorded to your learning progress and daily streak.
                </p>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {readingResult.total || 10}
                  </p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Correct</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {readingResult.correctCount}
                  </p>
                </div>
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
                  <p className="text-[10px] text-rose-700 font-bold uppercase">Wrong</p>
                  <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                    {readingResult.wrongCount}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-bold uppercase">WPM</p>
                  <p className="text-lg font-extrabold text-blue-700 mt-0.5">
                    {readingResult.wpm}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Comprehension Score:</span>
                  <span className="text-base font-extrabold">{readingResult.score}%</span>
                </div>
                {readingResult.wrongCount > 0 && (
                  <p className="text-[11px] text-blue-700 mt-1">
                    {readingResult.wrongCount} incorrect answer{readingResult.wrongCount > 1 ? 's' : ''}{' '}
                    saved to <strong>My Mistakes</strong> for targeted review.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReadingResult(null);
                    setAnswers({});
                    setCurrentQuestionIdx(0);
                  }}
                  className="rounded-xl font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retake Quiz
                </Button>
                <Button
                  onClick={() => loadPassage(true)}
                  className="rounded-xl font-bold shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> New Passage
                </Button>
              </div>
            </Card>
          ) : (
            /* Question Stepper Card */
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Comprehension Questions (10)</h3>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {questions.length > 0 ? `Question ${currentQuestionIdx + 1} of ${questions.length}` : '0 Questions'}
                </span>
              </div>

              {/* 10-Question Pill Navigation */}
              {questions.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answers[idx]);
                    const isActive = idx === currentQuestionIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Question */}
              {currentQ ? (
                <div className="pt-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {currentQuestionIdx + 1}. {currentQ.prompt}
                  </h4>

                  <div className="space-y-2">
                    {currentQ.options?.map((opt) => (
                      <AnswerOption
                        key={opt.id}
                        optionKey={opt.id}
                        text={opt.text}
                        selected={currentAnswer === opt.id}
                        isCorrect={opt.id === currentQ.correctAnswer}
                        showResult={hasAnsweredCurrent}
                        onClick={() => handleSelectAnswer(opt.id)}
                      />
                    ))}
                  </div>

                  {hasAnsweredCurrent && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
                        currentAnswer === currentQ.correctAnswer
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Lightbulb className="w-4 h-4 text-brand-600" />
                        <span>
                          {currentAnswer === currentQ.correctAnswer ? '✓ Correct Answer' : '✕ Explanation:'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  Click "I'm Finished Reading" or wait for questions to load.
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="rounded-xl font-bold"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    disabled={isSubmitting}
                    onClick={handleSubmitAttempt}
                    className="rounded-xl font-bold shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      'Submit Reading Attempt ✓'
                    )}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Reading Metrics Card */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Live Reading Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Time</p>
                <p className="font-extrabold text-slate-800 mt-0.5">
                  {formatTimer(secondsElapsed)}
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Estimated WPM</p>
                <p className="font-extrabold text-blue-600 mt-0.5">
                  {calculatedWpm}
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">Questions Answered</p>
                <p className="font-extrabold text-emerald-600 mt-0.5">
                  {Object.keys(answers).length} / {questions.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
