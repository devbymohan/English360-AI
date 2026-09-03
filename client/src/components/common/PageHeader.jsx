import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { cn } from '../../utils/cn';

export const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col gap-2 mb-6', className)}>
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
