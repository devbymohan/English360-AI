import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '../common/Button';

export const PublicLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-x-hidden">
      {/* Public Navbar */}
      {!isAuthPage && (
        <header className="h-16 sm:h-20 bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              English360 AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600">
            <Link to="/" className="text-brand-600 font-bold">Home</Link>
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition">How It Works</a>
            <a href="#testimonials" className="hover:text-slate-900 transition">Testimonials</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full px-4 sm:px-5">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-4 sm:px-5">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-xl text-xs px-3 py-1.5 h-8">
                Login
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* Mobile Drawer for Public Navbar */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-full bg-white shadow-xl border-b border-slate-100 p-5 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50 text-brand-600">Home</Link>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">Testimonials</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-50">FAQ</a>
            </div>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-xl">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button size="sm" className="w-full rounded-xl">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main View */}
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>

      {/* Public Footer */}
      {!isAuthPage && (
        <footer className="bg-white border-t border-slate-100 py-10 sm:py-12 px-4 sm:px-8 lg:px-12 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
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
                <li><a href="#features" className="hover:text-brand-600">Study Tips</a></li>
                <li><a href="#how-it-works" className="hover:text-brand-600">Grammar Rules Guide</a></li>
                <li><Link to="/assessment" className="hover:text-brand-600">Level Assessment</Link></li>
                <li><a href="#faq" className="hover:text-brand-600">Help Center</a></li>
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
          <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <p>© {new Date().getFullYear()} English360 AI. All rights reserved.</p>
            <p>Designed for student success across all devices.</p>
          </div>
        </footer>
      )}
    </div>
  );
};
