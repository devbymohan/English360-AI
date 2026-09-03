import React from 'react';
import { cn } from '../../utils/cn';

export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback = 'A',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-brand-100 flex items-center justify-center font-bold text-brand-700 shrink-0 border border-slate-100', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};
