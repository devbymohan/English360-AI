import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, GraduationCap, Settings } from 'lucide-react';
import { navItems } from './Sidebar';
import { cn } from '../../utils/cn';

export const MobileSidebar = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="relative w-72 bg-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">English360 AI</h2>
              <p className="text-[10px] text-slate-400">Your English Success Partner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition',
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
