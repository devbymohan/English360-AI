import React from 'react';
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
