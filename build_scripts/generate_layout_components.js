import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const layoutDir = path.join(rootDir, 'client', 'src', 'components', 'layout');
const layoutsDir = path.join(rootDir, 'client', 'src', 'layouts');

[layoutDir, layoutsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 1. Sidebar.jsx
fs.writeFileSync(path.join(layoutDir, 'Sidebar.jsx'), `import React from 'react';
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
`);

// 2. Header.jsx
fs.writeFileSync(path.join(layoutDir, 'Header.jsx'), `import React from 'react';
import { Flame, Bell, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Dropdown } from '../common/Dropdown';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenMobileMenu }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-transparent px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger */}
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block">
        {/* Can host page-specific breadcrumbs or greetings */}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5 ml-auto">
        {/* Streak Badge */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">
            {currentUser?.streak || 12} <span className="font-semibold text-slate-500 text-[11px]">Day Streak</span>
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>
        </div>

        {/* User Profile */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition">
              <Avatar src={currentUser?.avatar} fallback="A" size="sm" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || 'Arjun'}</p>
                <p className="text-[10px] font-semibold text-slate-400">{currentUser?.level || 'B1'} Level</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          }
        >
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={() => navigate('/progress')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            My Progress
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Account Settings
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            Sign Out
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
`);

// 3. MobileSidebar.jsx
fs.writeFileSync(path.join(layoutDir, 'MobileSidebar.jsx'), `import React from 'react';
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
`);

// 4. AppLayout.jsx
fs.writeFileSync(path.join(layoutDir, 'AppLayout.jsx'), `import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Drawer */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 sm:px-8 pb-12 pt-2 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
`);

// 5. PublicLayout.jsx
fs.writeFileSync(path.join(layoutDir, 'PublicLayout.jsx'), `import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '../common/Button';

export const PublicLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Public Navbar (Shown on landing and general public pages) */}
      {!isAuthPage && (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              English360 AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="text-brand-600">Home</Link>
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">How It Works</a>
            <a href="#testimonials" className="hover:text-slate-900 transition">Testimonials</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full px-5">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </header>
      )}

      {/* Main View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Public Footer */}
      {!isAuthPage && (
        <footer className="bg-white border-t border-slate-100 py-12 px-6 sm:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-slate-900">English360 AI</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your all-in-one AI English learning platform designed to master grammar, vocabulary, reading, writing, and listening.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Platform</h5>
              <ul className="text-xs text-slate-500 space-y-2">
                <li><Link to="/grammar" className="hover:text-brand-600">Grammar Practice</Link></li>
                <li><Link to="/vocabulary" className="hover:text-brand-600">Vocabulary Builder</Link></li>
                <li><Link to="/reading" className="hover:text-brand-600">Reading Comprehension</Link></li>
                <li><Link to="/writing" className="hover:text-brand-600">Writing Evaluator</Link></li>
                <li><Link to="/listening" className="hover:text-brand-600">Listening Lessons</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resources</h5>
              <ul className="text-xs text-slate-500 space-y-2">
                <li><a href="#" className="hover:text-brand-600">Study Tips</a></li>
                <li><a href="#" className="hover:text-brand-600">Grammar Rules Guide</a></li>
                <li><a href="#" className="hover:text-brand-600">Level Assessment</a></li>
                <li><a href="#" className="hover:text-brand-600">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal</h5>
              <ul className="text-xs text-slate-500 space-y-2">
                <li><a href="#" className="hover:text-brand-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-600">Cookie Settings</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <p>© {new Date().getFullYear()} English360 AI. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Designed for student success.</p>
          </div>
        </footer>
      )}
    </div>
  );
};
`);

// Re-exports in src/layouts/
fs.writeFileSync(path.join(layoutsDir, 'AppLayout.jsx'), `export { AppLayout } from '../components/layout/AppLayout';\n`);
fs.writeFileSync(path.join(layoutsDir, 'PublicLayout.jsx'), `export { PublicLayout } from '../components/layout/PublicLayout';\n`);

console.log('Layout components generated successfully.');
