import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Sparkles } from 'lucide-react';

export const Flashcard = ({
  word,
  phonetic,
  partOfSpeech = 'Adjective',
  meaning,
  example,
  synonyms = [],
  antonyms = [],
  onSpeak,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset to front side whenever active card word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  const handleSpeakClick = (e) => {
    e.stopPropagation();
    if (onSpeak) {
      onSpeak(word);
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative w-full min-h-[300px] rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/50 border border-indigo-100 p-8 shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer flex flex-col justify-between select-none"
    >
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" /> Tap to Flip
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakClick}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 flex items-center justify-center transition"
            title="Pronounce word"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <RotateCcw className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {!isFlipped ? (
        <div className="text-center space-y-2.5 my-auto py-4">
          <span className="text-[11px] font-bold text-purple-600 bg-purple-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
            {partOfSpeech}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">{word}</h2>
          <p className="text-sm font-semibold text-slate-400 font-mono">{phonetic || '/.../'}</p>
        </div>
      ) : (
        <div className="space-y-3 my-auto text-left animate-in fade-in zoom-in-95 duration-200 py-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Meaning:
            </span>
            <p className="text-sm font-bold text-slate-800 mt-0.5 leading-snug">{meaning}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Example Sentence:
            </span>
            <p className="text-xs text-slate-600 italic mt-0.5 leading-snug">"{example}"</p>
          </div>
          {synonyms && synonyms.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Synonyms:
              </span>
              <div className="flex flex-wrap gap-1">
                {synonyms.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {antonyms && antonyms.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Antonyms:
              </span>
              <div className="flex flex-wrap gap-1">
                {antonyms.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100/60">
        {!isFlipped ? 'Card Front (Word & Pronunciation)' : 'Card Back (Definition, Example & Synonyms)'}
      </div>
    </div>
  );
};
