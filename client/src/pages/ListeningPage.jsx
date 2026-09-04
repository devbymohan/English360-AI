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

const shuffleListeningOptions = (opts, correctId) => {
  const correctOpt = opts.find((o) => o.id === correctId) || opts[0];
  const clone = [...opts];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  const letters = ['A', 'B', 'C', 'D'];
  let newCorrect = 'A';
  const reindexed = clone.map((opt, i) => {
    const letter = letters[i];
    if (opt.text === correctOpt.text) {
      newCorrect = letter;
    }
    return { id: letter, text: opt.text };
  });
  return { options: reindexed, correctAnswer: newCorrect };
};

const FALLBACK_LISTENING_LESSONS = [
  {
    topic: 'University Campus Orientation',
    title: 'University Campus Orientation',
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_5674468-lq.mp3',
    transcript: `Speaker A (Advisor): Good morning, everyone! Welcome to St. Jude International University's fall orientation session. Before you head to your academic departments, let's cover three essential services available at the student hub.
Speaker B (Student): Excuse me, where do we get our student identification cards validated for library access?
Speaker A: Excellent question! The identification and registrar desk is located on the second floor of the campus center. Once your card is validated, you have round-the-clock access to digital research databases, quiet study carrels, and collaborative multimedia suites. Additionally, our health and counseling center is open weekdays from 8:00 AM to 5:00 PM on the first floor.
Speaker B: And what about transportation and off-campus shuttles?
Speaker A: Campus shuttle buses depart every fifteen minutes from the north gate. Be sure to download the campus transit application to monitor live arrival schedules and receive route notifications.`,
    vocabulary: ['Orientation', 'Identification', 'Validation', 'Collaborative', 'Transportation'],
    strategies: ['Identify key speaker transition cues', 'Note down specific times and locations', 'Focus on practical logistical announcements'],
    questions: [
      { id: 1, prompt: 'What event is taking place during this audio recording?', options: [{ id: 'A', text: 'Fall semester university orientation' }, { id: 'B', text: 'A formal graduation ceremony' }, { id: 'C', text: 'A student government election debate' }, { id: 'D', text: 'A biology laboratory lecture' }], correctAnswer: 'A', explanation: 'Speaker A welcomes students to the fall orientation session.' },
      { id: 2, prompt: 'On which floor is the identification validation desk located?', options: [{ id: 'A', text: 'Second floor' }, { id: 'B', text: 'First floor' }, { id: 'C', text: 'Basement level' }, { id: 'D', text: 'Third floor' }], correctAnswer: 'A', explanation: 'Speaker A specifies the desk is on the second floor of the campus center.' },
      { id: 3, prompt: 'What facility is available round-the-clock once cards are validated?', options: [{ id: 'A', text: 'Digital research databases and quiet study carrels' }, { id: 'B', text: 'The dining hall buffet' }, { id: 'C', text: 'The swimming gymnasium' }, { id: 'D', text: 'The financial aid office' }], correctAnswer: 'A', explanation: 'Validation unlocks 24/7 access to digital databases and study suites.' },
      { id: 4, prompt: 'What are the operating hours for the health and counseling center?', options: [{ id: 'A', text: 'Weekdays from 8:00 AM to 5:00 PM' }, { id: 'B', text: 'Weekends only from noon to 6:00 PM' }, { id: 'C', text: 'Daily from 6:00 AM to midnight' }, { id: 'D', text: 'Tuesdays and Thursdays only' }], correctAnswer: 'A', explanation: 'The health center operates weekdays between 8:00 AM and 5:00 PM.' },
      { id: 5, prompt: 'How frequently do campus shuttle buses depart from the north gate?', options: [{ id: 'A', text: 'Every fifteen minutes' }, { id: 'B', text: 'Every hour' }, { id: 'C', text: 'Once in the morning and once in the evening' }, { id: 'D', text: 'Every forty-five minutes' }], correctAnswer: 'A', explanation: 'Shuttles depart every fifteen minutes from the north gate.' },
      { id: 6, prompt: 'What tool should students download to monitor live transit arrivals?', options: [{ id: 'A', text: 'The campus transit mobile application' }, { id: 'B', text: 'A printed paper timetable' }, { id: 'C', text: 'A generic map browser' }, { id: 'D', text: 'A podcast player' }], correctAnswer: 'A', explanation: 'Speaker A recommends downloading the campus transit application.' },
      { id: 7, prompt: 'Where is the health and counseling center situated?', options: [{ id: 'A', text: 'First floor of the campus center' }, { id: 'B', text: 'North gate parking lot' }, { id: 'C', text: 'Inside the university bookstore' }, { id: 'D', text: 'Off-campus downtown' }], correctAnswer: 'A', explanation: 'Speaker A states the health center is located on the first floor.' },
      { id: 8, prompt: 'Who is the primary audience for the speaker’s remarks?', options: [{ id: 'A', text: 'Newly arriving undergraduate and graduate students' }, { id: 'B', text: 'Senior university faculty professors' }, { id: 'C', text: 'Local commercial bus drivers' }, { id: 'D', text: 'Construction maintenance crews' }], correctAnswer: 'A', explanation: 'The orientation is delivered to incoming students.' },
      { id: 9, prompt: 'Which department manages student ID validation?', options: [{ id: 'A', text: 'Registrar and identification desk' }, { id: 'B', text: 'Campus security headquarters' }, { id: 'C', text: 'Athletics department' }, { id: 'D', text: 'Counseling office' }], correctAnswer: 'A', explanation: 'Speaker A explicitly points students to the registrar and ID desk.' },
      { id: 10, prompt: 'What overall tone does the orientation advisor convey?', options: [{ id: 'A', text: 'Helpful, organized, and welcoming' }, { id: 'B', text: 'Impatient and critical' }, { id: 'C', text: 'Humorous and sarcastic' }, { id: 'D', text: 'Strict and disciplinary' }], correctAnswer: 'A', explanation: 'The advisor provides friendly, structured guidance.' }
    ]
  },
  {
    topic: 'Academic Support Consultation',
    title: 'Academic Support Consultation',
    audioUrl: 'https://cdn.freesound.org/previews/573/573381_5674468-lq.mp3',
    transcript: `Speaker A (Tutor): Welcome, David. I reviewed your mid-semester essay draft on environmental economics. You have clear arguments, but we need to strengthen the literature citations.
Speaker B (Student): Thank you, Dr. Harris. I struggled with integrating empirical studies from peer-reviewed journals.
Speaker A: That is a very common challenge. Let’s focus on the synthesis matrix method. Rather than summarizing one paper per paragraph, group your sources by theme—such as carbon taxation incentives versus regulatory caps.
Speaker B: That makes a lot of sense! How long should my revised draft be?
Speaker A: Aim for 2,500 words, including your bibliography, submitted through the student portal by next Thursday at 5:00 PM.`,
    vocabulary: ['Empirical', 'Peer-reviewed', 'Synthesis', 'Incentives', 'Bibliography'],
    strategies: ['Note assignment deadlines and word limits', 'Listen for academic feedback advice', 'Pay attention to structuring suggestions'],
    questions: [
      { id: 1, prompt: 'What is the primary topic of this academic consultation?', options: [{ id: 'A', text: 'Feedback on an environmental economics essay draft' }, { id: 'B', text: 'Scheduling a final exam retake' }, { id: 'C', text: 'Applying for a study-abroad scholarship' }, { id: 'D', text: 'Paying overdue tuition fees' }], correctAnswer: 'A', explanation: 'The tutor discusses David’s essay draft on environmental economics.' },
      { id: 2, prompt: 'What specific weakness did Dr. Harris identify in the draft?', options: [{ id: 'A', text: 'Integration of peer-reviewed empirical citations' }, { id: 'B', text: 'Poor spelling and punctuation errors' }, { id: 'C', text: 'Lack of an introductory paragraph' }, { id: 'D', text: 'Incorrect font formatting' }], correctAnswer: 'A', explanation: 'The tutor recommends strengthening the literature citations.' },
      { id: 3, prompt: 'What method does the tutor recommend for organizing sources?', options: [{ id: 'A', text: 'A thematic synthesis matrix' }, { id: 'B', text: 'Alphabetical order by author last name' }, { id: 'C', text: 'Chronological order by publication date' }, { id: 'D', text: 'Random selection' }], correctAnswer: 'A', explanation: 'Dr. Harris advises using the synthesis matrix method.' },
      { id: 4, prompt: 'What is the required target word count for the revised draft?', options: [{ id: 'A', text: '2,500 words' }, { id: 'B', text: '1,000 words' }, { id: 'C', text: '5,000 words' }, { id: 'D', text: '500 words' }], correctAnswer: 'A', explanation: 'Dr. Harris specifies an aim of 2,500 words including bibliography.' },
      { id: 5, prompt: 'When is the final revised draft due?', options: [{ id: 'A', text: 'Next Thursday at 5:00 PM' }, { id: 'B', text: 'Tomorrow morning at 9:00 AM' }, { id: 'C', text: 'At the end of the academic year' }, { id: 'D', text: 'Next Monday at midnight' }], correctAnswer: 'A', explanation: 'The deadline is set for next Thursday at 5:00 PM.' },
      { id: 6, prompt: 'How must the student submit the final paper?', options: [{ id: 'A', text: 'Through the online student portal' }, { id: 'B', text: 'As a printed hardcopy in class' }, { id: 'C', text: 'Via postal mail' }, { id: 'D', text: 'On a USB flash drive' }], correctAnswer: 'A', explanation: 'Submission is through the student portal.' },
      { id: 7, prompt: 'What example themes does the tutor suggest comparing?', options: [{ id: 'A', text: 'Carbon taxation incentives versus regulatory caps' }, { id: 'B', text: 'Solar energy versus nuclear fusion' }, { id: 'C', text: 'Online learning versus classroom attendance' }, { id: 'D', text: 'Macroeconomics versus Microeconomics' }], correctAnswer: 'A', explanation: 'Dr. Harris suggests grouping sources around carbon tax vs regulatory caps.' },
      { id: 8, prompt: 'How does the student react to the tutor’s structural advice?', options: [{ id: 'A', text: 'Positively and receptively' }, { id: 'B', text: 'Defensively and angrily' }, { id: 'C', text: 'Confused and resistant' }, { id: 'D', text: 'Disinterested' }], correctAnswer: 'A', explanation: 'David agrees that the suggestion "makes a lot of sense".' },
      { id: 9, prompt: 'What role does Dr. Harris hold in the conversation?', options: [{ id: 'A', text: 'Academic tutor and professor' }, { id: 'B', text: 'University librarian' }, { id: 'C', text: 'Campus security officer' }, { id: 'D', text: 'Fellow undergraduate classmate' }], correctAnswer: 'A', explanation: 'Dr. Harris is the academic instructor/tutor guiding the student.' },
      { id: 10, prompt: 'What should David include in addition to his main text?', options: [{ id: 'A', text: 'A complete bibliography' }, { id: 'B', text: 'A handwritten cover letter' }, { id: 'C', text: 'Photographs of his research books' }, { id: 'D', text: 'A personal resume' }], correctAnswer: 'A', explanation: 'The 2,500 word target includes the bibliography.' }
    ]
  }
];

