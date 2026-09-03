import React from 'react';
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
    <div className="flex flex-col gap-10 sm:gap-16 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 sm:pt-6">
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-brand-600 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered English Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Improve Your English. <br />
            Every Skill. <span className="text-brand-600">One Platform.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
            Learn Grammar, Vocabulary, Reading, Writing, Listening and more — all in one place with your personal AI coach.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 shadow-md w-full sm:w-auto">
                Start Learning Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-6 w-full sm:w-auto">
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
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
              <Icon className={`w-6 h-6 mb-1 ${stat.color}`} />
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
