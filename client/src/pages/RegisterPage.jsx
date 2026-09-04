import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin, user, redirectError, clearRedirectError } = useAuth();
  const navigate = useNavigate();

  // Auto-navigate when user is authenticated (including after mobile redirect returns)
  useEffect(() => {
    if (user) {
      const target = user.assessmentCompleted ? '/dashboard' : '/assessment';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  // Capture any mobile redirect error
  useEffect(() => {
    if (redirectError) {
      setError(redirectError);
    }
  }, [redirectError]);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter a password.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // New user always starts at Initial Assessment
      navigate('/assessment');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    if (clearRedirectError) clearRedirectError();
    setLoading(true);
    try {
      const res = await googleLogin();
      if (res?.redirecting) {
        // Mobile redirect in progress
        return;
      }
      const target = user?.assessmentCompleted ? '/dashboard' : '/assessment';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-100 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Marketing Panel */}
        <div className="bg-gradient-to-br from-brand-50/70 via-indigo-50/40 to-purple-50/70 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-6 sm:mb-8">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">English360 AI</h3>
                <p className="text-[10px] text-slate-400">Your Personal English Coach</p>
              </div>
            </Link>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">
              Unlock your <span className="text-brand-600">English potential</span> with AI
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Join thousands of students mastering Grammar, Vocabulary, Reading, Writing, and Listening.
            </p>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              {[
                {
                  title: 'Personalized Diagnostic',
                  desc: 'Find your true level with our adaptive assessment',
                  icon: Sparkles,
                },
                {
                  title: 'Interactive Practice',
                  desc: 'Daily exercises with instant explanations',
                  icon: BookOpen,
                },
                {
                  title: 'Real-time Analytics',
                  desc: 'Track your growth and celebrate achievements',
                  icon: TrendingUp,
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white/80 p-3 rounded-2xl border border-slate-100"
                  >
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

          <div className="mt-6 sm:mt-8 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Free forever starter plan • No credit card required.</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="text-right text-xs text-slate-500 mb-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Log in
            </Link>
          </div>

          <div className="mb-5">
            <h3 className="text-2xl font-extrabold text-slate-900">Create Account</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Start your AI-powered English journey with a clean slate
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              placeholder="e.g. Maya Johnson"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl mt-3"
              loading={loading}
              disabled={loading}
            >
              Create Account & Take Assessment →
            </Button>
          </form>

          {/* Social Sign-In */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or sign up with
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};
