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

const shuffleOptions = (opts, correctId) => {
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

const FALLBACK_PASSAGES = [
  {
    title: 'The Architecture of Focus',
    topic: 'Cognitive Science & Productivity',
    wordCount: 315,
    passage: `In contemporary cognitive psychology, human attention is increasingly modeled not as a static resource, but as a dynamic biological ecosystem vulnerable to environmental disruptions. The concept of "deep work"—sustained, distraction-free concentration on cognitively demanding tasks—has shifted from a career optimization strategy into an essential defense mechanism against cognitive fragmentation.

When individuals constantly toggle between communication channels, digital alerts, and analytical assignments, the human brain incurs what researchers classify as "attention residue." Even a momentary glance at an inbox leaves cognitive bandwidth anchored to the prior task, reducing overall processing efficiency by up to forty percent during subsequent complex reasoning.

To cultivate robust deep work architecture, organizational scientists recommend structured temporal compartmentalization. Techniques such as the Pomodoro rhythm and asymmetric scheduling delineate dedicated focus blocks from collaborative intervals. Furthermore, physical environment optimization—minimizing visual stimuli and audible cues—reinforces neural pathways responsible for executive functioning.

Ultimately, mastering sustained concentration is an iterative skill rather than an innate talent. By systematically eliminating interruptions and valuing high-intensity deliberation, modern professionals and students can produce higher quality outcomes in significantly condensed timeframes while simultaneously mitigating cognitive fatigue.`,
    questions: [
      { id: 1, prompt: 'What is attention residue according to the passage?', options: [{ id: 'A', text: 'Cognitive bandwidth left anchored to a prior interrupted task' }, { id: 'B', text: 'A chemical imbalance caused by prolonged sleep deprivation' }, { id: 'C', text: 'The physical exhaustion resulting from manual labor' }, { id: 'D', text: 'An inability to remember long-term childhood memories' }], correctAnswer: 'A', explanation: 'The passage defines attention residue as cognitive bandwidth remaining anchored to an interrupted task.' },
      { id: 2, prompt: 'How much can task switching reduce processing efficiency during complex reasoning?', options: [{ id: 'A', text: 'Up to forty percent' }, { id: 'B', text: 'Less than five percent' }, { id: 'C', text: 'Exactly seventy-five percent' }, { id: 'D', text: 'Ninety percent' }], correctAnswer: 'A', explanation: 'Paragraph 2 specifies that overall processing efficiency drops by up to forty percent.' },
      { id: 3, prompt: 'Which phrase best encapsulates the author’s perspective on focus?', options: [{ id: 'A', text: 'An iterative, trainable skill rather than an innate talent' }, { id: 'B', text: 'An unchangeable genetic trait fixed at birth' }, { id: 'C', text: 'A secondary skill useful only for specialized computer scientists' }, { id: 'D', text: 'An outdated methodology incompatible with modern business' }], correctAnswer: 'A', explanation: 'Paragraph 4 states that mastering concentration is an iterative skill rather than an innate talent.' },
      { id: 4, prompt: 'What is recommended to cultivate a robust deep work architecture?', options: [{ id: 'A', text: 'Structured temporal compartmentalization and environmental optimization' }, { id: 'B', text: 'Multitasking across multiple monitors simultaneously' }, { id: 'C', text: 'Responding immediately to all incoming digital notifications' }, { id: 'D', text: 'Eliminating all collaborative work completely' }], correctAnswer: 'A', explanation: 'Paragraph 3 highlights structured temporal blocks and physical optimization.' },
      { id: 5, prompt: 'What is the primary role of "deep work" in the modern professional landscape?', options: [{ id: 'A', text: 'A vital defense mechanism against cognitive fragmentation' }, { id: 'B', text: 'A leisure activity reserved for weekend retreats' }, { id: 'C', text: 'A computational framework used strictly in software engineering' }, { id: 'D', text: 'An administrative compliance guideline' }], correctAnswer: 'A', explanation: 'Paragraph 1 highlights deep work as an essential defense against cognitive fragmentation.' },
      { id: 6, prompt: 'What does the term "asymmetric scheduling" imply in the context of the passage?', options: [{ id: 'A', text: 'Separating dedicated focus periods from collaborative intervals' }, { id: 'B', text: 'Working without any set timetable or deadlines' }, { id: 'C', text: 'Scheduling all meetings during late evening hours' }, { id: 'D', text: 'Shifting tasks randomly between team members' }], correctAnswer: 'A', explanation: 'Paragraph 3 mentions asymmetric scheduling to separate focus blocks from collaboration.' },
      { id: 7, prompt: 'How does physical environment optimization support executive functioning?', options: [{ id: 'A', text: 'By minimizing visual and audible distractions' }, { id: 'B', text: 'By increasing ambient background noise' }, { id: 'C', text: 'By encouraging continuous social interaction' }, { id: 'D', text: 'By providing constant digital entertainment' }], correctAnswer: 'A', explanation: 'Paragraph 3 states minimizing visual and audible cues reinforces neural pathways.' },
      { id: 8, prompt: 'What outcome is achieved through systematic interruption elimination?', options: [{ id: 'A', text: 'Higher quality results in condensed timeframes with reduced fatigue' }, { id: 'B', text: 'Slower progress and extended work hours' }, { id: 'C', text: 'Complete isolation from company communication' }, { id: 'D', text: 'Unpredictable quality variations in final deliverables' }], correctAnswer: 'A', explanation: 'Paragraph 4 states professionals produce higher quality in condensed time while reducing fatigue.' },
      { id: 9, prompt: 'Why is human attention compared to a biological ecosystem?', options: [{ id: 'A', text: 'Because it is dynamic and vulnerable to external disruptions' }, { id: 'B', text: 'Because it is unaffected by environmental changes' }, { id: 'C', text: 'Because it operates identical to plant photosynthesis' }, { id: 'D', text: 'Because it ceases to function during daylight hours' }], correctAnswer: 'A', explanation: 'Paragraph 1 describes attention as a dynamic biological ecosystem vulnerable to disruptions.' },
      { id: 10, prompt: 'What is the overarching tone of the reading passage?', options: [{ id: 'A', text: 'Analytical, informative, and constructive' }, { id: 'B', text: 'Skeptical and dismissive of modern science' }, { id: 'C', text: 'Humorous and sarcastic' }, { id: 'D', text: 'Pessimistic and resigned to failure' }], correctAnswer: 'A', explanation: 'The text provides evidence-based analysis and constructive recommendations.' }
    ]
  },
  {
    title: 'The Cognitive Science of Multilingualism',
    topic: 'Linguistics & Neuroscience',
    wordCount: 320,
    passage: `For decades, mid-twentieth-century pedagogical theories cautioned that exposing young learners to multiple languages simultaneously risked causing cognitive confusion and delayed developmental milestones. Modern neuroimaging and empirical linguistics have thoroughly dismantled this misconception, revealing that multilingualism bestows profound neuroplastic advantages that extend across the entire human lifespan.

When a multilingual speaker articulates an idea, all known languages remain concurrently active within the brain's subcortical networks. To prevent linguistic interference, the prefrontal cortex must continuously exert executive inhibition—actively suppressing irrelevant vocabulary while selecting appropriate syntax for the current communicative context. This perpetual mental workout builds robust cognitive reserve.

Extensive clinical research demonstrates that bilingual individuals consistently outperform monolingual peers on standardized tasks requiring selective attention, working memory updating, and abstract problem solving. Furthermore, epidemiological studies indicate that lifelong bilingualism delays the symptomatic onset of neurodegenerative disorders, such as Alzheimer’s disease, by an average of four to five years.

In summary, learning a foreign language transforms far more than communicative competence. It fundamentally rewires neural architecture, fortifies cognitive resilience against neurological aging, and enhances mental agility in an increasingly interconnected global economy.`,
    questions: [
      { id: 1, prompt: 'What misconception regarding early multilingual exposure was historically held?', options: [{ id: 'A', text: 'It caused developmental delays and cognitive confusion' }, { id: 'B', text: 'It accelerated mathematical reasoning too quickly' }, { id: 'C', text: 'It caused permanent loss of native language vocabulary' }, { id: 'D', text: 'It had zero impact on memory or learning' }], correctAnswer: 'A', explanation: 'Paragraph 1 explains historical theories claimed multilingualism caused confusion and developmental delays.' },
      { id: 2, prompt: 'What occurs in the brain when a multilingual individual speaks?', options: [{ id: 'A', text: 'All known languages remain concurrently active in neural networks' }, { id: 'B', text: 'All other languages are completely erased from memory' }, { id: 'C', text: 'Only the native language can be accessed' }, { id: 'D', text: 'The brain switches off executive inhibition entirely' }], correctAnswer: 'A', explanation: 'Paragraph 2 notes that all known languages remain concurrently active in subcortical networks.' },
      { id: 3, prompt: 'Which brain region manages executive inhibition to prevent linguistic interference?', options: [{ id: 'A', text: 'The prefrontal cortex' }, { id: 'B', text: 'The spinal cord' }, { id: 'C', text: 'The optic nerve' }, { id: 'D', text: 'The cerebellum' }], correctAnswer: 'A', explanation: 'Paragraph 2 states the prefrontal cortex continuously exerts executive inhibition.' },
      { id: 4, prompt: 'How many years can lifelong bilingualism delay the onset of dementia symptoms on average?', options: [{ id: 'A', text: 'Four to five years' }, { id: 'B', text: 'One to two months' }, { id: 'C', text: 'Over twenty years' }, { id: 'D', text: 'Zero years' }], correctAnswer: 'A', explanation: 'Paragraph 3 states bilingualism delays symptomatic onset of neurodegenerative disorders by 4–5 years.' },
      { id: 5, prompt: 'On which tasks do bilingual individuals consistently demonstrate superior performance?', options: [{ id: 'A', text: 'Selective attention, working memory updating, and problem solving' }, { id: 'B', text: 'Physical athletics and endurance running' }, { id: 'C', text: 'Short-term visual recognition without recall' }, { id: 'D', text: 'Speed typing on computer hardware' }], correctAnswer: 'A', explanation: 'Paragraph 3 highlights selective attention, working memory, and abstract problem solving.' },
      { id: 6, prompt: 'What is the term used for the brain’s ability to adapt and rewire its neural connections?', options: [{ id: 'A', text: 'Neuroplasticity' }, { id: 'B', text: 'Neurodegeneration' }, { id: 'C', text: 'Cognitive interference' }, { id: 'D', text: 'Subcortical latency' }], correctAnswer: 'A', explanation: 'Paragraph 1 references neuroplastic advantages and neural rewiring.' },
      { id: 7, prompt: 'Why is the suppression of irrelevant vocabulary described as a "mental workout"?', options: [{ id: 'A', text: 'Because it constantly challenges and strengthens executive control' }, { id: 'B', text: 'Because it requires rigorous physical exercise' }, { id: 'C', text: 'Because it causes immediate mental exhaustion' }, { id: 'D', text: 'Because it reduces oxygen flow to the brain' }], correctAnswer: 'A', explanation: 'Paragraph 2 explains executive inhibition builds cognitive reserve through constant neural engagement.' },
      { id: 8, prompt: 'What broader economic and personal benefit does multilingualism provide?', options: [{ id: 'A', text: 'Enhanced mental agility in an interconnected global economy' }, { id: 'B', text: 'Guaranteed financial wealth without work' }, { id: 'C', text: 'Complete elimination of cultural misunderstandings' }, { id: 'D', text: 'Reduced need for formal education' }], correctAnswer: 'A', explanation: 'Paragraph 4 emphasizes mental agility and readiness for the global economy.' },
      { id: 9, prompt: 'What has modern neuroimaging technology proven about multilingual learners?', options: [{ id: 'A', text: 'They gain significant lifelong neuroplastic and cognitive benefits' }, { id: 'B', text: 'They experience severe permanent cognitive decline' }, { id: 'C', text: 'Their native language skills deteriorate rapidly' }, { id: 'D', text: 'Their brains show no difference from monolingual speakers' }], correctAnswer: 'A', explanation: 'Paragraph 1 states modern neuroimaging dismantled old myths and proved profound advantages.' },
      { id: 10, prompt: 'Which adjective best characterizes the author’s view of foreign language acquisition?', options: [{ id: 'A', text: 'Transformative and deeply beneficial' }, { id: 'B', text: 'Unnecessary and burdensome' }, { id: 'C', text: 'Risky and developmentally dangerous' }, { id: 'D', text: 'Trivial and unimportant' }], correctAnswer: 'A', explanation: 'Paragraph 4 concludes language learning transforms neural architecture and builds resilience.' }
    ]
  }
];

const getFallbackReadingPassage = (excluded = []) => {
  const normExcluded = (excluded || []).map((t) => String(t).trim().toLowerCase());
  const available = FALLBACK_PASSAGES.filter((p) => !normExcluded.includes(p.title.toLowerCase()));
  const chosen = available.length > 0 ? available[0] : FALLBACK_PASSAGES[Math.floor(Math.random() * FALLBACK_PASSAGES.length)];

  const preparedQuestions = chosen.questions.map((q) => {
    const shuffled = shuffleOptions(q.options, q.correctAnswer);
    return {
      id: q.id,
      prompt: q.prompt,
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      explanation: q.explanation,
    };
  });

  return {
    title: chosen.title,
    topic: chosen.topic,
    wordCount: chosen.wordCount,
    passage: chosen.passage,
    questions: preparedQuestions,
  };
};

export const ReadingPage = () => {
  const { user, updateUserState } = useAuth();
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

    const currentTopic = passageData?.title || passageData?.topic;
    const excluded = forceNew && currentTopic
      ? Array.from(new Set([...seenTopics, currentTopic]))
      : seenTopics;

    try {
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
      } else {
        const fallback = getFallbackReadingPassage(excluded);
        setPassageData(fallback);
        if (fallback.title) {
          setSeenTopics((prev) => Array.from(new Set([...prev, fallback.title])));
        }
      }
    } catch (err) {
      console.warn('[ReadingPage] Load passage notice:', err.message);
      const fallback = getFallbackReadingPassage(excluded);
      setPassageData(fallback);
      if (fallback.title) {
        setSeenTopics((prev) => Array.from(new Set([...prev, fallback.title])));
      }
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
        if (typeof result.streak === 'number' && updateUserState) {
          updateUserState({ streak: result.streak });
        }
      }
    } catch (err) {
      console.warn('[ReadingPage] Submit reading error:', err.message);
      let correct = 0;
      passageData.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) correct++;
      });
      const total = passageData.questions.length || 5;
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
