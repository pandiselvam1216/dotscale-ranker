'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AIAttributionAudit from '@/components/search/AIAttributionAudit';
import { AIOverview } from '@/lib/gemini';

interface SearchHistory {
  id: string;
  keyword: string;
  created_at: string;
  ai_overview?: AIOverview;
  results: Array<{
    position: number;
    title: string;
    url: string;
    snippet: string;
  }>;
  rank_check?: {
    is_listed: boolean;
    position: number | null;
    target_url: string;
    feedback: string;
  };
}

export default function HistoryPage() {
  const [searches, setSearches] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        // Small delay to avoid auth token lock race with layout component
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: searchData } = await supabase
          .from('searches')
          .select('id, keyword, created_at, ai_overview')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

      if (!searchData) {
        setLoading(false);
        return;
      }

      const fullHistory: SearchHistory[] = [];

      for (const search of searchData) {
        const { data: results } = await supabase
          .from('search_results')
          .select('position, title, url, snippet')
          .eq('search_id', search.id)
          .order('position');

        const { data: rankChecks } = await supabase
          .from('rank_checks')
          .select('is_listed, position, target_url, feedback')
          .eq('search_id', search.id)
          .limit(1);

        fullHistory.push({
          ...search,
          results: results || [],
          rank_check: rankChecks?.[0],
        });
      }

      setSearches(fullHistory);
    } catch (err) {
      console.warn('History load error:', err);
    } finally {
      setLoading(false);
    }
  }
  loadHistory();
}, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-1 sm:gap-2 px-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-[Poppins]">
          Search <span className="text-indigo-600">History</span>
        </h1>
        <p className="text-sm sm:text-lg text-gray-500 font-medium">Review and audit your past simulations.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-4">
              <div className="shimmer w-12 h-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-5 w-48 rounded-lg" />
                <div className="shimmer h-4 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] border border-dashed border-gray-200 p-20 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[Poppins]">Audit history is empty</h3>
          <p className="text-gray-500 max-w-xs mx-auto mb-8">Perform your first search simulation to see it appear here.</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Start Searching
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                expandedId === search.id ? 'border-indigo-200 shadow-xl shadow-indigo-500/5' : 'border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => setExpandedId(expandedId === search.id ? null : search.id)}
                className="w-full flex flex-row items-center gap-3 p-4 sm:p-6 text-left group"
              >
                <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  expandedId === search.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}>
                  <Search className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">{search.keyword}</p>
                  <p className="text-[10px] sm:text-sm text-gray-400 flex items-center gap-2 mt-0.5 font-medium">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {search.rank_check ? (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold shadow-sm ${
                      search.rank_check.is_listed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {search.rank_check.is_listed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          #{search.rank_check.position}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Unlisted
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100">
                      None
                    </div>
                  )}
                  
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    {expandedId === search.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === search.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-indigo-50 overflow-hidden"
                  >
                    <div className="p-8 space-y-8 bg-neutral-50/50">
                      {search.ai_overview && (
                        <div className="bg-white rounded-[2rem] border border-indigo-100 p-8 shadow-xl shadow-indigo-500/5">
                          <AIAttributionAudit 
                            data={search.ai_overview} 
                            activeSourcePosition={null} 
                            onHoverSource={() => {}} 
                          />
                        </div>
                      )}
                      {search.rank_check && (
                        <div className={`p-6 rounded-[1.5rem] border relative overflow-hidden ${
                          search.rank_check.is_listed ? 'bg-white border-emerald-100' : 'bg-white border-rose-100 shadow-sm'
                        }`}>
                          <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-10 rounded-full blur-2xl ${
                            search.rank_check.is_listed ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          
                          <div className="relative z-10 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Rank Audit Result</p>
                              {search.rank_check.is_listed && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimized</span>}
                            </div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              Target Domain: <span className="text-indigo-600 select-all tracking-tight">{search.rank_check.target_url}</span>
                            </p>
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expert Feedback</p>
                              <p className="text-sm text-gray-600 font-medium leading-relaxed italic">&ldquo;{search.rank_check.feedback}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Full Result Set ({search.results.length})</h4>
                          <span className="text-[10px] font-bold text-gray-400">POSITIONS 1-20</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200">
                          {search.results.map((result) => (
                            <div key={result.position} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group/item hover:border-indigo-200 transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                  {result.position}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 truncate flex-1 uppercase tracking-tight">{new URL(result.url).hostname}</span>
                              </div>
                              <p className="text-sm font-bold text-gray-900 group-hover/item:text-indigo-600 transition-colors line-clamp-1">{result.title}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-normal">{result.snippet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
