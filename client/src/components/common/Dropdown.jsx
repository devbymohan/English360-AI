import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div className={cn(
          'absolute mt-2 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 min-w-[180px] animate-in fade-in zoom-in-95',
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}>
          {children}
        </div>
      )}
    </div>
  );
};