const getFallbackListeningLesson = (excluded = []) => {
  const normExcluded = (excluded || []).map((t) => String(t).trim().toLowerCase());
  const available = FALLBACK_LISTENING_LESSONS.filter((l) => !normExcluded.includes(l.title.toLowerCase()));
  const chosen = available.length > 0 ? available[0] : FALLBACK_LISTENING_LESSONS[Math.floor(Math.random() * FALLBACK_LISTENING_LESSONS.length)];

  const preparedQuestions = chosen.questions.map((q) => {
    const shuffled = shuffleListeningOptions(q.options, q.correctAnswer);
    return {
      id: q.id,
      prompt: q.prompt,
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      explanation: q.explanation,
    };
  });

  return {
    ...chosen,
    questions: preparedQuestions,
  };
};

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

    const excluded = Array.from(seenLessonsRef.current);

    try {
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
      } else {
        const fallback = getFallbackListeningLesson(excluded);
        setLesson(fallback);
        if (fallback.title) seenLessonsRef.current.add(fallback.title.toLowerCase());
      }
    } catch (err) {
      console.warn('[ListeningPage] Error loading lesson:', err.message);
      const fallback = getFallbackListeningLesson(excluded);
      setLesson(fallback);
      if (fallback.title) seenLessonsRef.current.add(fallback.title.toLowerCase());
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
