import React from 'react';
import { cn } from '../../utils/cn';
import { getCleanPhotoURL } from '../../utils/firebaseMetadata';

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

  const cleanSrc = getCleanPhotoURL(src);

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-brand-100 flex items-center justify-center font-bold text-brand-700 shrink-0 border border-slate-100', sizes[size], className)}>
      {cleanSrc ? (
        <img src={cleanSrc} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};
