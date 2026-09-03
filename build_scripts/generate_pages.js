import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// 1. LandingPage.jsx
fs.writeFileSync(path.join(pagesDir, 'LandingPage.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  BookOpen,
  FileText,
  Edit3,
  Headphones,
  ClipboardList,
  Users,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Bot
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  return (
    <div className="flex flex-col gap-16 py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-brand-600 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered English Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Improve Your English. <br />
            Every Skill. <span className="text-brand-600">One Platform.</span>
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-lg">
            Learn Grammar, Vocabulary, Reading, Writing, Listening and more — all in one place with your personal AI coach.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="rounded-full px-8 shadow-md">
                Start Learning Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-6">
              <Play className="w-4 h-4 mr-2 text-brand-600 fill-brand-600" /> Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div className="flex -space-x-2">
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="student" />
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="student" />
              <img className="w-9 h-9 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="student" />
            </div>
            <div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Join 10,000+ students improving every day
              </p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup Card */}
        <div className="lg:col-span-6 relative">
          <div className="bg-gradient-to-tr from-brand-600/10 to-indigo-500/5 rounded-3xl p-6 sm:p-8 border border-indigo-100/60 shadow-xl relative overflow-hidden">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Welcome back, Student! 👋</h3>
                  <p className="text-[11px] text-slate-400">Let's continue your learning journey.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">B1 Level</span>
              </div>

              {/* Progress meters row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                  <p className="text-[10px] font-bold text-slate-400">Grammar</p>
                  <p className="text-base font-extrabold text-emerald-600">82%</p>
                </div>
                <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/60">
                  <p className="text-[10px] font-bold text-slate-400">Vocabulary</p>
                  <p className="text-base font-extrabold text-purple-600">68%</p>
                </div>
                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                  <p className="text-[10px] font-bold text-slate-400">Reading</p>
                  <p className="text-base font-extrabold text-blue-600">84%</p>
                </div>
              </div>

              {/* AI Coach Callout */}
              <div className="flex items-center gap-3 bg-brand-50 p-3 rounded-xl border border-brand-100">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-800">Your AI Coach</h5>
                  <p className="text-[11px] text-slate-500">I will guide you and help you improve every day.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="space-y-8 text-center pt-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Features</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Everything You Need to Master English
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { title: 'Grammar', desc: 'Learn rules and practice with AI-generated exercises.', icon: FileText, color: 'bg-indigo-50 text-brand-600' },
            { title: 'Vocabulary', desc: 'Build your word power with daily words, quizzes and games.', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600' },
            { title: 'Reading', desc: 'Read engaging passages and answer comprehension questions.', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { title: 'Writing', desc: 'Write better with AI feedback on grammar, clarity and style.', icon: Edit3, color: 'bg-amber-50 text-amber-600' },
            { title: 'Listening', desc: 'Improve listening skills with audio lessons and exercises.', icon: Headphones, color: 'bg-rose-50 text-rose-600' },
            { title: 'Tests', desc: 'Take full mock tests and track your overall performance.', icon: ClipboardList, color: 'bg-cyan-50 text-cyan-600' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:shadow-soft transition-all space-y-3">
                <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center \${item.color}\`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { number: '10,000+', label: 'Happy Students', icon: Users, color: 'text-brand-600' },
          { number: '50,000+', label: 'Tests Completed', icon: CheckCircle, color: 'text-blue-600' },
          { number: '1M+', label: 'Questions Practiced', icon: BookOpen, color: 'text-emerald-600' },
          { number: '92%', label: 'Improvement Rate', icon: TrendingUp, color: 'text-purple-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex flex-col items-center space-y-1">
              <Icon className={\`w-6 h-6 mb-1 \${stat.color}\`} />
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.number}</h3>
              <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="text-center py-6 space-y-6">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Students Love English360 AI</span>
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-card">
          <p className="text-base sm:text-lg text-slate-700 italic font-medium leading-relaxed mb-6">
            “English360 AI has helped me improve my grammar, vocabulary and reading skills so much. The AI feedback is amazing and easy to understand!”
          </p>
          <div className="flex items-center justify-center gap-3">
            <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Riya" />
            <div className="text-left">
              <h5 className="text-sm font-bold text-slate-900">Riya Sharma</h5>
              <p className="text-xs text-slate-400">B1 Level Student</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white text-center shadow-elevated space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to improve your English?</h2>
        <p className="text-indigo-100 text-sm max-w-md mx-auto">
          Join thousands of students and start your learning journey today.
        </p>
        <div className="pt-2">
          <Link to="/register">
            <Button size="lg" className="rounded-full bg-white text-brand-600 hover:bg-indigo-50 font-bold px-8 shadow-md">
              Get Started For Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
`);

// 2. LoginPage.jsx
fs.writeFileSync(path.join(pagesDir, 'LoginPage.jsx'), `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('arjun@english360.ai');
  const [password, setPassword] = useState('password123');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-100 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Value Props & Illustration */}
        <div className="bg-gradient-to-br from-brand-50/70 via-indigo-50/40 to-purple-50/70 p-8 flex flex-col justify-between border-r border-slate-100">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">English360 AI</h3>
                <p className="text-[10px] text-slate-400">Your Personal English Coach</p>
              </div>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Start your journey to <span className="text-brand-600">better English</span>
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Learn, practice and improve Grammar, Vocabulary, Reading, Writing and Listening — all in one place with AI.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: 'Personalized Learning', desc: 'AI adapts to your level and progress', icon: Sparkles },
                { title: 'All-in-One Platform', desc: 'Everything you need to improve your English', icon: BookOpen },
                { title: 'Track & Grow', desc: 'Monitor your progress and achieve your goals', icon: TrendingUp },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-start gap-3 bg-white/80 p-3 rounded-2xl border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{feature.title}</h5>
                      <p className="text-[11px] text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Your data is safe and secure with us.</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-right text-xs text-slate-500 mb-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900">Welcome back! 👋</h3>
            <p className="text-xs text-slate-400 mt-1">Login to continue your learning journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-xl" loading={loading}>
              Login →
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>

          {/* Social OAuth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

// 3. RegisterPage.jsx
fs.writeFileSync(path.join(pagesDir, 'RegisterPage.jsx'), `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('B1');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(name, email, password);
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-elevated p-8 sm:p-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm mx-auto mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Start your AI-powered English journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Estimated English Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            options={[
              { value: 'A1', label: 'A1 - Beginner' },
              { value: 'A2', label: 'A2 - Elementary' },
              { value: 'B1', label: 'B1 - Intermediate (Recommended)' },
              { value: 'B2', label: 'B2 - Upper Intermediate' },
              { value: 'C1', label: 'C1 - Advanced' },
            ]}
          />

          <Button type="submit" size="lg" className="w-full rounded-xl mt-2" loading={loading}>
            Create Account & Take Assessment →
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
`);

// 4. AssessmentPage.jsx
fs.writeFileSync(path.join(pagesDir, 'AssessmentPage.jsx'), `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ShieldCheck, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const AssessmentPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('B');

  const steps = [
    { number: 1, title: 'Grammar', count: '10 Questions', completed: true },
    { number: 2, title: 'Vocabulary', count: '10 Questions', completed: true },
    { number: 3, title: 'Reading', count: '10 Questions', active: true },
    { number: 4, title: 'Writing', count: '1 Task' },
    { number: 5, title: 'Listening', count: '10 Questions' },
    { number: 6, title: 'Results', count: 'See Your Level' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Initial Assessment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Let's find your current English level so we can personalize your learning journey.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Step 3 of 6
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Progress Stepper */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Assessment Progress</h3>
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={\`flex items-center gap-3.5 p-3 rounded-2xl transition \${
                    step.active
                      ? 'bg-brand-50 border border-brand-100 text-brand-700'
                      : 'text-slate-600'
                  }\`}
                >
                  <div
                    className={\`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs \${
                      step.completed
                        ? 'bg-emerald-500 text-white'
                        : step.active
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }\`}
                  >
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{step.title}</h5>
                    <p className="text-[11px] text-slate-400">{step.count}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/60">
              <h5 className="text-xs font-bold text-brand-700 mb-1">Why this assessment?</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This short diagnostic test helps us identify your strengths and areas for improvement to create a customized study plan.
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Reading Comprehension Task */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Reading Comprehension</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>12:45</span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">The Power of Reading</h4>
              <p>
                Reading is one of the most valuable habits anyone can develop. It not only improves knowledge but also enhances imagination and critical thinking. When we read, we are exposed to new ideas, cultures, and perspectives. Studies have shown that people who read regularly have better vocabulary, stronger writing skills, and improved focus. In today's digital age, reading helps us slow down, reduce stress, and understand the world in a deeper way.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                1. What is the main idea of the passage?
              </h4>
              <div className="space-y-2.5">
                {[
                  { id: 'A', text: 'Reading is difficult but important.' },
                  { id: 'B', text: 'Reading helps improve many skills and personal growth.' },
                  { id: 'C', text: 'People prefer digital content over reading.' },
                  { id: 'D', text: 'Reading is only useful for students.' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={\`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition text-xs font-semibold \${
                      selectedOption === opt.id
                        ? 'border-brand-500 bg-brand-50/60 text-brand-900 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }\`}
                  >
                    <div className={\`w-5 h-5 rounded-full border flex items-center justify-center \${
                      selectedOption === opt.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                    }\`}>
                      {selectedOption === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                    <span>{opt.id}. {opt.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm">Previous</Button>
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Generated Landing, Auth, Assessment pages.');
`);

console.log('Pages part 1 generated.');
