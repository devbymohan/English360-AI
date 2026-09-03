import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  FileText,
  Edit3,
  Headphones,
  ClipboardList,
  AlertCircle,
  Bot,
  BarChart2,
  Trophy,
  Settings,
  Crown,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Grammar', path: '/grammar', icon: BookOpen },
  { name: 'Vocabulary', path: '/vocabulary', icon: Sparkles },
  { name: 'Reading', path: '/reading', icon: FileText },
  { name: 'Writing', path: '/writing', icon: Edit3 },
  { name: 'Listening', path: '/listening', icon: Headphones },
  { name: 'Tests', path: '/tests', icon: ClipboardList },
  { name: 'My Mistakes', path: '/my-mistakes', icon: AlertCircle },
  { name: 'AI Coach', path: '/ai-coach', icon: Bot },
  { name: 'Progress', path: '/progress', icon: BarChart2 },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
];

export const Sidebar = ({ className = '' }) => {
  return (
    <aside className={cn('w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30', className)}>
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
            English360 AI
          </h2>
          <p className="text-[11px] font-medium text-slate-400">
            Your English Success Partner
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm shadow-brand-100/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  <span className="flex-1">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section: Premium Card & Settings */}
      <div className="p-4 pt-2 space-y-3">
        {/* Go Premium Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/40 border border-indigo-100/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Go Premium</h4>
          </div>
          <ul className="text-[11px] text-slate-500 space-y-1 mb-3">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-brand-500"></span>
              Unlimited practice & tests
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-brand-500"></span>
              Full AI feedback & reports
            </li>
          </ul>
          <button className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm">
            Upgrade Now →
          </button>
        </div>

        {/* Settings Link */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
              isActive
                ? 'bg-brand-50 text-brand-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={cn('w-5 h-5', isActive ? 'text-brand-600' : 'text-slate-400')} />
              <span>Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
