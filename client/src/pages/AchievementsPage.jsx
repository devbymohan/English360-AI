import React, { useState, useEffect } from 'react';
import { Trophy, Award, Shield, Flame, Headphones, CheckCircle2, Edit3, Lock, Star, Sparkles, BookOpen } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';

export const AchievementsPage = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await progressService.getProgress();
      if (data) setProgress(data);
    } catch (e) {
      console.warn('[AchievementsPage] Progress notice:', e.message);
    }
  };

  const streak = progress?.streak ?? user?.streak ?? 0;
  const lessonsCompleted = progress?.lessonsCompleted ?? 0;
  const overallScore = progress?.overallScore ?? user?.overallScore ?? 0;
  const isAssessed = Boolean(user?.assessmentCompleted || progress?.assessmentCompleted);

  // Dynamic achievement badges based on actual student activity
  const BADGES = [
    {
      id: 'diag_1',
      title: 'Diagnostic Pioneer',
      desc: 'Complete your 5-skill initial English assessment',
      category: 'Learning',
      points: 100,
      unlocked: isAssessed,
      progress: isAssessed ? 100 : 0,
      icon: Award,
    },
    {
      id: 'first_lesson',
      title: 'First Step',
      desc: 'Complete your very first practice lesson',
      category: 'Learning',
      points: 50,
      unlocked: lessonsCompleted >= 1,
      progress: Math.min(100, (lessonsCompleted / 1) * 100),
      icon: BookOpen,
    },
    {
      id: 'five_lessons',
      title: 'Consistent Learner',
      desc: 'Complete 5 practice lessons across any skill',
      category: 'Learning',
      points: 150,
      unlocked: lessonsCompleted >= 5,
      progress: Math.min(100, (lessonsCompleted / 5) * 100),
      icon: Sparkles,
    },
    {
      id: 'streak_3',
      title: 'Momentum Builder',
      desc: 'Maintain a 3-day continuous learning streak',
      category: 'Consistency',
      points: 120,
      unlocked: streak >= 3,
      progress: Math.min(100, (streak / 3) * 100),
      icon: Flame,
    },
    {
      id: 'streak_7',
      title: 'Weekly Warrior',
      desc: 'Achieve a 7-day study streak',
      category: 'Consistency',
      points: 250,
      unlocked: streak >= 7,
      progress: Math.min(100, (streak / 7) * 100),
      icon: Flame,
    },
    {
      id: 'score_80',
      title: 'High Achiever',
      desc: 'Earn an overall score of 80% or higher',
      category: 'Performance',
      points: 200,
      unlocked: overallScore >= 80,
      progress: Math.min(100, (overallScore / 80) * 100),
      icon: Star,
    },
  ];

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;
  const totalPoints = BADGES.filter((b) => b.unlocked).reduce((sum, b) => sum + b.points, 0);

  const filteredBadges =
    activeCategory === 'All'
      ? BADGES
      : BADGES.filter((b) => b.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-4 sm:p-8 bg-gradient-to-r from-white via-amber-50/40 to-orange-50/40 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
            Dashboard &gt; Achievements & Milestones
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Celebrate Your Progress!
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Earn achievements by practicing consistently and leveling up your English skills.
          </p>
        </div>

        <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6 text-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">{unlockedCount} / {BADGES.length}</h4>
            <p className="text-[11px] text-slate-400 font-bold">Unlocked</p>
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-amber-500">{totalPoints}</h4>
            <p className="text-[11px] text-slate-400 font-bold">Points Earned</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Badges Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Learning', 'Consistency', 'Performance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} Badges
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card
                  key={badge.id}
                  className={`p-5 flex flex-col justify-between transition ${
                    badge.unlocked
                      ? 'border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-white'
                      : 'border-slate-100 bg-white opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        badge.unlocked
                          ? 'bg-amber-100 text-amber-600 shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                        badge.unlocked
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {badge.unlocked ? 'Unlocked ✓' : 'Locked'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{badge.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold text-slate-500">
                      <span>{badge.unlocked ? '100% Completed' : `${Math.round(badge.progress)}% Progress`}</span>
                      <span className="text-amber-600">+{badge.points} pts</span>
                    </div>
                    <ProgressBar
                      value={badge.progress}
                      color={badge.unlocked ? 'bg-amber-500' : 'bg-slate-300'}
                      height="h-2"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">How to Earn Badges</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Complete daily exercises across Grammar, Vocabulary, Reading, and Listening.</li>
              <li>Maintain your daily study streak to unlock consistency awards.</li>
              <li>Achievements update automatically as you complete activities.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
