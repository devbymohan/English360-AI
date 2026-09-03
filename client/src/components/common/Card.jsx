import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-card p-5 transition-all duration-200',
        hover && 'hover:shadow-soft hover:border-indigo-100 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
