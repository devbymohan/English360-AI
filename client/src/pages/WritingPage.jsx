import React, { useState } from 'react';
import { Edit3, Sparkles, CheckCircle2, AlertCircle, Award, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressCircle } from '../components/common/ProgressCircle';
import { writingService } from '../services/writingService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_TOPICS = [
  'The Impact of Technology on Students',
  'Advantages of Learning a Second Language',
  'Should Remote Work Become the Standard?',
  'The Importance of Physical Exercise in Daily Routine',
];

export const WritingPage = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('The Impact of Technology on Students');
  const [essayContent, setEssayContent] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setEssayContent(text);
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
  };

  const handleEvaluate = async () => {
    if (isEvaluating || !essayContent.trim()) return;
    setIsEvaluating(true);
    try {
      const result = await writingService.evaluate(
        topic,
        essayContent,
        user?.level !== 'Not Assessed' ? user?.level : 'B1'
      );
      if (result) {
        setEvaluation(result);
      }
    } catch (err) {
      console.warn('[WritingPage] Evaluation error:', err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          Dashboard &gt; Writing &gt; AI Essay Evaluator
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">Writing Practice</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left: Editor */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Writing Prompt / Topic:</label>
                <div className="flex gap-1.5 overflow-x-auto">
                  {DEFAULT_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTopic(t)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition whitespace-nowrap ${
                        topic === t
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Topic {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Your Essay:</span>
                <span>
                  Word Count: <strong className="text-slate-900">{wordCount}</strong> (Aim for 50–150 words)
                </span>
              </div>
              <textarea
                rows={10}
                value={essayContent}
                onChange={handleTextChange}
                placeholder="Type your essay or response here..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEssayContent('');
                  setWordCount(0);
                  setEvaluation(null);
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                disabled={isEvaluating || !essayContent.trim()}
                onClick={handleEvaluate}
                className="rounded-xl shadow-md"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    AI Evaluating Submission...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Submit for AI Evaluation
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: AI Evaluation */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-5 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/40 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">AI Evaluation Report</h3>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                {evaluation ? `Score: ${evaluation.overallScore || 0}/100` : 'Awaiting Submission'}
              </span>
            </div>

            {isEvaluating ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  English360 AI is assessing vocabulary, grammar, clarity, and coherence...
                </p>
              </div>
            ) : evaluation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-2">
                  <ProgressCircle
                    value={evaluation.overallScore || 75}
                    size={90}
                    strokeWidth={8}
                    color="#4F46E5"
                  >
                    <span className="text-xl font-extrabold text-slate-900">
                      {evaluation.overallScore || 75}
                    </span>
                  </ProgressCircle>
                </div>

                {/* Criteria Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Task Achievement
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {evaluation.scores?.taskAchievement || 75}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Coherence & Cohesion
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {evaluation.scores?.coherenceAndCohesion || 75}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Lexical Resource
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {evaluation.scores?.lexicalResource || 75}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Grammar & Accuracy
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {evaluation.scores?.grammarAndAccuracy || 75}%
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-2 text-xs">
                  {evaluation.feedback?.strengths && evaluation.feedback.strengths.length > 0 && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-emerald-900 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths:
                      </span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5 text-emerald-800">
                        {evaluation.feedback.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.feedback?.suggestions && evaluation.feedback.suggestions.length > 0 && (
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-900 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Suggestions:
                      </span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
                        {evaluation.feedback.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Edit3 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Type your essay and click "Submit for AI Evaluation" to receive feedback.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
