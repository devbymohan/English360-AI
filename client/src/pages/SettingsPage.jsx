import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Shield, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import api, { getBaseURL, setCustomApiUrl } from '../services/api';
import axios from 'axios';

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('B1');
  const [dailyGoal, setDailyGoal] = useState('20');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cloud Backend Manager State
  const [apiUrlInput, setApiUrlInput] = useState(() => getBaseURL());
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle');
  const [apiStatusMsg, setApiStatusMsg] = useState('');

  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiStatusMsg('Pinging backend service...');
    setApiStatus('testing');

    const targetUrl = apiUrlInput.trim().replace(/\/+$/, '');
    const pingEndpoint = targetUrl.endsWith('/api') ? `${targetUrl}/health` : `${targetUrl}/api/health`;

    try {
      const res = await axios.get(pingEndpoint, { timeout: 15000 });
      if (res.status === 200) {
        setApiStatus('connected');
        setApiStatusMsg('Connected successfully to English360 AI Backend!');
      } else {
        setApiStatus('error');
        setApiStatusMsg(`Backend responded with status code: ${res.status}`);
      }
    } catch (err) {
      setApiStatus('error');
      setApiStatusMsg(
        err.response?.status
          ? `Backend error (${err.response.status}). Check URL path.`
          : 'Could not connect. Ensure Render service is awake.'
      );
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSaveApiUrl = () => {
    const cleanUrl = apiUrlInput.trim().replace(/\/+$/, '');
    setCustomApiUrl(cleanUrl);
    setApiStatus('connected');
    setApiStatusMsg('API URL saved to browser! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setLevel(currentUser.level !== 'Not Assessed' ? currentUser.level : 'B1');
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await api.put('/users/me', {
        name,
        dailyGoal,
        englishLevel: level,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('[SettingsPage] Update notice:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Dashboard &gt; Settings
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student profile, learning preferences, and daily goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal Profile
            </h3>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile preferences updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  disabled
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Select
                  label="Target English Level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  options={[
                    { value: 'A1', label: 'A1 – Beginner' },
                    { value: 'A2', label: 'A2 – Elementary' },
                    { value: 'B1', label: 'B1 – Intermediate' },
                    { value: 'B2', label: 'B2 – Upper-Intermediate' },
                    { value: 'C1', label: 'C1 – Advanced' },
                    { value: 'C2', label: 'C2 – Mastery' },
                  ]}
                />
                <Select
                  label="Daily Goal"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  options={[
                    { value: '10', label: '10 mins / day (Casual)' },
                    { value: '20', label: '20 mins / day (Regular)' },
                    { value: '45', label: '45 mins / day (Intensive)' },
                  ]}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" size="sm" disabled={isSaving} className="rounded-xl">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Security & App Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Backend AI Connection Manager */}
          <Card className="p-5 space-y-3.5 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 border border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">Cloud AI Backend</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  apiStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apiStatus === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {apiStatus === 'connected' ? 'Connected' : apiStatus === 'error' ? 'Offline' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Connect your Render backend web service to activate live English360 AI generation.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://your-app.onrender.com/api"
                className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            {apiStatusMsg && (
              <p
                className={`text-[11px] font-semibold ${
                  apiStatus === 'connected' ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {apiStatusMsg}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTestingApi}
                onClick={handleTestApi}
                className="text-xs w-1/2 rounded-xl"
              >
                {isTestingApi ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Test Ping'}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveApiUrl}
                className="text-xs w-1/2 rounded-xl"
              >
                Save &amp; Link
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Account Security</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your account is authenticated with Firebase Authentication and synced securely with MongoDB.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <Shield className="w-4 h-4 text-brand-600 mb-1" />
              <span>Token-based secure API access</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
