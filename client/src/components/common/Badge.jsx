import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    brand: 'bg-indigo-50 text-brand-600 border border-indigo-100/80',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    violet: 'bg-purple-50 text-purple-700 border border-purple-100',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border border-rose-100',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-lg gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold rounded-xl gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};
