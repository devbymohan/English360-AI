import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Award, Clock, ArrowRight, ArrowLeft, Play, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { Modal } from '../components/common/Modal';
import { AnswerOption } from '../components/common/AnswerOption';
import { testService } from '../services/testService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_TEST_CATEGORIES = [
  { id: 'Mixed', title: 'Comprehensive Mixed English Test', desc: 'Grammar, Vocabulary, Reading & Listening combined', questions: 10, duration: '15 mins', level: 'All Levels' },
  { id: 'Grammar', title: 'Grammar & Syntax Mastery Exam', desc: 'Tenses, Modals, Conditionals, and Word Order', questions: 8, duration: '10 mins', level: 'B1/B2' },
  { id: 'Vocabulary', title: 'Academic & General Vocabulary Test', desc: 'Synonyms, Contextual meaning, and Collocations', questions: 8, duration: '10 mins', level: 'B1/B2' },
  { id: 'Reading', title: 'Reading Comprehension & Analysis', desc: 'Passages, Inference, and Critical understanding', questions: 6, duration: '12 mins', level: 'B1/B2' },
  { id: 'Listening', title: 'Spoken English & Dialogue Exam', desc: 'Conversations, Audio retention, and Details', questions: 6, duration: '10 mins', level: 'B1/B2' },
];

export const TestsPage = () => {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  // Test Runner Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTestCategory, setActiveTestCategory] = useState('Mixed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [testData, setTestData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTest = async (category = 'Mixed') => {
    setActiveTestCategory(category);
    setIsTestModalOpen(true);
    setIsGenerating(true);
    setTestData(null);
    setAnswers({});
    setCurrentQIndex(0);

    try {
      const data = await testService.generateTest(
        category,
        user?.level || 'B1',
        category === 'Mixed' ? 10 : 6,
        'Medium'
      );
      if (data && data.questions && data.questions.length > 0) {
        setTestData(data);
      } else {
        // Fallback test
        setTestData({
          title: `${category} Test`,
          questions: [
            {
              id: 1,
              category,
              prompt: 'Choose the grammatically correct sentence:',
              options: [
                { id: 'A', text: 'If it will rain, we will cancel the trip.' },
                { id: 'B', text: 'If it rains, we will cancel the trip.' },
                { id: 'C', text: 'If it rained, we will cancel.' },
                { id: 'D', text: 'If it raining, we cancel.' },
              ],
              correctAnswer: 'B',
              explanation: 'First conditional sentences use the simple present tense in the if-clause.',
            },
            {
              id: 2,
              category,
              prompt: 'Select the closest synonym for "Vibrant":',
              options: [
                { id: 'A', text: 'Dull' },
                { id: 'B', text: 'Lively and bright' },
                { id: 'C', text: 'Quiet' },
                { id: 'D', text: 'Heavy' },
              ],
              correctAnswer: 'B',
              explanation: '"Vibrant" means full of energy, life, or bright color.',
            },
          ],
        });
      }
    } catch (err) {
      console.warn('[TestsPage] Error generating test:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (optId) => {
    setAnswers((prev) => ({ ...prev, [currentQIndex]: optId }));
  };

  const handleSubmitTest = async () => {
    if (isSubmitting || !testData?.questions) return;
    setIsSubmitting(true);

    try {
      const result = await testService.submitTest({
        testId: testData.title || `${activeTestCategory}_test`,
        title: testData.title || `${activeTestCategory} Test`,
        questions: testData.questions,
        answers,
        timeTaken: '08:45',
      });
      if (typeof result?.streak === 'number' && updateUserState) {
        updateUserState({ streak: result.streak });
      }
      setIsTestModalOpen(false);
      navigate(`/test-results/${result.id || 'recent'}`);
    } catch (err) {
      console.warn('[TestsPage] Submit test error:', err.message);
      setIsTestModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories =
    activeTab === 'All'
      ? DEFAULT_TEST_CATEGORIES
      : DEFAULT_TEST_CATEGORIES.filter((c) => c.id.toLowerCase() === activeTab.toLowerCase());

  const questions = testData?.questions || [];
  const currentQ = questions[currentQIndex];
  const currentAnswer = answers[currentQIndex];
  const hasAnsweredCurrent = Boolean(currentAnswer);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-4 sm:p-8 bg-gradient-to-r from-white via-cyan-50/40 to-blue-50/40 border border-slate-100 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
            Dashboard &gt; Smart AI Tests
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Master English with Adaptive AI Tests
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Challenge yourself with personalized exams across Grammar, Vocabulary, Reading, and Listening.
          </p>
        </div>
        <div className="pt-4">
          <Button size="sm" onClick={() => startTest('Mixed')} className="rounded-xl shadow-md w-full sm:w-auto">
            <Play className="w-3.5 h-3.5 mr-1.5 fill-white" /> Start Mixed Test (10 Qs) →
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Test Catalog */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Grammar', 'Vocabulary', 'Reading', 'Listening'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab} Tests
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredCategories.map((test) => (
              <Card
                key={test.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-soft transition"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{test.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{test.desc}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-500 font-semibold mt-2">
                      <span>{test.questions} Questions</span>
                      <span>•</span>
                      <span>⏱ {test.duration}</span>
                      <span>•</span>
                      <span>{test.level}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => startTest(test.id)}
                    className="text-xs font-bold rounded-xl px-4 py-2 shadow-sm w-full sm:w-auto"
                  >
                    Take Test →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Standardized Test Guidelines</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Each test evaluates accuracy, speed, and comprehension.</li>
              <li>Incorrect answers are automatically saved to your Mistakes repository for review.</li>
              <li>Speak-free testing designed for all environments.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Interactive Test Runner Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title={testData?.title || `${activeTestCategory} Test`}
        size="lg"
      >
        {isGenerating ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Generating customized {activeTestCategory} questions with English360 AI...
            </p>
          </div>
        ) : currentQ ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-brand-600">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentQ.category || activeTestCategory}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {currentQIndex + 1}. {currentQ.prompt || currentQ.sentence}
              </h4>

              <div className="space-y-2">
                {currentQ.options?.map((opt) => (
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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              {currentQIndex < questions.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentQIndex((prev) => prev + 1)}>
                  Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="success"
                  disabled={isSubmitting}
                  onClick={handleSubmitTest}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit & Finish Exam ✓'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No questions found.</p>
        )}
      </Modal>
    </div>
  );
};
