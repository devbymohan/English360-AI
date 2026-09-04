import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, googleLogin, resetPassword, user, redirectError, clearRedirectError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-navigate when user is authenticated (including after mobile redirect returns)
  useEffect(() => {
    if (user) {
      const target =
        location.state?.from?.pathname && location.state.from.pathname !== '/assessment'
          ? location.state.from.pathname
          : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Capture any mobile redirect error
  useEffect(() => {
    if (redirectError) {
      setError(redirectError);
    }
  }, [redirectError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Already registered users logging in go directly to Dashboard
      const target =
        location.state?.from?.pathname && location.state.from.pathname !== '/assessment'
          ? location.state.from.pathname
          : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
      // Already registered users logging in via Google go directly to Dashboard
      const target =
        location.state?.from?.pathname && location.state.from.pathname !== '/assessment'
          ? location.state.from.pathname
          : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetErrorMsg('');
    setResetSuccessMsg('');

    if (!resetEmail.trim()) {
      setResetErrorMsg('Please enter your email address.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetPassword(resetEmail.trim());
      setResetSuccessMsg(res?.message || 'Password reset link has been sent to your email.');
    } catch (err) {
      setResetErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-100 shadow-elevated overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Value Props */}
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
              Start your journey to <span className="text-brand-600">better English</span>
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Learn, practice and improve Grammar, Vocabulary, Reading, Writing and Listening — all in one place with AI.
            </p>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
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

          <div className="mt-6 sm:mt-8 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Your data is safe and secure with us.</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
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

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetErrorMsg('');
                  setResetSuccessMsg('');
                  setIsForgotModalOpen(true);
                }}
                className="font-semibold text-brand-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl"
              loading={loading}
              disabled={loading}
            >
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
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your registered email address below, and we'll send you instructions to reset your password.
          </p>

          {resetSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {resetErrorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{resetErrorMsg}</span>
            </div>
          )}

          {!resetSuccessMsg && (
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={resetLoading}
              required
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              {resetSuccessMsg ? 'Close' : 'Cancel'}
            </Button>
            {!resetSuccessMsg && (
              <Button type="submit" size="sm" loading={resetLoading} disabled={resetLoading}>
                Send Reset Link
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
