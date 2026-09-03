import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Lock,
  Lightbulb,
  Flame,
  Bot,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  AlertCircle,
  BarChart3,
  Award,
  Check,
  X,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { AnswerOption } from '../components/common/AnswerOption';
import { grammarService } from '../services/grammarService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';

const GRAMMAR_TOPICS = [
  { id: 1, title: 'Present Simple', level: 'A1/A2' },
  { id: 2, title: 'Present Continuous', level: 'A2' },
  { id: 3, title: 'Present Perfect', level: 'B1' },
  { id: 4, title: 'Past Simple & Continuous', level: 'B1' },
  { id: 5, title: 'Future Forms & Modals', level: 'B2' },
  { id: 6, title: 'Conditionals (0, 1, 2, 3)', level: 'B2' },
  { id: 7, title: 'Passive Voice & Reported Speech', level: 'C1' },
];

export const GrammarPage = () => {
  const { user } = useAuth();
  const [currentTopic, setCurrentTopic] = useState('Present Simple');
  const [lessonData, setLessonData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(() => 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showFinalScorecard, setShowFinalScorecard] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [overallPerformance, setOverallPerformance] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    overallAccuracy: 0,
  });
  const [topicBreakdown, setTopicBreakdown] = useState([]);

  useEffect(() => {
    fetchLesson('Present Simple', true);
    loadStudentProgress();
  }, []);

  const loadStudentProgress = async () => {
    try {
      const [progData, gramData] = await Promise.allSettled([
        progressService.getProgress(),
        grammarService.getProgress(),
      ]);

      if (progData.status === 'fulfilled' && progData.value) {
        setUserStreak(progData.value.streak || 0);
      }

      if (gramData.status === 'fulfilled' && gramData.value) {
        if (gramData.value.completedTopics) {
          setCompletedTopics(gramData.value.completedTopics);
        }
        if (gramData.value.overallPerformance) {
          setOverallPerformance(gramData.value.overallPerformance);
        }
        if (gramData.value.topicBreakdown) {
          setTopicBreakdown(gramData.value.topicBreakdown);
        }
      }
    } catch (e) {
      console.warn('[GrammarPage] Progress load notice:', e.message);
    }
  };

  const isTopicUnlocked = (index) => {
    if (index === 0) return true; // First topic always unlocked
    const prevTopic = GRAMMAR_TOPICS[index - 1].title;
    return completedTopics.some(
      (t) =>
        t === prevTopic ||
        t.replace(/\s+/g, '') === prevTopic.replace(/\s+/g, '')
    );
  };

  const fetchLesson = async (topic, forceNewSession = true, resetCurriculum = false) => {
    const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    if (forceNewSession) {
      setSessionId(newSessionId);
    }
    const activeSession = forceNewSession ? newSessionId : sessionId;

    // Complete state reset for pristine test isolation
    setIsGenerating(true);
    setSubmissionResult(null);
    setShowFinalScorecard(false);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setCurrentTopic(topic);
    setLessonData(null); // Completely drop previous questions

    if (resetCurriculum) {
      setCompletedTopics([]);
      setOverallPerformance({
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        overallAccuracy: 0,
      });
      setTopicBreakdown([]);
      try {
        const resetRes = await grammarService.resetProgress();
        if (resetRes?.overallPerformance) {
          setOverallPerformance(resetRes.overallPerformance);
        }
        if (resetRes?.topicBreakdown) {
          setTopicBreakdown(resetRes.topicBreakdown);
        }
        if (resetRes?.completedTopics) {
          setCompletedTopics(resetRes.completedTopics);
        }
      } catch (e) {
        console.warn('[GrammarPage] Progress reset notice:', e.message);
      }
    }

    try {
      const userLevel = user?.level && user.level !== 'Not Assessed' ? user.level : 'B1';
      const data = await grammarService.getLesson(topic, userLevel, 5, activeSession, Date.now());
      if (data && data.questions && data.questions.length > 0) {
        setLessonData(data);
      }
    } catch (err) {
      console.warn('[GrammarPage] Error loading grammar lesson:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionId,
    }));
  };

  const currentTopicIdx = GRAMMAR_TOPICS.findIndex((t) => t.title === currentTopic);
  const isLastTopic = currentTopicIdx === GRAMMAR_TOPICS.length - 1;
  const questions = lessonData?.questions || [];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const currentQ = questions[currentQuestionIdx];
  const currentAnswer = answers[currentQuestionIdx];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  const handleNextOrSubmit = async () => {
    if (isSubmitting) return;

    if (!isLastQuestion) {
      // Advance to next question within the current topic
      setCurrentQuestionIdx((prev) => prev + 1);
      return;
    }

    // On last question of topic: Submit current topic
    setIsSubmitting(true);

    try {
      const result = await grammarService.submitExercise({
        topic: currentTopic,
        level: user?.level || 'B1',
        questions: lessonData.questions,
        answers,
        sessionId,
      });

      if (result?.overallPerformance) {
        setOverallPerformance(result.overallPerformance);
      }
      if (result?.topicBreakdown) {
        setTopicBreakdown(result.topicBreakdown);
      }
      if (result?.completedTopics) {
        setCompletedTopics(result.completedTopics);
      }

      setSubmissionResult(result);

      if (!isLastTopic) {
        // Direct student to the next topic (e.g. Present Simple -> Present Continuous)
        const nextTopic = GRAMMAR_TOPICS[currentTopicIdx + 1]?.title;
        if (nextTopic) {
          await fetchLesson(nextTopic, true);
        }
      } else {
        // Final topic completed! Show result scorecard and stay on results screen
        setShowFinalScorecard(true);
      }

      loadStudentProgress();
    } catch (err) {
      console.warn('[GrammarPage] Submit exercise notice:', err.message);

      if (!isLastTopic) {
        const nextTopic = GRAMMAR_TOPICS[currentTopicIdx + 1]?.title;
        if (nextTopic) {
          setCompletedTopics((prev) => [...prev, currentTopic]);
          await fetchLesson(nextTopic, true);
        }
      } else {
        setShowFinalScorecard(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to retrieve topic breakdown stats for any topic
  const getTopicStats = (topicTitle) => {
    if (!Array.isArray(topicBreakdown) || topicBreakdown.length === 0) {
      return { attempted: 0, correct: 0, wrong: 0, accuracy: 0, completed: false };
    }
    const found = topicBreakdown.find(
      (tb) =>
        tb.topic === topicTitle ||
        tb.topic.replace(/\s+/g, '') === topicTitle.replace(/\s+/g, '')
    );
    return found || { attempted: 0, correct: 0, wrong: 0, accuracy: 0, completed: false };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/40 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Dashboard &gt; Grammar &gt; {currentTopic}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {lessonData?.title || `${currentTopic} Practice`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master English syntax and verb structures through interactive AI exercises.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            size="sm"
            variant="outline"
            disabled={isGenerating}
            onClick={() => fetchLesson('Present Simple', true, true)}
            className="rounded-xl shadow-sm w-full sm:w-auto"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" />
            )}
            {isGenerating ? 'Generating...' : 'Generate New AI Exercises'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Topics Progression */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Grammar Curriculum
              </h3>
              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                {completedTopics.length} / 7 Completed
              </span>
            </div>

            <div className="space-y-2">
              {GRAMMAR_TOPICS.map((topic, idx) => {
                const unlocked = isTopicUnlocked(idx);
                const isCompleted = completedTopics.some(
                  (t) =>
                    t === topic.title ||
                    t.replace(/\s+/g, '') === topic.title.replace(/\s+/g, '')
                );
                const isSelected = currentTopic === topic.title && !showFinalScorecard;
                const stats = getTopicStats(topic.title);

                return (
                  <button
                    key={topic.id}
                    disabled={!unlocked}
                    onClick={() => fetchLesson(topic.title, true)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 border-brand-300 shadow-sm'
                        : unlocked
                        ? 'bg-white border-slate-100 hover:border-slate-200'
                        : 'bg-slate-50/60 border-slate-100 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          0{topic.id}.
                        </span>
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-brand-600' : 'text-slate-800'
                          }`}
                        >
                          {topic.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Level {topic.level}
                        </span>
                        {stats.attempted > 0 && (
                          <span className="text-[10px] text-brand-600 font-bold">
                            • {stats.accuracy}% acc ({stats.correct}/{stats.attempted})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : !unlocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Question Session / Comprehensive Result Scorecard */}
        <div className="lg:col-span-8 space-y-6">
          {showFinalScorecard ? (
            /* Professional Completion Result Screen with Overall Performance & Topic Breakdown */
            <Card className="p-6 sm:p-8 space-y-8 bg-white border border-slate-100 shadow-elevated rounded-3xl animate-in fade-in zoom-in-95">
              {/* Header Badge & Title */}
              <div className="text-center space-y-3">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md mx-auto">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1.5">
                    Curriculum Completed
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Grammar Overall Performance 🎉
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Combined results for all questions attempted across all 7 Grammar topics.
                  </p>
                </div>
              </div>

              {/* Overall Performance Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Overall Accuracy Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-2">
                  <ProgressCircle
                    value={overallPerformance.overallAccuracy || 0}
                    size={76}
                    strokeWidth={7}
                    color="#4F46E5"
                  >
                    <span className="text-sm font-black text-slate-900">
                      {overallPerformance.overallAccuracy || 0}%
                    </span>
                  </ProgressCircle>
                  <span className="text-[11px] font-bold text-slate-700">Overall Accuracy</span>
                </div>

                {/* Total Attempted Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-2xl font-black text-slate-900">
                    {overallPerformance.totalQuestions || 0}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">Total Questions</span>
                </div>

                {/* Correct Answers Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center justify-center text-center space-y-1">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-2xl font-black text-emerald-950">
                      {overallPerformance.correctAnswers || 0}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800">Correct Answers</span>
                </div>

                {/* Wrong Answers Card */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center text-center space-y-1">
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-2xl font-black text-amber-950">
                      {overallPerformance.wrongAnswers || 0}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800">Wrong Answers</span>
                </div>
              </div>

              {/* Topic-Wise Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-brand-600" /> Topic-Wise Breakdown
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Calculated from actual question attempts
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3">Topic</th>
                        <th className="p-3 text-center">Attempted</th>
                        <th className="p-3 text-center text-emerald-700">Correct</th>
                        <th className="p-3 text-center text-rose-700">Wrong</th>
                        <th className="p-3 text-right">Accuracy %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {GRAMMAR_TOPICS.map((topic) => {
                        const stats = getTopicStats(topic.title);
                        return (
                          <tr key={topic.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{topic.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                                  {topic.level}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center font-semibold">
                              {stats.attempted > 0 ? `${stats.attempted}` : '0'}
                            </td>
                            <td className="p-3 text-center font-bold text-emerald-600">
                              {stats.correct}
                            </td>
                            <td className="p-3 text-center font-bold text-rose-600">
                              {stats.wrong}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">
                              {stats.attempted > 0 ? `${stats.accuracy}%` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-slate-100">
                <Button
                  size="md"
                  onClick={() => fetchLesson('Present Simple', true, true)}
                  className="w-full sm:w-auto rounded-xl shadow-md font-bold px-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Start New Exercise
                </Button>

                <Link to="/my-mistakes" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full rounded-xl font-bold px-6">
                    <BookOpen className="w-4 h-4 mr-2 text-brand-600" /> Review My Mistakes
                  </Button>
                </Link>

                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full rounded-xl font-bold px-6">
                    Dashboard →
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 space-y-6">
              {isGenerating ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Generating targeted {currentTopic} questions with Gemini AI...
                  </p>
                </div>
              ) : currentQ ? (
                <div key={`session_${sessionId}_q_${currentQuestionIdx}`} className="space-y-6 animate-in fade-in">
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                        Question {currentQuestionIdx + 1} of {questions.length}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Topic: {currentTopic}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}% Complete
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {currentQ.prompt || currentQ.sentence}
                    </h3>
                    {currentQ.sentence && currentQ.prompt !== currentQ.sentence && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                        "{currentQ.sentence}"
                      </p>
                    )}
                  </div>

                  {/* Answer Options with Session-Aware Keys */}
                  <div className="space-y-2.5">
                    {currentQ.options?.map((opt) => (
                      <AnswerOption
                        key={`opt_${sessionId}_q${currentQuestionIdx}_${opt.id}`}
                        optionKey={opt.id}
                        text={opt.text}
                        selected={currentAnswer === opt.id}
                        isCorrect={opt.id === currentQ.correctAnswer}
                        showResult={hasAnsweredCurrent}
                        onClick={() => handleSelectAnswer(opt.id)}
                      />
                    ))}
                  </div>

                  {/* Explanation Card upon answering */}
                  {hasAnsweredCurrent && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-brand-700">
                        <Lightbulb className="w-4 h-4" /> Rule & Explanation:
                      </div>
                      <p className="text-[11px] text-indigo-900 leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}

                  {/* Navigation & Submission Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                    </Button>

                    {!isLastQuestion ? (
                      /* Q1..Q4: Next Question button */
                      <Button
                        size="sm"
                        disabled={!hasAnsweredCurrent}
                        onClick={handleNextOrSubmit}
                      >
                        Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    ) : !isLastTopic ? (
                      /* Q5 of Topics 1..6: Move to Next Topic button */
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isSubmitting || !hasAnsweredCurrent}
                        onClick={handleNextOrSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            Move to Next Topic <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </>
                        )}
                      </Button>
                    ) : (
                      /* Q5 of Topic 7 (Passive Voice & Reported Speech): Final Submit button */
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isSubmitting || !hasAnsweredCurrent}
                        onClick={handleNextOrSubmit}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Calculating Result...
                          </>
                        ) : (
                          'Submit & Finish Exercise ✓'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">
                  No questions loaded. Click "Generate New AI Exercises" to begin.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
