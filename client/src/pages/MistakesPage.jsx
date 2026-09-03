import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Sparkles,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { mistakeService } from '../services/mistakeService';

export const MistakesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState([]);

  useEffect(() => {
    loadMistakes();
  }, [activeCategory]);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const data = await mistakeService.getMistakes({
        category: activeCategory !== 'All' ? activeCategory : undefined,
        search: searchQuery || undefined,
      });
      if (Array.isArray(data)) {
        setMistakes(data);
      }
    } catch (err) {
      console.warn('[MistakesPage] Load mistakes notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      await mistakeService.markReviewed(id);
      setReviewedIds((prev) => [...prev, id]);
    } catch (e) {
      setReviewedIds((prev) => [...prev, id]);
    }
  };

  const filteredItems = mistakes.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      (item.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.explanation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Dashboard &gt; My Mistakes Repository
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">My Mistakes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted review for questions you missed across Grammar, Vocabulary, Reading, and Tests.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mistakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Grammar', 'Vocabulary', 'Reading', 'Listening', 'Test'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mistakes List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your mistake repository...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center space-y-3 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Mistakes Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No mistakes matching your search query.'
              : 'You have zero unreviewed mistakes in this category. Great work!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const isReviewed = reviewedIds.includes(item._id || idx) || item.reviewed;
            return (
              <Card
                key={item._id || idx}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Topic: {item.topic}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {item.question}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <span className="text-rose-600 font-semibold">
                      Your answer: <strong>{item.userAnswer}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold">
                      Correct answer: <strong>{item.correctAnswer}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    💡 {item.explanation}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isReviewed ? 'outline' : 'secondary'}
                    onClick={() => handleReview(item._id || idx)}
                    className="text-xs rounded-xl"
                  >
                    {isReviewed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Reviewed
                      </>
                    ) : (
                      'Mark as Reviewed ✓'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
