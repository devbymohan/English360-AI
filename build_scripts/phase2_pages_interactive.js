import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

// 1. VocabularyPage.jsx
fs.writeFileSync(path.join(pagesDir, 'VocabularyPage.jsx'), `import React, { useState } from 'react';
import { Sparkles, Volume2, Bookmark, CheckCircle2, RotateCcw, ArrowRight, Layers, BookOpen, Brain, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { AnswerOption } from '../components/common/AnswerOption';
import { Flashcard } from '../components/common/Flashcard';
import { vocabularyData } from '../data/mockData';

export const VocabularyPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [wordsList, setWordsList] = useState(vocabularyData.todayWords);
  const [selectedWord, setSelectedWord] = useState(vocabularyData.todayWords[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const tabs = [
    { id: 'daily', label: 'Daily Words', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'practice', label: 'Practice Quiz', icon: Brain },
    { id: 'wordbank', label: 'Word Bank', icon: Bookmark },
  ];

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setWordsList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, bookmarked: !w.bookmarked } : w))
    );
  };

  const handleSelectOption = (optId) => {
    setSelectedOption(optId);
    setShowResult(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-gradient-to-r from-white via-purple-50/40 to-indigo-50/40 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Dashboard &gt; Vocabulary &gt; Daily Words
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Learn new words every day and build your vocabulary.
            </h2>
            <p className="text-xs text-slate-500 mt-1">Consistency is the key to mastering English expression!</p>
          </div>
          <div className="pt-4 flex items-center gap-3">
            <Button size="sm" onClick={() => setActiveTab('flashcards')} className="rounded-xl">
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Practice Flashcards
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('practice')} className="rounded-xl">
              Take Quick Quiz →
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center justify-between gap-4">
          <ProgressCircle value={30} size={84} strokeWidth={8} color="#8B5CF6">
            <span className="text-xs font-extrabold text-slate-900">6/20</span>
          </ProgressCircle>
          <div className="text-right text-xs space-y-1">
            <h4 className="font-bold text-slate-900">Today's Goal</h4>
            <p className="text-slate-400">New Words: <span className="font-bold text-slate-800">10</span></p>
            <p className="text-slate-400">Reviewed: <span className="font-bold text-slate-800">6</span></p>
            <p className="text-slate-400">Mastered: <span className="font-bold text-slate-800">2</span></p>
          </div>
        </Card>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap \${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }\`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode 1: Daily Words Explorer */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Words List */}
          <Card className="lg:col-span-4 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Today's Words ({wordsList.length})</h3>
              <span className="text-xs font-bold text-brand-600">All Levels</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {wordsList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedWord(item);
                    setShowResult(false);
                    setSelectedOption(null);
                  }}
                  className={\`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs \${
                    selectedWord.id === item.id
                      ? 'border-purple-400 bg-purple-50/80 text-purple-950 font-bold ring-1 ring-purple-200'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold">{item.id}</span>
                    <div>
                      <p className="font-bold text-slate-900">{item.word}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{item.meaning}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.word);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-purple-600 transition"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(item.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-purple-600 transition"
                      title="Bookmark"
                    >
                      <Bookmark className={\`w-4 h-4 \${item.bookmarked ? 'fill-purple-600 text-purple-600' : ''}\`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Center: Active Word Details */}
          <Card className="lg:col-span-5 p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-900">{selectedWord.word}</h2>
                  <button
                    onClick={() => handleSpeak(selectedWord.word)}
                    className="w-8 h-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition shadow-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5 font-mono">{selectedWord.phonetic}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                New Word
              </span>
            </div>

            <div className="space-y-3.5 text-xs bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Meaning:</span>
                <p className="text-slate-800 font-semibold text-sm mt-0.5">{selectedWord.meaning}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Example:</span>
                <p className="text-slate-700 italic text-xs mt-0.5">
                  "The garden was {selectedWord.word.toLowerCase()} with vibrant summer flowers."
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">Synonyms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {vocabularyData.activeWord.synonyms.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">Antonyms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {vocabularyData.activeWord.antonyms.map((a) => (
                    <span key={a} className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-100">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Practice Question */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                Practice: Choose the correct meaning of "{selectedWord.word}"
              </h4>
              <div className="space-y-2">
                {vocabularyData.activeWord.practiceQuestion.options.map((opt) => (
                  <AnswerOption
                    key={opt.id}
                    optionKey={opt.id}
                    text={opt.text}
                    selected={selectedOption === opt.id}
                    isCorrect={opt.correct}
                    showResult={showResult}
                    onClick={() => handleSelectOption(opt.id)}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Right: Stats */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5 text-center space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Your Vocabulary Progress</h4>
              <div className="flex justify-center py-1">
                <ProgressCircle value={vocabularyData.stats.progress} size={84} strokeWidth={8} color="#8B5CF6" />
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{vocabularyData.stats.wordsLearned}</p>
                  <p>Learned</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{vocabularyData.stats.wordsReviewed}</p>
                  <p>Reviewed</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{vocabularyData.stats.wordsMastered}</p>
                  <p>Mastered</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Word Streak 🔥</h4>
              <p className="text-xs font-extrabold text-orange-500">12 Days Consistent</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Review daily to lock these words into your permanent memory!
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Mode 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
          <Flashcard
            word={selectedWord.word}
            phonetic={selectedWord.phonetic}
            meaning={selectedWord.meaning}
            example={\`The team demonstrated \${selectedWord.word.toLowerCase()} capabilities during the project.\`}
            synonyms={['plentiful', 'ample', 'rich']}
          />

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const idx = wordsList.findIndex((w) => w.id === selectedWord.id);
                if (idx > 0) setSelectedWord(wordsList[idx - 1]);
              }}
              className="rounded-2xl px-6"
            >
              ← Previous Card
            </Button>
            <Button
              size="lg"
              onClick={() => {
                const idx = wordsList.findIndex((w) => w.id === selectedWord.id);
                if (idx < wordsList.length - 1) setSelectedWord(wordsList[idx + 1]);
              }}
              className="rounded-2xl px-8 shadow-md"
            >
              Next Card →
            </Button>
          </div>
        </div>
      )}

      {/* Mode 3: Practice Quiz */}
      {activeTab === 'practice' && (
        <Card className="max-w-2xl mx-auto p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Vocabulary Quiz</h3>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Question 1 of 5
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900">
            What is the synonym of the word <span className="text-purple-600">"Diligent"</span>?
          </h4>

          <div className="space-y-3">
            {[
              { id: 'A', text: 'Lazy and careless' },
              { id: 'B', text: 'Hardworking and attentive', correct: true },
              { id: 'C', text: 'Quick and fast' },
              { id: 'D', text: 'Angry and upset' },
            ].map((opt) => (
              <AnswerOption
                key={opt.id}
                optionKey={opt.id}
                text={opt.text}
                selected={selectedOption === opt.id}
                isCorrect={opt.correct}
                showResult={showResult}
                onClick={() => handleSelectOption(opt.id)}
              />
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button size="sm" onClick={() => setShowResult(false)}>Next Question →</Button>
          </div>
        </Card>
      )}

      {/* Mode 4: Word Bank */}
      {activeTab === 'wordbank' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Saved Word Bank (Bookmarked)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {wordsList.map((w) => (
              <div key={w.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{w.word}</h5>
                  <p className="text-[10px] text-slate-400">{w.meaning}</p>
                </div>
                <Bookmark className="w-4 h-4 fill-purple-600 text-purple-600" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
`);

