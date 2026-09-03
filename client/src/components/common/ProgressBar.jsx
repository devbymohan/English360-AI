import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'bg-brand-600',
  trackColor = 'bg-slate-100',
  height = 'h-2',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full rounded-full overflow-hidden', trackColor, height, className)}>
      <div
        className={cn('h-full transition-all duration-500 rounded-full', color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
