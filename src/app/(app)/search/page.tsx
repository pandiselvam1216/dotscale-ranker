'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Target,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface SearchResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

interface RankCheckResult {
  is_listed: boolean;
  position: number | null;
  feedback: string;
  matched_url?: string;
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [rankCheck, setRankCheck] = useState<RankCheckResult | null>(null);
  const [isCheckingRank, setIsCheckingRank] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setError('');
    setIsSearching(true);
    setResults([]);
    setRankCheck(null);
    setSearchId(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
        setIsSearching(false);
        return;
      }

      setResults(data.results);
      setSearchId(data.search_id);
    } catch {
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRankCheck = async () => {
    if (!targetUrl.trim() || !searchId) return;
    setIsCheckingRank(true);
    setRankCheck(null);

    try {
      const response = await fetch('/api/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_id: searchId, target_url: targetUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Rank check failed');
        setIsCheckingRank(false);
        return;
      }

      setRankCheck(data);
    } catch {
      setError('Failed to check ranking.');
    } finally {
      setIsCheckingRank(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>Search Engine Simulator</h1>
        <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '0.9375rem' }}>Enter a keyword to fetch AI-powered top 20 search results.</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword (e.g., 'best cotton clothes')"
              className="form-input"
              style={{ paddingLeft: '48px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px', fontSize: '1rem', borderRadius: '16px' }}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="btn-primary"
            style={{ width: 'auto', padding: '16px 32px', borderRadius: '16px' }}
          >
            {isSearching ? (
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <SearchIcon style={{ width: '20px', height: '20px' }} />
            )}
            Search
          </button>
        </div>
      </form>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50 border border-red-100 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Shimmer */}
      {isSearching && (
        <div className="space-y-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="shimmer h-3 w-48 mb-3" />
              <div className="shimmer h-5 w-96 mb-3" />
              <div className="shimmer h-3 w-full mb-1" />
              <div className="shimmer h-3 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold font-[Poppins]">
                Top {results.length} Results for &ldquo;{keyword}&rdquo;
              </h2>
            </div>

            <div className="space-y-3">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      #{result.position}
                    </span>
                    <span className="text-xs text-green-700 truncate max-w-sm">{result.url}</span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </a>
                  </div>
                  <h3 className="text-lg text-indigo-600 group-hover:text-indigo-700 font-medium transition-colors mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.snippet}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank Checker */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold font-[Poppins]">Rank Checker</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter your target URL to check if it appears in the search results.
            </p>

            <div className="flex gap-3">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourdomain.com/page"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
              <button
                onClick={handleRankCheck}
                disabled={isCheckingRank || !targetUrl.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCheckingRank ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                Check Rank
              </button>
            </div>

            {/* Rank Result */}
            <AnimatePresence>
              {rankCheck && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-6 rounded-xl border ${
                    rankCheck.is_listed
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {rankCheck.is_listed ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <h3 className={`text-xl font-bold font-[Poppins] ${
                        rankCheck.is_listed ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {rankCheck.is_listed
                          ? `✅ LISTED — Position #${rankCheck.position}`
                          : '❌ NOT LISTED'}
                      </h3>
                      {rankCheck.matched_url && (
                        <p className="text-sm text-emerald-600 mt-1">Matched: {rankCheck.matched_url}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Analysis & Feedback</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{rankCheck.feedback}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
