import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-3xl shadow-elevated w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100',
        maxWidth,
        className
      )}>
        <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 sticky top-0 bg-white z-10 -mt-1 pt-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
