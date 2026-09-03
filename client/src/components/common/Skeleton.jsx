import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className = '' }) => {
  return <div className={cn('bg-slate-200/70 animate-pulse rounded-xl', className)} />;
};
