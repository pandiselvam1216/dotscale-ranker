'use client';

import { createClient } from '@/lib/supabase/client';
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
import AIAttributionAudit from '@/components/search/AIAttributionAudit';
import { AIOverview } from '@/lib/gemini';

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
  const [aiOverview, setAiOverview] = useState<AIOverview | null>(null);
  const [activeSourcePosition, setActiveSourcePosition] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setError('');
    setIsSearching(true);
    setResults([]);
    setAiOverview(null);
    setSearchId(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
        setIsSearching(false);
        return;
      }

      setResults(data.results);
      setAiOverview(data.aiOverview);
      setSearchId(data.search_id);
    } catch {
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-[Poppins]">
          Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Simulator</span>
        </h1>
        <p className="text-gray-500 text-lg font-medium">Analyze real-time search engine results powered by Gemini Flash AI.</p>
      </div>

      {/* Search Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-2 rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-indigo-50/50 flex flex-col md:flex-row gap-2 transition-all focus-within:shadow-indigo-200/50 focus-within:border-indigo-100"
      >
        <div className="flex-1 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-50 group-focus-within:bg-indigo-50 transition-colors">
            <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Enter search keyword (e.g., 'best marketing agency')"
            className="w-full bg-transparent py-6 pl-20 pr-6 text-lg font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !keyword.trim()}
          className="md:w-48 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] py-4 md:py-0 px-8 font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed group shadow-lg shadow-gray-200"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Check
              <SearchIcon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Results List */}
        <div className="lg:col-span-12">
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="shimmer w-10 h-6 rounded-lg" />
                    <div className="shimmer w-32 h-4 rounded-lg" />
                  </div>
                  <div className="shimmer w-full h-6 rounded-lg" />
                  <div className="shimmer w-3/4 h-4 rounded-lg" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-12 pb-20">
              {/* AI Overview stays at the top */}
              {aiOverview && (
                <AIAttributionAudit 
                  data={aiOverview} 
                  activeSourcePosition={activeSourcePosition}
                  onHoverSource={setActiveSourcePosition}
                />
              )}

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 font-[Poppins]">
                      Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Findings</span>
                    </h2>
                  </div>
                  <div className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-200">
                    {results.length} Results
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onMouseEnter={() => setActiveSourcePosition(result.position)}
                      onMouseLeave={() => setActiveSourcePosition(null)}
                      className={`group bg-white rounded-3xl border p-6 transition-all duration-300 relative ${
                        activeSourcePosition === result.position
                          ? 'border-indigo-600 shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-50 scale-[1.02] z-20'
                          : 'border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100'
                      }`}
                    >
                      {activeSourcePosition === result.position && (
                        <div className="absolute -top-3 right-8 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg z-30">
                          AI Citation Source
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-400 text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            {result.position}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ranking</span>
                            <span className="text-[11px] text-emerald-600 font-bold truncate max-w-[150px] mt-0.5">{new URL(result.url).hostname}</span>
                          </div>
                        </div>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {result.snippet}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <SearchIcon className="w-12 h-12 text-indigo-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[Poppins]">Ready to rank?</h3>
              <p className="text-gray-500 max-w-sm font-medium">
                Enter your target keyword above to start simulating real-time search results generated by Gemini Flash AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
