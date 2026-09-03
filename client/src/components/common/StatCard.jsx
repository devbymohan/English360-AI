import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-indigo-50 text-brand-600',
  className = '',
}) => {
  return (
    <Card className={cn('flex items-center gap-4', className)}>
      {Icon && (
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h4 className="text-xl font-extrabold text-slate-900 mt-0.5 truncate">{value}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  );
};
