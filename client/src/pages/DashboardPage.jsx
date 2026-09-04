import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/progressService';
import { aiCoachService } from '../services/aiCoachService';

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
};

export const DashboardPage = () => {
  const { user, updateUserState } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [summary, recs] = await Promise.allSettled([
        progressService.getDashboard(),
        aiCoachService.getRecommendations(),
      ]);

      if (summary.status === 'fulfilled' && summary.value) {
        setDashboardData(summary.value);
        if (updateUserState) {
          updateUserState({
            ...(summary.value.user || {}),
            level: summary.value.user?.englishLevel || user?.level,
            streak: summary.value.streak ?? summary.value.user?.streak ?? 0,
          });
        }
      }
      if (recs.status === 'fulfilled' && recs.value?.recommendations) {
        setRecommendations(recs.value.recommendations);
      }
    } catch (e) {
      console.warn('[DashboardPage] Load notice:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const studentName =
    dashboardData?.user?.name ||
    user?.name ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Student';

  const englishLevel = dashboardData?.user?.englishLevel || user?.level || user?.englishLevel || 'Not Assessed';

  const isAssessed = Boolean(
    dashboardData?.user?.assessmentCompleted ||
    user?.assessmentCompleted ||
    (englishLevel && englishLevel !== 'Not Assessed')
  );
  const streak = dashboardData?.streak ?? user?.streak ?? 0;
  const overallScore = dashboardData?.user?.overallScore || user?.overallScore || 0;
  const activities = dashboardData?.recentActivities || [];
  const greeting = getTimeBasedGreeting();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Onboarding Notice if not assessed */}
      {!isAssessed && (
        <Card className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Complete your diagnostic assessment
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Take the 5-skill assessment to determine your starting CEFR level (A1–C2).
              </p>
            </div>
          </div>
          <Link to="/assessment" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" className="rounded-xl shadow-sm w-full sm:w-auto">
              Take Assessment →
            </Button>
          </Link>
        </Card>
      )}

      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Card className="lg:col-span-8 p-4 sm:p-6 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/40 border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {greeting}, {studentName}! 👋
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Let's practice English and continue building your skills today.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto ${
                isAssessed ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAssessed ? 'bg-brand-600' : 'bg-slate-400'
                }`}
              ></span>
              {isAssessed ? `${englishLevel} Level` : 'Level: Not Assessed'}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-700">English Proficiency Accuracy</span>
              <span className="font-extrabold text-brand-600">{overallScore}%</span>
            </div>
            <ProgressBar value={overallScore} color="bg-brand-600" height="h-2.5" />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{isAssessed ? 'Adaptive level tracking active' : 'Complete assessment to calculate level'}</span>
              <Link
                to="/progress"
                className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
              >
                View Detailed Analytics <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-7 h-7 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{streak} Day Streak</h3>
              <p className="text-xs text-slate-400">
                {streak > 0
                  ? 'Keep it up! Consistency builds fluency.'
                  : 'Complete an activity today to start your streak!'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Daily Goal Target</span>
            <span className="font-bold text-slate-800">15 Mins / Day</span>
          </div>
        </Card>
      </div>

      {/* Core Learning Modules Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Core Learning Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Grammar',
              desc: 'Tenses, rules & syntax',
              route: '/grammar',
              icon: BookOpen,
              color: 'bg-indigo-50 text-indigo-600',
            },
            {
              title: 'Vocabulary',
              desc: 'Flashcards & word mastery',
              route: '/vocabulary',
              icon: Sparkles,
              color: 'bg-purple-50 text-purple-600',
            },
            {
              title: 'Reading',
              desc: 'Passages, speed & WPM',
              route: '/reading',
              icon: FileText,
              color: 'bg-blue-50 text-blue-600',
            },
            {
              title: 'Listening',
              desc: 'Spoken dialogue & audio',
              route: '/listening',
              icon: Headphones,
              color: 'bg-rose-50 text-rose-600',
            },
          ].map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link key={i} to={mod.route}>
                <Card className="p-5 hover:shadow-soft hover:border-brand-200 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl ${mod.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{mod.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & AI Coach Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Learning Activities</h3>
            <Link to="/progress" className="text-xs font-bold text-brand-600 hover:underline">
              See all
            </Link>
          </div>

          {activities.length === 0 ? (
            <Card className="p-8 text-center space-y-2 bg-white">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">No activities recorded yet</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Complete your first Grammar, Vocabulary, Reading, Writing, or Listening lesson to see your history here.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {activities.map((act, i) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{act.title}</h5>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                      {act.type} • {act.timeAgo}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {act.score}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: AI Coach Card */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">AI Learning Coach</h3>
          <Card className="p-6 bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-white border border-indigo-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need Guidance?</h4>
                <p className="text-xs text-slate-500">Ask your AI Coach anything anytime.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Hi {studentName}! I can help you clarify difficult grammar rules, practice vocabulary words, and give feedback on your writing."
            </p>
            <Link to="/ai-coach" className="block">
              <Button size="sm" className="w-full rounded-xl">
                Chat with AI Coach →
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
