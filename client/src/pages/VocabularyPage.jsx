import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Layers,
  BookOpen,
  Brain,
  Loader2,
  XCircle,
  Award,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { AnswerOption } from '../components/common/AnswerOption';
import { Flashcard } from '../components/common/Flashcard';
import { vocabularyService } from '../services/vocabularyService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';

const shuffleQuestionOptions = (question) => {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const oldCorrectId = String(question.correctAnswer || 'A').toUpperCase().trim();
  let correctOption = question.options.find(
    (opt) => String(opt.id || '').toUpperCase().trim() === oldCorrectId
  );
  if (!correctOption) {
    correctOption = question.options[0];
  }
  const correctText = typeof correctOption === 'string' ? correctOption : correctOption.text || String(correctOption);
  const optionTexts = question.options.map((opt) =>
    typeof opt === 'string' ? opt : opt.text || String(opt)
  );
  for (let i = optionTexts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionTexts[i], optionTexts[j]] = [optionTexts[j], optionTexts[i]];
  }
  let newCorrectLetter = 'A';
  const newOptions = optionTexts.map((text, idx) => {
    const letter = letters[idx] || String(idx + 1);
    if (text === correctText) {
      newCorrectLetter = letter;
    }
    return { id: letter, text };
  });
  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectLetter,
  };
};

const INITIAL_5_WORDS = [
  {
    id: 1,
    word: 'Diligent',
    phonetic: '/ˈdɪl.ə.dʒənt/',
    partOfSpeech: 'Adjective',
    meaning: 'Showing steady, earnest, and energetic effort in completing tasks.',
    example: 'She was a diligent student who consistently reviewed her notes every evening.',
    synonyms: ['hardworking', 'assiduous', 'attentive'],
    antonyms: ['lazy', 'careless', 'negligent'],
    bookmarked: false,
    practiceQuestion: {
      prompt: 'Which word is closest in meaning to "Diligent"?',
      options: [
        { id: 'A', text: 'Hesitant' },
        { id: 'B', text: 'Hardworking' },
        { id: 'C', text: 'Carefree' },
        { id: 'D', text: 'Impatient' },
      ],
      correctAnswer: 'B',
      explanation: '"Diligent" means showing persistent effort and hard work in one\'s duties.',
    },
  },
  {
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'Adjective',
    meaning: 'Able to withstand or recover quickly from difficult conditions.',
    example: 'The local community proved remarkably resilient during the economic recovery.',
    synonyms: ['adaptable', 'tough', 'durable'],
    antonyms: ['fragile', 'vulnerable', 'weak'],
    bookmarked: false,
    practiceQuestion: {
      prompt: 'Choose the word that means "able to recover quickly from adversity":',
      options: [
        { id: 'A', text: 'Resilient' },
        { id: 'B', text: 'Reluctant' },
        { id: 'C', text: 'Rigid' },
        { id: 'D', text: 'Redundant' },
      ],
      correctAnswer: 'A',
      explanation: '"Resilient" refers to the ability to bounce back and thrive after hardship.',
    },
  },
  {
    word: 'Meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    partOfSpeech: 'Adjective',
    meaning: 'Showing great attention to detail; very careful and precise.',
    example: 'He conducted a meticulous review of the contract before finalizing the deal.',
    synonyms: ['thorough', 'scrupulous', 'exact'],
    antonyms: ['careless', 'sloppy', 'inaccurate'],
    bookmarked: false,
    practiceQuestion: {
      prompt: 'What is the antonym (opposite) of "Meticulous"?',
      options: [
        { id: 'A', text: 'Careless' },
        { id: 'B', text: 'Thorough' },
        { id: 'C', text: 'Accurate' },
        { id: 'D', text: 'Precise' },
      ],
      correctAnswer: 'A',
      explanation: 'While "meticulous" means extremely thorough and precise, its antonym is "careless".',
    },
  },
  {
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'Adjective',
    meaning: 'Dealing with things sensibly and realistically based on practical considerations.',
    example: 'They adopted a pragmatic approach to solve the budget deficit.',
    synonyms: ['practical', 'realistic', 'sensible'],
    antonyms: ['idealistic', 'impractical', 'unrealistic'],
    bookmarked: false,
    practiceQuestion: {
      prompt: 'Select the best definition for "Pragmatic":',
      options: [
        { id: 'A', text: 'Guided by practical rather than theoretical considerations' },
        { id: 'B', text: 'Overly dramatic and emotional' },
        { id: 'C', text: 'Hesitant to take action' },
        { id: 'D', text: 'Strictly traditional and rigid' },
      ],
      correctAnswer: 'A',
      explanation: '"Pragmatic" describes an attitude focused on realistic, workable results.',
    },
  },
  {
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    partOfSpeech: 'Adjective',
    meaning: 'Fluent, persuasive, and expressive in speaking or writing.',
    example: 'The speaker delivered an eloquent speech that moved the entire audience.',
    synonyms: ['articulate', 'persuasive', 'fluent'],
    antonyms: ['inarticulate', 'clumsy', 'unclear'],
    bookmarked: false,
    practiceQuestion: {
      prompt: 'Which word describes someone who speaks clearly, persuasively, and with grace?',
      options: [
        { id: 'A', text: 'Eloquent' },
        { id: 'B', text: 'Evasive' },
        { id: 'C', text: 'Eccentric' },
        { id: 'D', text: 'Equivocal' },
      ],
      correctAnswer: 'A',
      explanation: '"Eloquent" means expressing ideas clearly, forcefully, and beautifully.',
    },
  },
];

