import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className={cn('border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin', sizes[size])} />
    </div>
  );
};