// 2. ReadingPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ReadingPage.jsx'), `import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Clock, Pause, Play, CheckCircle2, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AnswerOption } from '../components/common/AnswerOption';
import { readingData } from '../data/mockData';

export const ReadingPage = () => {
  const [hasStarted, setHasStarted] = useState(true);
  const [isFinishedReading, setIsFinishedReading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(2); // 3rd question active
  const [selectedOption, setSelectedOption] = useState('C');
  const [showExplanation, setShowExplanation] = useState(true);
  const [activeWordDefinition, setActiveWordDefinition] = useState(null);

  useEffect(() => {
    let interval = null;
    if (hasStarted && !isFinishedReading && !isTimerPaused) {
      interval = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isFinishedReading, isTimerPaused]);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return \`\${m.toString().padStart(2, '0')}:\${sec.toString().padStart(2, '0')}\`;
  };

  const handleFinishReading = () => {
    setIsFinishedReading(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
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
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-mono">{formatTimer(secondsElapsed || 515)}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reading Passage Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Passage</h3>
              <span className="text-xs font-medium text-slate-400">Read carefully and answer questions</span>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
              {readingData.passage.split('\\n\\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Difficult Words Tap-to-Reveal */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Tap difficult words for definitions:</span>
              <div className="flex flex-wrap gap-2">
                {readingData.difficultWords.map((w) => (
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
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                  <span>
                    <strong className="text-blue-950">{activeWordDefinition}:</strong> Key contextual vocabulary word.
                  </span>
                  <button onClick={() => setActiveWordDefinition(null)} className="text-blue-600 font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm">Previous Passage</Button>
              <Button
                size="sm"
                variant={isFinishedReading ? 'outline' : 'success'}
                onClick={handleFinishReading}
              >
                {isFinishedReading ? '✓ Finished Reading' : "I'm Finished"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Question & Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Question Index Pills */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Questions</h3>
              <span className="text-xs font-bold text-brand-600">{currentQuestionIdx + 1} of 10</span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              {readingData.questions.map((q, idx) => (
                <button
                  key={q.number}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={\`py-2 rounded-xl text-xs font-bold transition \${
                    idx < currentQuestionIdx
                      ? 'bg-emerald-100 text-emerald-700'
                      : idx === currentQuestionIdx
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }\`}
                >
                  {q.number}
                </button>
              ))}
            </div>

            {/* Current Question Body */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {currentQuestionIdx + 1}. {readingData.currentQuestion.prompt}
              </h4>

              <div className="space-y-2">
                {readingData.currentQuestion.options.map((opt) => (
                  <AnswerOption
                    key={opt.id}
                    optionKey={opt.id}
                    text={opt.text}
                    selected={selectedOption === opt.id}
                    isCorrect={opt.correct}
                    showResult={showExplanation}
                    onClick={() => {
                      setSelectedOption(opt.id);
                      setShowExplanation(true);
                    }}
                  />
                ))}
              </div>

              {/* Instant feedback callout */}
              {showExplanation && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {readingData.currentQuestion.feedback.text}
                  </p>
                </div>
              )}
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
              <span>Tip: Read actively and look for signal words like "however", "therefore", and "in conclusion".</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 3. ListeningPage.jsx
fs.writeFileSync(path.join(pagesDir, 'ListeningPage.jsx'), `import React, { useState } from 'react';
import { Headphones, FileText, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { Modal } from '../components/common/Modal';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { AnswerOption } from '../components/common/AnswerOption';
import { listeningData } from '../data/mockData';

export const ListeningPage = () => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedOption, setSelectedOption] = useState('C');
  const [showResult, setShowResult] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(2);

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
          <AudioPlayer
            title={listeningData.title}
            subtitle="Audio stream with waveform"
            duration={165}
          />

          {/* Question Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400">
                Question {currentQuestionIdx + 1} of 10
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
                <AnswerOption
                  key={opt.id}
                  optionKey={opt.id}
                  text={opt.text}
                  selected={selectedOption === opt.id}
                  isCorrect={opt.correct}
                  showResult={showResult}
                  onClick={() => {
                    setSelectedOption(opt.id);
                    setShowResult(true);
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentQuestionIdx > 0 && setCurrentQuestionIdx(currentQuestionIdx - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => currentQuestionIdx < 9 && setCurrentQuestionIdx(currentQuestionIdx + 1)}
              >
                Next Question →
              </Button>
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
                <span key={word} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
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
          <p><span className="font-bold text-slate-900">Student:</span> Thank you, I have an upcoming presentation this Friday.</p>
        </div>
      </Modal>
    </div>
  );
};
`);

console.log('Interactive Vocabulary, Reading, and Listening generated successfully.');
