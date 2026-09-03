import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.join(rootDir, 'client', 'src', 'pages');

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
        {/* Left Side */}
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

        {/* Right Side */}
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

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>

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
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
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
import { BookOpen, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
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
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Assessment Progress</h3>
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={\`flex items-center gap-3.5 p-3 rounded-2xl transition \${
                    step.active ? 'bg-brand-50 border border-brand-100 text-brand-700' : 'text-slate-600'
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
          </Card>
        </div>

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

// 5. DashboardPage.jsx
fs.writeFileSync(path.join(pagesDir, 'DashboardPage.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  CheckCircle,
  FileText,
  Sparkles,
  BookOpen,
  Edit3,
  Headphones,
  Bot,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  dashboardPlan,
  skillProgress,
  recentActivities,
  recommendedForYou,
  currentUser
} from '../data/mockData';

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/40 border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Good morning, {currentUser.name}! 👋
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Let's learn something new today and improve your English.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              {currentUser.levelLabel}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700">Your English Level Progress</span>
              <span className="font-extrabold text-brand-600">{currentUser.levelProgress}%</span>
            </div>
            <ProgressBar value={currentUser.levelProgress} color="bg-brand-600" height="h-2.5" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>You're 24% away from {currentUser.nextLevel}</span>
              <Link to="/progress" className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1">
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-7 h-7 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{currentUser.streakDays} Day Streak</h3>
              <p className="text-xs text-slate-400">Keep it up! Consistency is the key.</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const active = i < 5;
              const inProgress = i === 5;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-400">{day}</span>
                  <div
                    className={\`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold \${
                      active
                        ? 'bg-emerald-500 text-white'
                        : inProgress
                        ? 'border-2 border-orange-400 text-orange-500'
                        : 'bg-slate-100 text-slate-300'
                    }\`}
                  >
                    {active ? <CheckCircle className="w-3.5 h-3.5" /> : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Today's Plan</h3>
          <Link to="/progress" className="text-xs font-bold text-brand-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardPlan.map((plan) => {
            const icons = {
              FileText: FileText,
              Sparkles: Sparkles,
              BookOpen: BookOpen,
              Edit3: Edit3,
              Headphones: Headphones
            };
            const Icon = icons[plan.icon] || BookOpen;
            const isContinue = plan.status === 'continue';

            return (
              <Card key={plan.id} className="p-4 flex flex-col justify-between space-y-4 hover:shadow-soft transition">
                <div className="flex items-center justify-between">
                  <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${
                    plan.id === 'grammar' ? 'bg-emerald-50 text-emerald-600' :
                    plan.id === 'vocabulary' ? 'bg-purple-50 text-purple-600' :
                    plan.id === 'reading' ? 'bg-blue-50 text-blue-600' :
                    plan.id === 'writing' ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }\`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{plan.time}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">{plan.title}</h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{plan.progress}</p>
                </div>

                <Link to={\`/\${plan.id}\`} className="w-full">
                  <Button
                    size="sm"
                    variant={isContinue ? 'success' : 'secondary'}
                    className="w-full text-xs font-bold py-2 rounded-xl"
                  >
                    {isContinue ? 'Continue ▶' : 'Start ▶'}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Overall Progress</h3>
            <span className="text-xs text-slate-400">This Week</span>
          </div>

          <div className="space-y-3 pt-2">
            {skillProgress.map((skill) => (
              <div key={skill.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{skill.score}%</span>
                    <span className="text-[10px] text-slate-400 font-medium">({skill.status})</span>
                  </div>
                </div>
                <ProgressBar value={skill.score} color={skill.color} height="h-2" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4">
            <ProgressCircle value={76} size={64} strokeWidth={6} color="#4F46E5" />
            <div>
              <h5 className="text-sm font-bold text-slate-800">Good Progress!</h5>
              <p className="text-xs text-slate-400">Keep learning consistently.</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <Link to="/progress" className="text-xs font-bold text-brand-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentActivities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={\`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 \${act.iconColor}\`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{act.subtitle}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-600 block">{act.score}</span>
                  <span className="text-[10px] text-slate-400">{act.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Coach</h4>
            </div>
            <Link to="/ai-coach" className="text-xs text-brand-600 hover:underline font-bold">
              Open Coach →
            </Link>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-indigo-100/60 space-y-2">
            <p className="text-xs font-bold text-slate-800">Good job, Arjun! 👏</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your reading score improved by 8% this week. Focus more on vocabulary and writing to level up faster.
            </p>
          </div>

          <Link to="/ai-coach" className="w-full">
            <Button size="sm" className="w-full rounded-xl">
              Chat with AI Coach →
            </Button>
          </Link>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedForYou.map((rec) => (
            <Card key={rec.id} className="p-4 flex items-center justify-between gap-3 hover:shadow-soft transition">
              <div className="flex items-center gap-3">
                <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center \${rec.color}\`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400">{rec.subtitle}</p>
                </div>
              </div>
              <Link to={rec.route}>
                <Button size="sm" variant="secondary" className="text-xs font-bold rounded-xl px-3 py-1.5">
                  Start
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
`);

// 6. GrammarPage.jsx
fs.writeFileSync(path.join(pagesDir, 'GrammarPage.jsx'), `import React, { useState } from 'react';
import { BookOpen, CheckCircle, Lock, Lightbulb, Download, Flame, Bot } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { grammarLessonData } from '../data/mockData';

export const GrammarPage = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [selectedAnswer, setSelectedAnswer] = useState('B');

  const tabs = [
    { id: 'practice', label: 'Practice' },
    { id: 'quiz', label: 'Quiz' },
    { id: 'fill', label: 'Fill in the Blanks' },
    { id: 'error', label: 'Error Correction' },
    { id: 'transform', label: 'Sentence Transformation' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/50 border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Dashboard &gt; Grammar &gt; Tenses &gt; Present Perfect
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">{grammarLessonData.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              {grammarLessonData.description}
            </p>
            <Button size="sm" variant="outline" className="rounded-xl mt-2">
              <BookOpen className="w-4 h-4 mr-1.5 text-brand-600" /> View Full Explanation
            </Button>
          </div>

          <div className="lg:col-span-5 bg-white/90 p-4 rounded-2xl border border-indigo-100/60 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Examples</h4>
            <ul className="text-xs text-slate-600 space-y-1.5">
              {grammarLessonData.examples.map((ex, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{ex.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap \${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }\`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Grammar Topics</h3>
            <span className="text-xs text-slate-400">Level B1</span>
          </div>

          <div className="space-y-2">
            {grammarLessonData.topicsList.map((topic) => (
              <div key={topic.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <div
                  className={\`flex items-center justify-between p-3 text-xs font-bold \${
                    topic.active ? 'bg-brand-50 text-brand-700' : 'bg-slate-50/60 text-slate-700'
                  }\`}
                >
                  <div className="flex items-center gap-2">
                    <span>{topic.id}.</span>
                    <span>{topic.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">{topic.progress}</span>
                    {topic.completed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    {topic.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </div>

                {topic.subtopics && (
                  <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                    {topic.subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        className={\`flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg \${
                          sub.current ? 'bg-brand-50 font-bold text-brand-700' : 'text-slate-600'
                        }\`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                          <span>{sub.title}</span>
                        </div>
                        {sub.completed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <span className="text-slate-400">{sub.progress}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download Notes
          </Button>
        </Card>

        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400">
              Question {grammarLessonData.currentQuestion.questionNumber} of {grammarLessonData.currentQuestion.totalQuestions}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              ⏱ {grammarLessonData.currentQuestion.time}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {grammarLessonData.currentQuestion.prompt}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {grammarLessonData.currentQuestion.sentence}
            </h3>

            <div className="space-y-2.5">
              {grammarLessonData.currentQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedAnswer(opt.id)}
                  className={\`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition text-xs font-bold \${
                    selectedAnswer === opt.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {selectedAnswer === opt.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </label>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Explanation:</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {grammarLessonData.currentQuestion.explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">Next Question →</Button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Progress</h4>
            <div className="flex justify-center py-2">
              <ProgressCircle value={60} size={84} strokeWidth={8} color="#10B981">
                <span className="text-base font-extrabold text-slate-900">60%</span>
              </ProgressCircle>
            </div>
            <p className="text-xs text-slate-500">6 of 10 lessons completed</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">Grammar Streak</h5>
                <p className="text-xs font-extrabold text-orange-500">12 Days Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-600" />
              <h5 className="text-xs font-bold text-slate-800">Need Help?</h5>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ask our AI Coach anytime if you get stuck with rules or examples.
            </p>
            <Button size="sm" variant="secondary" className="w-full text-xs font-bold rounded-xl">
              Chat Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

// 7. VocabularyPage.jsx
fs.writeFileSync(path.join(pagesDir, 'VocabularyPage.jsx'), `import React, { useState } from 'react';
import { Volume2, Bookmark, CheckCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { vocabularyData } from '../data/mockData';

export const VocabularyPage = () => {
  const [selectedWord, setSelectedWord] = useState(vocabularyData.todayWords[0]);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState('B');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 bg-gradient-to-r from-white via-purple-50/40 to-indigo-50/40 border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Dashboard &gt; Vocabulary &gt; Daily Words
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Learn new words every day and build your vocabulary.
            </h2>
            <p className="text-xs text-slate-500 mt-1">Consistency is the key!</p>
          </div>
          <div className="pt-4">
            <Button size="sm" className="rounded-xl">Start Practice →</Button>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 flex items-center justify-between gap-4">
          <ProgressCircle value={30} size={80} strokeWidth={8} color="#8B5CF6">
            <span className="text-xs font-extrabold text-slate-900">6/20</span>
          </ProgressCircle>
          <div className="text-right text-xs space-y-1">
            <h4 className="font-bold text-slate-900">Today's Goal</h4>
            <p className="text-slate-400">New Words: <span className="font-bold text-slate-800">10</span></p>
            <p className="text-slate-400">Reviewed: <span className="font-bold text-slate-800">6</span></p>
            <p className="text-slate-400">Mastered: <span className="font-bold text-slate-800">2</span></p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Today's Words (10)</h3>
            <span className="text-xs text-brand-600 font-bold cursor-pointer">Filter</span>
          </div>

          <div className="space-y-2">
            {vocabularyData.todayWords.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedWord(item)}
                className={\`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition text-xs \${
                  selectedWord.id === item.id
                    ? 'border-purple-400 bg-purple-50 text-purple-900 font-bold'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{item.id}</span>
                  <div>
                    <p className="font-bold">{item.word}</p>
                    <p className="text-[10px] text-slate-400">{item.meaning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 hover:text-slate-700" />
                  <Bookmark className={\`w-3.5 h-3.5 \${item.bookmarked ? 'fill-purple-600 text-purple-600' : ''}\`} />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
            View All Words →
          </Button>
        </Card>

        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">{vocabularyData.activeWord.word}</h2>
                <button className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{vocabularyData.activeWord.phonetic}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              {vocabularyData.activeWord.tag}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-500">Meaning:</span>
              <p className="text-slate-800 mt-0.5">{vocabularyData.activeWord.meaning}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500">Example:</span>
              <p className="text-slate-800 italic mt-0.5">"{vocabularyData.activeWord.example}"</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-1.5">Synonyms:</span>
              <div className="flex flex-wrap gap-1.5">
                {vocabularyData.activeWord.synonyms.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-500 block mb-1.5">Antonyms:</span>
              <div className="flex flex-wrap gap-1.5">
                {vocabularyData.activeWord.antonyms.map((a) => (
                  <span key={a} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold text-[11px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">
              {vocabularyData.activeWord.practiceQuestion.prompt}
            </h4>
            <div className="space-y-2">
              {vocabularyData.activeWord.practiceQuestion.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedPracticeOption(opt.id)}
                  className={\`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer \${
                    selectedPracticeOption === opt.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }\`}
                >
                  <span>{opt.id}. {opt.text}</span>
                  {selectedPracticeOption === opt.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">Next Word →</Button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Your Vocabulary Progress</h4>
            <div className="flex justify-center py-1">
              <ProgressCircle value={vocabularyData.stats.progress} size={80} strokeWidth={8} color="#8B5CF6" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsLearned}</p>
                <p>Learned</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsReviewed}</p>
                <p>Reviewed</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">{vocabularyData.stats.wordsMastered}</p>
                <p>Mastered</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Quick Quiz</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Test your knowledge with 5 quick vocabulary questions.
            </p>
            <Button size="sm" className="w-full text-xs font-bold rounded-xl">
              Start Quiz
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Pages part 1 generated successfully.');
