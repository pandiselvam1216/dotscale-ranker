'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SearchHistory {
  id: string;
  keyword: string;
  created_at: string;
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: searchData } = await supabase
        .from('searches')
        .select('id, keyword, created_at')
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
      setLoading(false);
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[Poppins]">Search History</h1>
        <p className="text-gray-500 mt-1">View all your past searches and ranking results.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="shimmer h-5 w-48 mb-3" />
              <div className="shimmer h-3 w-32" />
            </div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No search history</h3>
          <p className="text-gray-500">Your search history will appear here once you perform searches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === search.id ? null : search.id)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{search.keyword}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(search.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {search.rank_check && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        search.rank_check.is_listed
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {search.rank_check.is_listed ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> #{search.rank_check.position}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Not Listed
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {search.results.length} results
                  </span>
                  {expandedId === search.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedId === search.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-100 px-5 py-4"
                >
                  {search.rank_check && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      search.rank_check.is_listed ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      <p className="text-sm font-medium">
                        Target: {search.rank_check.target_url}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{search.rank_check.feedback}</p>
                    </div>
                  )}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {search.results.map((result) => (
                      <div key={result.position} className="text-sm">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-400 font-mono">#{result.position}</span>
                          <span className="text-xs text-green-700 truncate">{result.url}</span>
                        </div>
                        <p className="text-indigo-600 font-medium">{result.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{result.snippet}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
