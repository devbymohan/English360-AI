import React from 'react';
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