export const VocabularyPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');
  const [wordsList, setWordsList] = useState(() =>
    INITIAL_5_WORDS.map((w) => ({
      ...w,
      practiceQuestion: w.practiceQuestion ? shuffleQuestionOptions(w.practiceQuestion) : null,
    }))
  );
  const [selectedWord, setSelectedWord] = useState(() => INITIAL_5_WORDS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streak, setStreak] = useState(0);

  // Flashcards state
  const [flashcardIdx, setFlashcardIdx] = useState(0);

  // Quiz state (Strictly based on the 5 words currently in wordsList)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  useEffect(() => {
    loadWords(false);
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await progressService.getProgress();
      if (data) setStreak(data.streak || 0);
    } catch (e) {}
  };

  const loadWords = async (forceNew = false) => {
    setIsGenerating(true);
    try {
      const excludedWords = forceNew ? wordsList.map((w) => w.word) : [];
      const sessionId = 'vocab_' + Date.now();
      const userLevel = user?.level || user?.englishLevel || 'B1';

      const data = await vocabularyService.getWords(
        userLevel,
        5,
        excludedWords,
        sessionId,
        Date.now()
      );

      if (data && Array.isArray(data.words) && data.words.length > 0) {
        const new5 = data.words.slice(0, 5);
        setWordsList(new5);
        setSelectedWord(new5[0]);
        setFlashcardIdx(0);
        // Reset quiz state to align with new 5 words
        setQuizIndex(0);
        setQuizAnswers({});
        setQuizResult(null);
      }
    } catch (err) {
      console.warn('[VocabularyPage] Load words error:', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleBookmark = async (id, e) => {
    if (e) e.stopPropagation();
    const targetWord = wordsList.find((w) => w.id === id);
    if (!targetWord) return;

    const newBookmarked = !targetWord.bookmarked;

    // Optimistic UI update
    setWordsList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, bookmarked: newBookmarked } : w))
    );
    if (selectedWord?.id === id) {
      setSelectedWord((prev) => ({ ...prev, bookmarked: newBookmarked }));
    }

    try {
      await vocabularyService.toggleBookmark(targetWord);
    } catch (err) {
      console.warn('[VocabularyPage] Bookmark error:', err.message);
    }
  };

  const handleQuizAnswer = (optId) => {
    setQuizAnswers((prev) => ({ ...prev, [quizIndex]: optId }));
  };

  const handleQuizSubmit = async () => {
    if (isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const result = await vocabularyService.submitQuiz({
        words: wordsList,
        answers: quizAnswers,
      });

      if (result) {
        setQuizResult(result);
      } else {
        // Local evaluation fallback
        let correct = 0;
        wordsList.forEach((w, idx) => {
          const ans = quizAnswers[idx];
          const expected = w.practiceQuestion?.correctAnswer || 'A';
          if (ans === expected) correct++;
        });
        setQuizResult({
          score: Math.round((correct / wordsList.length) * 100),
          correctCount: correct,
          wrongCount: wordsList.length - correct,
          total: wordsList.length,
          mistakesCount: wordsList.length - correct,
        });
      }
      loadProgress();
    } catch (err) {
      console.warn('[VocabularyPage] Quiz submit error:', err.message);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily Words (5)', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'practice', label: 'Practice Quiz', icon: Brain },
    { id: 'wordbank', label: 'Word Bank', icon: Bookmark },
  ];

  // Quiz active word and question (Strictly corresponding to wordsList[quizIndex])
  const currentQuizWord = wordsList[quizIndex] || wordsList[0];
  const currentQuizQ = currentQuizWord?.practiceQuestion || {
    prompt: `What is the meaning of "${currentQuizWord?.word}"?`,
    options: [
      { id: 'A', text: currentQuizWord?.meaning || 'Correct definition' },
      { id: 'B', text: 'Incorrect alternative definition' },
      { id: 'C', text: 'Another unrelated option' },
      { id: 'D', text: 'Opposite meaning entirely' },
    ],
    correctAnswer: 'A',
    explanation: `"${currentQuizWord?.word}": ${currentQuizWord?.meaning}`,
  };
  const currentQuizAns = quizAnswers[quizIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Card className="lg:col-span-8 p-4 sm:p-6 bg-gradient-to-r from-white via-purple-50/40 to-indigo-50/40 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Dashboard &gt; Vocabulary &gt; {user?.level || user?.englishLevel || 'B1'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Expand your active vocabulary with AI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Master 5 new CEFR-aligned words daily, review with interactive flashcards, and test retention.
            </p>
          </div>
          <div className="pt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              onClick={() => {
                setActiveTab('flashcards');
                setFlashcardIdx(0);
                setSelectedWord(wordsList[0]);
              }}
              className="rounded-xl flex-1 sm:flex-initial"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Practice Flashcards
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActiveTab('practice');
                setQuizIndex(0);
                setQuizAnswers({});
                setQuizResult(null);
              }}
              className="rounded-xl flex-1 sm:flex-initial"
            >
              Take Quick Quiz →
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isGenerating}
              onClick={() => loadWords(true)}
              className="rounded-xl font-bold w-full sm:w-auto"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-purple-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
              )}
              {isGenerating ? 'Generating 5 New Words...' : 'Generate New AI Words'}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center justify-between gap-4">
          <ProgressCircle value={wordsList.length * 20} size={84} strokeWidth={8} color="#8B5CF6">
            <span className="text-xs font-extrabold text-slate-900">{wordsList.length} Words</span>
          </ProgressCircle>
          <div className="text-right text-xs space-y-1">
            <h4 className="font-bold text-slate-900">Daily Vocabulary Set</h4>
            <p className="text-slate-400">
              Active Words: <span className="font-bold text-slate-800">{wordsList.length}</span>
            </p>
            <p className="text-slate-400">
              Daily Streak: <span className="font-bold text-orange-500">{streak} Days</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Daily Words (5 Words Explorer) */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Word List (Left Column) */}
          <Card className="lg:col-span-4 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Daily Set ({wordsList.length} Words)
              </h3>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {user?.level || user?.englishLevel || 'B1'}
              </span>
            </div>

            <div className="space-y-2">
              {wordsList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedWord(item)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs ${
                    selectedWord?.word === item.word
                      ? 'border-purple-400 bg-purple-50/80 text-purple-950 font-bold ring-1 ring-purple-200'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold w-4 text-center">{idx + 1}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.word}</p>
                      <p className="text-[10px] text-slate-400 font-normal line-clamp-1">
                        {item.meaning}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.word);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-white transition"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-white transition"
                      title={item.bookmarked ? 'Remove bookmark' : 'Bookmark word'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          item.bookmarked ? 'fill-purple-600 text-purple-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Word Details (Right Column) */}
          {selectedWord && (
            <Card className="lg:col-span-8 p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-900">{selectedWord.word}</h2>
                    <button
                      onClick={() => handleSpeak(selectedWord.word)}
                      className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition shadow-sm"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(selectedWord.id, e)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                      title="Bookmark word"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          selectedWord.bookmarked ? 'fill-purple-600 text-purple-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      {selectedWord.phonetic || '/.../'}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                      {selectedWord.partOfSpeech || 'Adjective'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {user?.level || user?.englishLevel || 'B1'}
                </span>
              </div>

              <div className="space-y-4 text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">
                    Meaning:
                  </span>
                  <p className="text-slate-900 font-bold text-base mt-0.5 leading-snug">
                    {selectedWord.meaning}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">
                    Example Sentence:
                  </span>
                  <p className="text-slate-700 italic text-sm mt-0.5 leading-snug">
                    "{selectedWord.example}"
                  </p>
                </div>
                {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">
                      Synonyms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWord.synonyms.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedWord.antonyms && selectedWord.antonyms.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">
                      Antonyms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedWord.antonyms.map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Flashcards */}
      {activeTab === 'flashcards' && wordsList.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-2">
            <span>Interactive Word Flashcards</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              Card {flashcardIdx + 1} of {wordsList.length}
            </span>
          </div>

          <Flashcard
            word={wordsList[flashcardIdx]?.word}
            phonetic={wordsList[flashcardIdx]?.phonetic}
            partOfSpeech={wordsList[flashcardIdx]?.partOfSpeech}
            meaning={wordsList[flashcardIdx]?.meaning}
            example={wordsList[flashcardIdx]?.example}
            synonyms={wordsList[flashcardIdx]?.synonyms || []}
            antonyms={wordsList[flashcardIdx]?.antonyms || []}
            onSpeak={handleSpeak}
          />

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              disabled={flashcardIdx === 0}
              onClick={() => {
                if (flashcardIdx > 0) {
                  setFlashcardIdx((prev) => prev - 1);
                  setSelectedWord(wordsList[flashcardIdx - 1]);
                }
              }}
              className="rounded-2xl px-6 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Card
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleBookmark(wordsList[flashcardIdx]?.id)}
              className="rounded-xl font-bold"
            >
              <Bookmark
                className={`w-4 h-4 mr-1 ${
                  wordsList[flashcardIdx]?.bookmarked
                    ? 'fill-purple-600 text-purple-600'
                    : 'text-slate-400'
                }`}
              />
              {wordsList[flashcardIdx]?.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>

            <Button
              size="lg"
              disabled={flashcardIdx === wordsList.length - 1}
              onClick={() => {
                if (flashcardIdx < wordsList.length - 1) {
                  setFlashcardIdx((prev) => prev + 1);
                  setSelectedWord(wordsList[flashcardIdx + 1]);
                }
              }}
              className="rounded-2xl px-8 shadow-md font-bold"
            >
              Next Card <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Practice Quiz / Quick Quiz */}
      {activeTab === 'practice' && (
        <Card className="max-w-2xl mx-auto p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vocabulary Quick Quiz</h3>
              <p className="text-xs text-slate-500">
                Testing your retention of today's {wordsList.length} words
              </p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Question {quizIndex + 1} of {wordsList.length}
            </span>
          </div>

          {quizResult !== null ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Vocabulary practice evaluated and recorded to your progress.
                </p>
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Questions</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {quizResult.total || wordsList.length}
                  </p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">Correct</p>
                  <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                    {quizResult.correctCount}
                  </p>
                </div>
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
                  <p className="text-[10px] text-rose-700 font-bold uppercase">Wrong</p>
                  <p className="text-xl font-extrabold text-rose-700 mt-0.5">
                    {quizResult.wrongCount}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 max-w-md mx-auto">
                <p className="text-xs font-bold text-purple-900">
                  Accuracy Score: <span className="text-base font-extrabold">{quizResult.score}%</span>
                </p>
                {quizResult.wrongCount > 0 && (
                  <p className="text-[11px] text-purple-700 mt-1">
                    {quizResult.wrongCount} incorrect answer{quizResult.wrongCount > 1 ? 's' : ''}{' '}
                    saved to <strong>My Mistakes</strong> for personalized review.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizResult(null);
                    setQuizIndex(0);
                    setQuizAnswers({});
                  }}
                  className="rounded-xl font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retake Quiz
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab('daily');
                    loadWords(true);
                  }}
                  className="rounded-xl font-bold shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Learn 5 New Words
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                  Target Word: {currentQuizWord?.word}
                </span>
                <h4 className="text-base font-bold text-slate-900">{currentQuizQ.prompt}</h4>
              </div>

              <div className="space-y-3">
                {currentQuizQ.options?.map((opt) => (
                  <AnswerOption
                    key={opt.id}
                    optionKey={opt.id}
                    text={opt.text}
                    selected={currentQuizAns === opt.id}
                    isCorrect={opt.id === currentQuizQ.correctAnswer}
                    showResult={Boolean(currentQuizAns)}
                    onClick={() => handleQuizAnswer(opt.id)}
                  />
                ))}
              </div>

              {/* Explanation Banner when answered */}
              {currentQuizAns && currentQuizQ.explanation && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs animate-in fade-in duration-200 ${
                    currentQuizAns === currentQuizQ.correctAnswer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="font-bold">
                    {currentQuizAns === currentQuizQ.correctAnswer ? '✓ Correct!' : '✕ Incorrect'}
                  </p>
                  <p className="mt-1 font-normal">{currentQuizQ.explanation}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={quizIndex === 0}
                  onClick={() => setQuizIndex((prev) => prev - 1)}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>

                {quizIndex < wordsList.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setQuizIndex((prev) => prev + 1)}
                    className="rounded-xl font-bold"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    disabled={isSubmittingQuiz}
                    onClick={handleQuizSubmit}
                    className="rounded-xl font-bold shadow-md"
                  >
                    {isSubmittingQuiz ? 'Evaluating...' : 'Finish Quiz ✓'}
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Tab 4: Word Bank */}
      {activeTab === 'wordbank' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Word Bank</h3>
              <p className="text-xs text-slate-400">Words you have bookmarked for review</p>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {wordsList.filter((w) => w.bookmarked).length} Bookmarked
            </span>
          </div>

          {wordsList.filter((w) => w.bookmarked).length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No bookmarked words yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Click the bookmark icon on any daily word or flashcard to save it to your personal Word Bank.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {wordsList
                .filter((w) => w.bookmarked)
                .map((w, idx) => (
                  <div
                    key={w.id || idx}
                    className="p-4 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3 transition cursor-pointer"
                    onClick={() => {
                      setSelectedWord(w);
                      setActiveTab('daily');
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-900">{w.word}</h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(w.word);
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-purple-600"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{w.meaning}</p>
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(w.id, e)}
                      className="p-1 text-purple-600 hover:text-rose-500 transition"
                      title="Remove from bookmarks"
                    >
                      <Bookmark className="w-4 h-4 fill-purple-600" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
