import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, TrendingUp, Trophy, ArrowRight, Clock, Award, Shield, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { ProgressBar } from '../components/common/ProgressBar';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';

export const ProgressPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await progressService.getProgress();
      if (data) setProgress(data);
    } catch (e) {
      console.warn('[ProgressPage] Load progress notice:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const lessonsCount = progress?.lessonsCompleted ?? 0;
  const questionsCount = progress?.questionsSolved ?? 0;
  const accuracy = progress?.averageAccuracy ?? 0;
  const streak = progress?.streak ?? user?.streak ?? 0;
  const level = progress?.englishLevel ?? user?.level ?? 'Not Assessed';
  const activities = progress?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Dashboard &gt; Learning Analytics
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">My Progress & Stats</h1>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
        <Card className="p-3.5 sm:p-5">
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">Lessons Completed</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{lessonsCount}</h3>
        </Card>
        <Card className="p-3.5 sm:p-5">
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">Questions Solved</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{questionsCount}</h3>
        </Card>
        <Card className="p-3.5 sm:p-5">
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">Average Accuracy</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">{accuracy}%</h3>
        </Card>
        <Card className="p-3.5 sm:p-5">
          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold">Study Streak</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-orange-500 mt-1">{streak} Days</h3>
        </Card>
      </div>

      {/* Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Current Level Status</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">CEFR Evaluation Level</p>
                <h4 className="text-xl font-extrabold text-brand-600 mt-0.5">{level}</h4>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
                Overall: {accuracy}%
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-800 pt-2">Recent Learning History</h4>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No learning activities yet. Complete your first lesson to see your timeline.
              </p>
            ) : (
              <div className="space-y-2">
                {activities.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{act.title}</span>
                      <span className="text-slate-400 ml-2">({act.type})</span>
                    </div>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {act.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Goals & Milestones */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Milestone Targets</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Initial Assessment</span>
                  <span className={user?.assessmentCompleted ? 'text-emerald-600' : 'text-slate-400'}>
                    {user?.assessmentCompleted ? 'Completed ✓' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Complete 5 Lessons</span>
                  <span className="text-brand-600">{Math.min(5, lessonsCount)}/5</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Maintain 3-Day Streak</span>
                  <span className="text-orange-500">{Math.min(3, streak)}/3 Days</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
