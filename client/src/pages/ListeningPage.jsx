import React, { useState, useEffect, useRef } from 'react';
import { Headphones, FileText, CheckCircle2, HelpCircle, Loader2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { Modal } from '../components/common/Modal';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { AnswerOption } from '../components/common/AnswerOption';
import { listeningService } from '../services/listeningService';
import { useAuth } from '../context/AuthContext';

export const ListeningPage = () => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const seenLessonsRef = useRef(new Set());

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    setIsGenerating(true);
    setSubmissionResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);

    try {
      const excluded = Array.from(seenLessonsRef.current);
      const data = await listeningService.getLesson(
        null,
        user?.level || 'B1',
        excluded,
        `sess_${Date.now()}`,
        Date.now()
      );

      if (data && data.questions && data.questions.length > 0) {
        setLesson(data);
        if (data.topic) seenLessonsRef.current.add(data.topic.toLowerCase());
        if (data.title) seenLessonsRef.current.add(data.title.toLowerCase());
      }
    } catch (err) {
      console.warn('[ListeningPage] Error loading lesson:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optId) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optId }));
  };

  const handleSubmitAttempt = async () => {
    if (isSubmitting || !lesson?.questions) return;
    setIsSubmitting(true);

    try {
      const result = await listeningService.submitAttempt({
        lessonId: lesson.title || 'listening_lesson',
        title: lesson.title || 'Listening Lesson',
        questions: lesson.questions,
        answers: selectedAnswers,
      });
      setSubmissionResult(result);
    } catch (err) {
      console.warn('[ListeningPage] Submit listening error:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = lesson?.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const currentAnswer = selectedAnswers[currentQuestionIdx];
  const hasAnsweredCurrent = Boolean(currentAnswer);
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-white via-rose-50/40 to-pink-50/40 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Dashboard &gt; Listening &gt; {user?.level || 'B1'} Level
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            {lesson ? lesson.title : 'Loading Listening Lesson...'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Listen to the spoken audio and answer all 10 comprehension questions.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isGenerating}
          onClick={fetchLesson}
          className="rounded-xl shrink-0 w-full sm:w-auto"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Headphones className="w-4 h-4 mr-1.5 text-rose-600" />
          )}
          {isGenerating ? 'Generating Audio Lesson...' : 'Generate New Audio Lesson'}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Audio Player & 10 Questions */}
        <div className="lg:col-span-8 space-y-6">
          {lesson && (
            <AudioPlayer
              title={lesson.title}
              subtitle="Spoken English Dialogue with Real Duration & Seek Controls"
              scriptText={lesson.transcript}
            />
          )}

          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Question {currentQuestionIdx + 1} of {questions.length || 10}
                </span>
                <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                  {answeredCount}/{questions.length || 10} Answered
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTranscript(true)}>
                <FileText className="w-3.5 h-3.5 mr-1" /> View Script
              </Button>
            </div>

            {/* Question Pill Navigation (1 to 10) */}
            {questions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        isCurrent
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ ? (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {currentQuestionIdx + 1}. {currentQ.prompt}
                </h4>

                <div className="space-y-2.5">
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
                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-xs text-rose-900 space-y-1 animate-in fade-in">
                    <span className="font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-rose-600" /> Explanation:
                    </span>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-500" />
                <p className="text-xs">Loading lesson questions...</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              {currentQuestionIdx < questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                >
                  Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="success"
                  disabled={isSubmitting || answeredCount === 0}
                  onClick={handleSubmitAttempt}
                >
                  {isSubmitting ? 'Saving Attempt...' : 'Submit Listening Attempt ✓'}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Word Bank & Tips */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Key Vocabulary</h4>
            <div className="flex flex-wrap gap-1.5">
              {(lesson?.wordBank || []).map((word) => (
                <span
                  key={word}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {word}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-2 bg-slate-50">
            <h5 className="text-xs font-bold text-slate-800">Listening Strategies</h5>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc list-inside">
              {(lesson?.tips || []).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </Card>

          {submissionResult && (
            <Card className="p-5 text-center space-y-3 bg-emerald-50/60 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h5 className="text-xs font-bold text-emerald-900">Listening Score Recorded!</h5>
              <div className="flex items-center justify-center py-2">
                <ProgressCircle
                  value={submissionResult.score || 0}
                  size={80}
                  strokeWidth={7}
                  color="#059669"
                >
                  <span className="text-lg font-extrabold text-slate-900">
                    {submissionResult.score}%
                  </span>
                </ProgressCircle>
              </div>
              <p className="text-xs text-emerald-800 font-bold">
                {submissionResult.correctCount} of {submissionResult.total} Questions Correct
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Transcript Modal */}
      <Modal
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
        title="Conversation Transcript"
      >
        <div className="text-xs text-slate-700 space-y-3 leading-relaxed whitespace-pre-line">
          {lesson?.transcript}
        </div>
      </Modal>
    </div>
  );
};
