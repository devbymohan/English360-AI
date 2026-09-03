import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const componentsDir = path.join(rootDir, 'client', 'src', 'components');

// 1. components/common/AudioPlayer.jsx
fs.writeFileSync(path.join(componentsDir, 'common', 'AudioPlayer.jsx'), `import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AudioPlayer = ({
  title = 'Conversation',
  subtitle = 'Listen carefully',
  duration = 165, // seconds (02:45)
  waveform = [30, 45, 60, 80, 50, 90, 75, 40, 65, 85, 95, 70, 55, 60, 45, 35, 70, 80, 60, 50, 40, 30, 20, 15, 25, 40, 55, 70, 65, 50, 40, 30],
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipTime = (seconds) => {
    setCurrentTime((prev) => Math.min(duration, Math.max(0, prev + seconds)));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  const progressPercent = (currentTime / duration) * 100;
  const activeBarsCount = Math.floor((progressPercent / 100) * waveform.length);

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 p-5 shadow-card space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeed(speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 0.75 : 1.0)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {speed}x
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Waveform Bars */}
      <div className="h-16 flex items-center gap-1 sm:gap-1.5 px-3 bg-slate-50 rounded-2xl border border-slate-100/80 cursor-pointer overflow-hidden">
        {waveform.map((val, idx) => {
          const isActive = idx <= activeBarsCount;
          return (
            <div
              key={idx}
              onClick={() => setCurrentTime((idx / waveform.length) * duration)}
              className={cn(
                'flex-1 rounded-full transition-all duration-200',
                isActive ? 'bg-brand-600' : 'bg-slate-200 hover:bg-slate-300'
              )}
              style={{ height: \`\${val}%\` }}
            />
          );
        })}
      </div>

      {/* Time & Controls */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-slate-500 font-mono">
          {formatTime(currentTime)}
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => skipTime(-10)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/20 transition transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => skipTime(10)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-400 font-mono">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
`);

// 2. components/common/AnswerOption.jsx
fs.writeFileSync(path.join(componentsDir, 'common', 'AnswerOption.jsx'), `import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AnswerOption = ({
  optionKey,
  text,
  selected = false,
  isCorrect = null,
  showResult = false,
  onClick,
  disabled = false,
  className = ''
}) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'flex items-center justify-between p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-150 select-none cursor-pointer',
        !showResult && selected && 'border-brand-500 bg-brand-50/70 text-brand-900 ring-2 ring-brand-100',
        !showResult && !selected && 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
        showResult && isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100',
        showResult && selected && !isCorrect && 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-100',
        disabled && 'cursor-default opacity-85',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(
          'w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition',
          !selected && !showResult && 'bg-slate-100 text-slate-600',
          selected && !showResult && 'bg-brand-600 text-white',
          showResult && isCorrect && 'bg-emerald-600 text-white',
          showResult && selected && !isCorrect && 'bg-rose-600 text-white'
        )}>
          {optionKey}
        </span>
        <span className="leading-snug">{text}</span>
      </div>

      {showResult && isCorrect && (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
      )}
      {showResult && selected && !isCorrect && (
        <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
      )}
    </div>
  );
};
`);

// 3. components/common/Flashcard.jsx
fs.writeFileSync(path.join(componentsDir, 'common', 'Flashcard.jsx'), `import React, { useState } from 'react';
import { Volume2, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Flashcard = ({ word, phonetic, meaning, example, synonyms = [], antonyms = [] }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative w-full h-72 rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/50 border border-indigo-100 p-8 shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer flex flex-col justify-between select-none"
    >
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" /> Tap to Flip
        </span>
        <RotateCcw className="w-4 h-4 text-slate-400" />
      </div>

      {!isFlipped ? (
        <div className="text-center space-y-2 my-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{word}</h2>
          <p className="text-sm font-semibold text-slate-400 font-mono">{phonetic}</p>
        </div>
      ) : (
        <div className="space-y-3 my-auto text-left animate-in fade-in zoom-in-95 duration-200">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Meaning:</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{meaning}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Example:</span>
            <p className="text-xs text-slate-600 italic mt-0.5">"{example}"</p>
          </div>
          {synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {synonyms.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-center text-[11px] text-slate-400 font-medium">
        {!isFlipped ? 'Card Front' : 'Card Back (Definition & Usage)'}
      </div>
    </div>
  );
};
`);

console.log('Phase 2 specialized components generated successfully.');
