import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const commonDir = path.join(rootDir, 'client', 'src', 'components', 'common');

if (!fs.existsSync(commonDir)) {
  fs.mkdirSync(commonDir, { recursive: true });
}

// 1. Button.jsx
fs.writeFileSync(path.join(commonDir, 'Button.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500',
    secondary: 'bg-indigo-50 hover:bg-indigo-100 text-brand-600 focus:ring-brand-400',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-400',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-400',
    gradient: 'bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white shadow-md focus:ring-brand-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-3.5 text-lg gap-3',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
};
`);

// 2. Input.jsx
fs.writeFileSync(path.join(commonDir, 'Input.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition duration-150',
            Icon && 'pl-10',
            rightElement && 'pr-10',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
`);

// 3. Select.jsx
fs.writeFileSync(path.join(commonDir, 'Select.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={cn(
            'w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition duration-150 pr-9',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};
`);

// 4. Modal.jsx
fs.writeFileSync(path.join(commonDir, 'Modal.jsx'), `import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className = ''
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-3xl shadow-elevated w-full p-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100',
        maxWidth,
        className
      )}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
`);

// 5. Card.jsx
fs.writeFileSync(path.join(commonDir, 'Card.jsx'), `import React from 'react';
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
`);

// 6. Badge.jsx
fs.writeFileSync(path.join(commonDir, 'Badge.jsx'), `import React from 'react';
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
`);

// 7. ProgressBar.jsx
fs.writeFileSync(path.join(commonDir, 'ProgressBar.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'bg-brand-600',
  trackColor = 'bg-slate-100',
  height = 'h-2',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full rounded-full overflow-hidden', trackColor, height, className)}>
      <div
        className={cn('h-full transition-all duration-500 rounded-full', color)}
        style={{ width: \`\${percentage}%\` }}
      />
    </div>
  );
};
`);

// 8. ProgressCircle.jsx
fs.writeFileSync(path.join(commonDir, 'ProgressCircle.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressCircle = ({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = '#4F46E5',
  trackColor = '#EEF2F6',
  children,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children || <span className="text-sm font-bold text-slate-800">{Math.round(percentage)}%</span>}
      </div>
    </div>
  );
};
`);

// 9. StatCard.jsx
fs.writeFileSync(path.join(commonDir, 'StatCard.jsx'), `import React from 'react';
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
`);

// 10. PageHeader.jsx
fs.writeFileSync(path.join(commonDir, 'PageHeader.jsx'), `import React from 'react';
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
`);

// 11. Breadcrumb.jsx
fs.writeFileSync(path.join(commonDir, 'Breadcrumb.jsx'), `import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-brand-600 transition">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-brand-600' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
`);

// 12. Avatar.jsx
fs.writeFileSync(path.join(commonDir, 'Avatar.jsx'), `import React from 'react';
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
`);

// 13. Dropdown.jsx
fs.writeFileSync(path.join(commonDir, 'Dropdown.jsx'), `import React, { useState, useRef, useEffect } from 'react';
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
`);

// 14. Toast.jsx
fs.writeFileSync(path.join(commonDir, 'Toast.jsx'), `import React from 'react';
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
`);

// 15. LoadingSpinner.jsx
fs.writeFileSync(path.join(commonDir, 'LoadingSpinner.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className={cn('border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin', sizes[size])} />
    </div>
  );
};
`);

// 16. Skeleton.jsx
fs.writeFileSync(path.join(commonDir, 'Skeleton.jsx'), `import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({ className = '' }) => {
  return <div className={cn('bg-slate-200/70 animate-pulse rounded-xl', className)} />;
};
`);

// 17. EmptyState.jsx
fs.writeFileSync(path.join(commonDir, 'EmptyState.jsx'), `import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-100">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
};
`);

// 18. ErrorState.jsx
fs.writeFileSync(path.join(commonDir, 'ErrorState.jsx'), `import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 rounded-2xl border border-rose-100">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  );
};
`);

// 19. ConfirmDialog.jsx
fs.writeFileSync(path.join(commonDir, 'ConfirmDialog.jsx'), `import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-slate-600 mb-6">{description}</p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
`);

console.log('Generated all 19 reusable common components successfully.');
