import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Edit3,
  Headphones,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Award,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { AnswerOption } from '../components/common/AnswerOption';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { assessmentService } from '../services/assessmentService';
import { useAuth } from '../context/AuthContext';

// Comprehensive 5-skill diagnostic questions starting from Question 1
const DEFAULT_ASSESSMENT_DATA = {
  grammar: [
    {
      id: 'g1',
      prompt: '1. Choose the correct verb form to complete the sentence:',
      sentence: 'She _____ to London three times this year.',
      options: [
        { id: 'A', text: 'has been' },
        { id: 'B', text: 'was' },
        { id: 'C', text: 'is going' },
        { id: 'D', text: 'had went' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 'g2',
      prompt: '2. Select the correct conditional sentence:',
      sentence: 'If it _____ tomorrow, we will postpone the outdoor event.',
      options: [
        { id: 'A', text: 'will rain' },
        { id: 'B', text: 'rains' },
        { id: 'C', text: 'rained' },
        { id: 'D', text: 'is raining' },
      ],
      correctAnswer: 'B',
    },
    {
      id: 'g3',
      prompt: '3. Complete the sentence with the correct preposition:',
      sentence: 'He has been interested _____ artificial intelligence since childhood.',
      options: [
        { id: 'A', text: 'on' },
        { id: 'B', text: 'with' },
        { id: 'C', text: 'in' },
        { id: 'D', text: 'about' },
      ],
      correctAnswer: 'C',
    },
    {
      id: 'g4',
      prompt: '4. Choose the sentence with correct word order:',
      sentence: 'Which of the following is structured correctly?',
      options: [
        { id: 'A', text: 'Always she arrives early for class.' },
        { id: 'B', text: 'She arrives early always for class.' },
        { id: 'C', text: 'She always arrives early for class.' },
        { id: 'D', text: 'She arrives always early for class.' },
      ],
      correctAnswer: 'C',
    },
    {
      id: 'g5',
      prompt: '5. Identify the correct passive voice sentence:',
      sentence: 'The research report _____ by the team yesterday.',
      options: [
        { id: 'A', text: 'was submitted' },
        { id: 'B', text: 'is submitted' },
        { id: 'C', text: 'has submitted' },
        { id: 'D', text: 'submitting' },
      ],
      correctAnswer: 'A',
    },
  ],
  vocabulary: [
    {
      id: 'v1',
      prompt: '1. What is the closest synonym for the word "Diligent"?',
      options: [
        { id: 'A', text: 'Careless' },
        { id: 'B', text: 'Hardworking' },
        { id: 'C', text: 'Hesitant' },
        { id: 'D', text: 'Impulsive' },
      ],
      correctAnswer: 'B',
    },
    {
      id: 'v2',
      prompt: '2. Choose the word that best completes the sentence:',
      sentence: 'The new policy had a _____ impact on overall productivity.',
      options: [
        { id: 'A', text: 'significant' },
        { id: 'B', text: 'signify' },
        { id: 'C', text: 'significance' },
        { id: 'D', text: 'significantly' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 'v3',
      prompt: '3. What is the antonym of "Abundant"?',
      options: [
        { id: 'A', text: 'Plentiful' },
        { id: 'B', text: 'Generous' },
        { id: 'C', text: 'Scarce' },
        { id: 'D', text: 'Spacious' },
      ],
      correctAnswer: 'C',
    },
    {
      id: 'v4',
      prompt: '4. Select the meaning of "Reluctant":',
      options: [
        { id: 'A', text: 'Unwilling or hesitant' },
        { id: 'B', text: 'Extremely confident' },
        { id: 'C', text: 'Fast and energetic' },
        { id: 'D', text: 'Calm and peaceful' },
      ],
      correctAnswer: 'A',
    },
    {
      id: 'v5',
      prompt: '5. Complete the idiom: "Actions speak louder than _____."',
      options: [
        { id: 'A', text: 'promises' },
        { id: 'B', text: 'words' },
        { id: 'C', text: 'thoughts' },
        { id: 'D', text: 'intentions' },
      ],
      correctAnswer: 'B',
    },
  ],
  reading: {
    title: 'The Power of Reading',
    passage:
      'Reading is one of the most effective habits for cognitive development and vocabulary acquisition. When individuals read regularly, they are exposed to varied sentence structures, nuanced terminology, and diverse cultural perspectives.\n\nFurthermore, research indicates that deep reading enhances analytical thinking and concentration, acting as a mental workout in an era of rapid digital distractions. Dedicating even 20 minutes a day to thoughtful reading yields long-term benefits for communication and academic performance.',
    questions: [
      {
        id: 'r1',
        prompt: '1. What is the central idea of the passage?',
        options: [
          { id: 'A', text: 'Reading is only useful for young students.' },
          { id: 'B', text: 'Reading provides extensive cognitive, vocabulary, and analytical benefits.' },
          { id: 'C', text: 'Digital media has completely replaced the need for books.' },
          { id: 'D', text: 'Reading is difficult and time-consuming.' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'r2',
        prompt: '2. According to the text, how does reading counteract digital distractions?',
        options: [
          { id: 'A', text: 'By eliminating all screen use' },
          { id: 'B', text: 'By enhancing analytical thinking and concentration' },
          { id: 'C', text: 'By forcing people to memorize facts' },
          { id: 'D', text: 'By improving physical fitness' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'r3',
        prompt: '3. How much daily reading does the passage recommend for noticeable benefits?',
        options: [
          { id: 'A', text: '2 hours' },
          { id: 'B', text: '5 minutes' },
          { id: 'C', text: '20 minutes' },
          { id: 'D', text: '1 hour' },
        ],
        correctAnswer: 'C',
      },
    ],
  },
  writing: {
    prompt:
      'Describe a personal goal or hobby you are passionate about. Explain why it is important to you and how you plan to improve. (Aim for 40–80 words).',
  },
  listening: {
    title: 'Academic Advising Conversation',
    script:
      'Advisor: Good morning! How can I help you choose your courses for next semester?\nStudent: Hello! I want to take Advanced English Literature and Computer Science.\nAdvisor: Great combination! Make sure to register by Friday to secure your lab spot.',
    questions: [
      {
        id: 'l1',
        prompt: '1. What courses is the student planning to enroll in?',
        options: [
          { id: 'A', text: 'English Literature and Computer Science' },
          { id: 'B', text: 'History and Mathematics' },
          { id: 'C', text: 'Biology and Chemistry' },
          { id: 'D', text: 'Art and Physics' },
        ],
        correctAnswer: 'A',
      },
      {
        id: 'l2',
        prompt: '2. By when must the student complete registration?',
        options: [
          { id: 'A', text: 'Next Monday' },
          { id: 'B', text: 'This Friday' },
          { id: 'C', text: 'End of the month' },
          { id: 'D', text: 'Tomorrow morning' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
};

const SECTIONS = [
  { id: 'grammar', title: 'Grammar', count: '5 Questions', icon: BookOpen },
  { id: 'vocabulary', title: 'Vocabulary', count: '5 Questions', icon: Sparkles },
  { id: 'reading', title: 'Reading', count: '3 Questions', icon: BookOpen },
  { id: 'writing', title: 'Writing', count: '1 Task', icon: Edit3 },
  { id: 'listening', title: 'Listening', count: '2 Questions', icon: Headphones },
  { id: 'results', title: 'Results', count: 'CEFR Level', icon: Award },
];

export const AssessmentPage = () => {
  const navigate = useNavigate();
  const { setHasCompletedAssessment, updateUserState, user } = useAuth();

  // Section & Question state - ALWAYS starts at index 0
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Independent isolated answers
  const [grammarAnswers, setGrammarAnswers] = useState({});
  const [vocabAnswers, setVocabAnswers] = useState({});
  const [readingAnswers, setReadingAnswers] = useState({});
  const [writingEssay, setWritingEssay] = useState('');
  const [listeningAnswers, setListeningAnswers] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const activeSection = SECTIONS[currentSectionIdx];

  // Answer selection helper
  const handleSelectAnswer = (optId) => {
    if (activeSection.id === 'grammar') {
      setGrammarAnswers({ ...grammarAnswers, [currentQuestionIdx]: optId });
    } else if (activeSection.id === 'vocabulary') {
      setVocabAnswers({ ...vocabAnswers, [currentQuestionIdx]: optId });
    } else if (activeSection.id === 'reading') {
      setReadingAnswers({ ...readingAnswers, [currentQuestionIdx]: optId });
    } else if (activeSection.id === 'listening') {
      setListeningAnswers({ ...listeningAnswers, [currentQuestionIdx]: optId });
    }
  };

  // Get selected answer for current question
  const getCurrentSelectedAnswer = () => {
    if (activeSection.id === 'grammar') return grammarAnswers[currentQuestionIdx];
    if (activeSection.id === 'vocabulary') return vocabAnswers[currentQuestionIdx];
    if (activeSection.id === 'reading') return readingAnswers[currentQuestionIdx];
    if (activeSection.id === 'listening') return listeningAnswers[currentQuestionIdx];
    return null;
  };

  // Calculate questions count for current section
  const getSectionQuestionsCount = () => {
    if (activeSection.id === 'grammar') return DEFAULT_ASSESSMENT_DATA.grammar.length;
    if (activeSection.id === 'vocabulary') return DEFAULT_ASSESSMENT_DATA.vocabulary.length;
    if (activeSection.id === 'reading') return DEFAULT_ASSESSMENT_DATA.reading.questions.length;
    if (activeSection.id === 'writing') return 1;
    if (activeSection.id === 'listening') return DEFAULT_ASSESSMENT_DATA.listening.questions.length;
    return 1;
  };

  // Navigation: Next button
  const handleNext = () => {
    const totalInSec = getSectionQuestionsCount();
    if (currentQuestionIdx < totalInSec - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Advance to next section
      if (currentSectionIdx < SECTIONS.length - 2) {
        setCurrentSectionIdx(currentSectionIdx + 1);
        setCurrentQuestionIdx(0);
      } else {
        // Final submit
        handleSubmitAssessment();
      }
    }
  };

  // Navigation: Previous button
  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else if (currentSectionIdx > 0) {
      const prevSecIdx = currentSectionIdx - 1;
      setCurrentSectionIdx(prevSecIdx);
      setCurrentQuestionIdx(0);
    }
  };

  // If user already completed the assessment, show results view directly
  useEffect(() => {
    if ((user?.assessmentCompleted || (user?.level && user?.level !== 'Not Assessed')) && !assessmentResult) {
      const existingLevel = user.level || user.englishLevel || 'B1';
      const existingScore = user.overallScore || 75;
      setAssessmentResult({
        estimatedLevel: existingLevel,
        overallScore: existingScore,
        grammarScore: 80,
        vocabularyScore: 75,
        readingScore: 85,
        writingScore: 70,
        listeningScore: 80,
      });
      setCurrentSectionIdx(5); // Show results view
    }
  }, [user?.assessmentCompleted, user?.level, user?.englishLevel]);

  // Final submission & scoring
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);

    // Calculate score for each section
    let gCorrect = 0;
    DEFAULT_ASSESSMENT_DATA.grammar.forEach((q, idx) => {
      if (grammarAnswers[idx] === q.correctAnswer) gCorrect++;
    });
    const grammarScore = Math.round((gCorrect / DEFAULT_ASSESSMENT_DATA.grammar.length) * 100);

    let vCorrect = 0;
    DEFAULT_ASSESSMENT_DATA.vocabulary.forEach((q, idx) => {
      if (vocabAnswers[idx] === q.correctAnswer) vCorrect++;
    });
    const vocabularyScore = Math.round((vCorrect / DEFAULT_ASSESSMENT_DATA.vocabulary.length) * 100);

    let rCorrect = 0;
    DEFAULT_ASSESSMENT_DATA.reading.questions.forEach((q, idx) => {
      if (readingAnswers[idx] === q.correctAnswer) rCorrect++;
    });
    const readingScore = Math.round((rCorrect / DEFAULT_ASSESSMENT_DATA.reading.questions.length) * 100);

    const writingScore = writingEssay.trim().split(/\s+/).length >= 30 ? 80 : 65;

    let lCorrect = 0;
    DEFAULT_ASSESSMENT_DATA.listening.questions.forEach((q, idx) => {
      if (listeningAnswers[idx] === q.correctAnswer) lCorrect++;
    });
    const listeningScore = Math.round((lCorrect / DEFAULT_ASSESSMENT_DATA.listening.questions.length) * 100);

    const overallScore = Math.round(
      (grammarScore + vocabularyScore + readingScore + writingScore + listeningScore) / 5
    );

    let level = 'B1';
    if (overallScore >= 90) level = 'C1';
    else if (overallScore >= 75) level = 'B2';
    else if (overallScore >= 60) level = 'B1';
    else if (overallScore >= 40) level = 'A2';
    else level = 'A1';

    const resultPayload = {
      firebaseUid: user?.uid,
      userId: user?.uid,
      name: user?.name,
      email: user?.email,
      grammarScore,
      vocabularyScore,
      readingScore,
      writingScore,
      listeningScore,
      overallScore,
      estimatedLevel: level,
      assessmentCompleted: true,
    };

    try {
      await assessmentService.submitAssessment(resultPayload);
    } catch (err) {
      console.warn('[AssessmentPage] Backend submission notice:', err.message);
    } finally {
      setAssessmentResult(resultPayload);
      updateUserState({
        assessmentCompleted: true,
        level: level,
        englishLevel: level,
        overallScore,
      });
      setHasCompletedAssessment(true);
      setCurrentSectionIdx(5); // Results step
      setIsSubmitting(false);
    }
  };

  const currentAnswer = getCurrentSelectedAnswer();
  const totalQuestionsInCurrentSection = getSectionQuestionsCount();

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Initial English Assessment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate your English across 5 core skills to determine your personalized starting level.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700 shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-brand-600"></span>
          Step {currentSectionIdx + 1} of 6
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: 6-Step Stepper */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Assessment Steps
            </h3>
            <div className="space-y-3">
              {SECTIONS.map((sec, idx) => {
                const isDone = idx < currentSectionIdx;
                const isActive = idx === currentSectionIdx;
                return (
                  <div
                    key={sec.id}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition ${
                      isActive
                        ? 'bg-brand-50 border border-brand-200 text-brand-700 font-bold'
                        : isDone
                        ? 'text-emerald-700 bg-emerald-50/50'
                        : 'text-slate-500 bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold">{sec.title}</h5>
                      <p className="text-[11px] opacity-75 font-normal">{sec.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              Your assessment establishes your baseline CEFR level. Take your time on each question.
            </span>
          </div>
        </div>

        {/* Right: Active Test Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: GRAMMAR */}
          {activeSection.id === 'grammar' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-brand-600">
                  Grammar • Question {currentQuestionIdx + 1} of {DEFAULT_ASSESSMENT_DATA.grammar.length}
                </span>
                <span className="text-xs text-slate-400">Diagnostic 1/5</span>
              </div>

              {(() => {
                const q = DEFAULT_ASSESSMENT_DATA.grammar[currentQuestionIdx];
                return (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500">{q.prompt}</p>
                    <h3 className="text-base font-bold text-slate-900">{q.sentence}</h3>

                    <div className="space-y-2.5">
                      {q.options.map((opt) => (
                        <AnswerOption
                          key={opt.id}
                          optionKey={opt.id}
                          text={opt.text}
                          selected={currentAnswer === opt.id}
                          onClick={() => handleSelectAnswer(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIdx === 0}
                  onClick={handlePrev}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentQuestionIdx < DEFAULT_ASSESSMENT_DATA.grammar.length - 1
                    ? 'Next Question →'
                    : 'Next Section (Vocabulary) →'}
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 2: VOCABULARY */}
          {activeSection.id === 'vocabulary' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-purple-600">
                  Vocabulary • Question {currentQuestionIdx + 1} of {DEFAULT_ASSESSMENT_DATA.vocabulary.length}
                </span>
                <span className="text-xs text-slate-400">Diagnostic 2/5</span>
              </div>

              {(() => {
                const q = DEFAULT_ASSESSMENT_DATA.vocabulary[currentQuestionIdx];
                return (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-500">{q.prompt}</p>
                    {q.sentence && <h3 className="text-base font-bold text-slate-900">{q.sentence}</h3>}

                    <div className="space-y-2.5">
                      {q.options.map((opt) => (
                        <AnswerOption
                          key={opt.id}
                          optionKey={opt.id}
                          text={opt.text}
                          selected={currentAnswer === opt.id}
                          onClick={() => handleSelectAnswer(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentQuestionIdx < DEFAULT_ASSESSMENT_DATA.vocabulary.length - 1
                    ? 'Next Question →'
                    : 'Next Section (Reading) →'}
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 3: READING */}
          {activeSection.id === 'reading' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-blue-600">
                  Reading Comprehension • Question {currentQuestionIdx + 1} of {DEFAULT_ASSESSMENT_DATA.reading.questions.length}
                </span>
                <span className="text-xs text-slate-400">Diagnostic 3/5</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 max-h-48 overflow-y-auto">
                <h4 className="font-bold text-slate-900 text-xs">{DEFAULT_ASSESSMENT_DATA.reading.title}</h4>
                <p className="whitespace-pre-line">{DEFAULT_ASSESSMENT_DATA.reading.passage}</p>
              </div>

              {(() => {
                const q = DEFAULT_ASSESSMENT_DATA.reading.questions[currentQuestionIdx];
                return (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">{q.prompt}</h4>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <AnswerOption
                          key={opt.id}
                          optionKey={opt.id}
                          text={opt.text}
                          selected={currentAnswer === opt.id}
                          onClick={() => handleSelectAnswer(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {currentQuestionIdx < DEFAULT_ASSESSMENT_DATA.reading.questions.length - 1
                    ? 'Next Question →'
                    : 'Next Section (Writing) →'}
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 4: WRITING */}
          {activeSection.id === 'writing' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-amber-600">Writing Task</span>
                <span className="text-xs text-slate-400">Diagnostic 4/5</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">{DEFAULT_ASSESSMENT_DATA.writing.prompt}</p>
                <textarea
                  rows={6}
                  value={writingEssay}
                  onChange={(e) => setWritingEssay(e.target.value)}
                  placeholder="Type your response here (40–80 words)..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-[11px] text-slate-400 text-right">
                  Words: {writingEssay.trim() ? writingEssay.trim().split(/\s+/).length : 0}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button size="sm" onClick={handleNext}>
                  Next Section (Listening) →
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 5: LISTENING */}
          {activeSection.id === 'listening' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-rose-600">
                  Listening • Question {currentQuestionIdx + 1} of {DEFAULT_ASSESSMENT_DATA.listening.questions.length}
                </span>
                <span className="text-xs text-slate-400">Diagnostic 5/5</span>
              </div>

              <AudioPlayer
                title={DEFAULT_ASSESSMENT_DATA.listening.title}
                subtitle="Listen to the dialogue to answer questions"
                scriptText={DEFAULT_ASSESSMENT_DATA.listening.script}
                duration={45}
              />

              {(() => {
                const q = DEFAULT_ASSESSMENT_DATA.listening.questions[currentQuestionIdx];
                return (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900">{q.prompt}</h4>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <AnswerOption
                          key={opt.id}
                          optionKey={opt.id}
                          text={opt.text}
                          selected={currentAnswer === opt.id}
                          onClick={() => handleSelectAnswer(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant={currentQuestionIdx === DEFAULT_ASSESSMENT_DATA.listening.questions.length - 1 ? 'success' : 'primary'}
                  disabled={isSubmitting}
                  onClick={handleNext}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Evaluating Assessment...
                    </>
                  ) : currentQuestionIdx < DEFAULT_ASSESSMENT_DATA.listening.questions.length - 1 ? (
                    'Next Question →'
                  ) : (
                    'Submit Assessment & See Level ✓'
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 6: RESULTS */}
          {activeSection.id === 'results' && assessmentResult && (
            <Card className="p-6 sm:p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                  Diagnostic Result
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                  Assigned Level: {assessmentResult.estimatedLevel}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Overall Diagnostic Score: <strong className="text-slate-900">{assessmentResult.overallScore}%</strong>
                </p>
              </div>

              {/* Skills Scorecard */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs pt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">Grammar</p>
                  <p className="font-extrabold text-brand-600 mt-0.5">{assessmentResult.grammarScore}%</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">Vocabulary</p>
                  <p className="font-extrabold text-purple-600 mt-0.5">{assessmentResult.vocabularyScore}%</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">Reading</p>
                  <p className="font-extrabold text-blue-600 mt-0.5">{assessmentResult.readingScore}%</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">Writing</p>
                  <p className="font-extrabold text-amber-600 mt-0.5">{assessmentResult.writingScore}%</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold">Listening</p>
                  <p className="font-extrabold text-rose-600 mt-0.5">{assessmentResult.listeningScore}%</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-900 text-left">
                <strong>Educational Notice:</strong> This is an educational CEFR level estimate to personalize your daily study plan and exercises.
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-2xl shadow-md font-bold"
              >
                Go to Student Dashboard →
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentSectionIdx(0);
                  setCurrentQuestionIdx(0);
                }}
                className="w-full rounded-2xl text-xs text-slate-600 hover:text-slate-900 border-slate-200"
              >
                Retake Diagnostic Assessment
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
