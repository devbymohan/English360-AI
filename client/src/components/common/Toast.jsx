import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Toast = ({
  message,
  type = 'info',
  onClose,
  className = '',
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-brand-500" />,
  };

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-elevated border border-slate-100 text-sm font-medium text-slate-800', className)}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
