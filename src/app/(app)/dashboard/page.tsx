'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

interface DashboardStats {
  totalSearches: number;
  totalAuditorSearches: number;
  recentSearches: Array<{
    id: string;
    keyword: string;
    created_at: string;
    rank_check?: { is_listed: boolean; position: number | null };
  }>;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    totalAuditorSearches: 0,
    recentSearches: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Small delay to avoid auth token lock race with layout component
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Fetch searches
        const { count: searchCount } = await supabase
          .from('searches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: recentSearches } = await supabase
          .from('searches')
          .select('id, keyword, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch auditor searches from api_logs
        const { count: auditorCount } = await supabase
          .from('api_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('endpoint', 'gemini/domain-audit');

        // Fetch rank checks for recent searches to display status
        const searchIds = (recentSearches || []).map(s => s.id);
        const { data: rankChecks } = searchIds.length > 0
          ? await supabase
              .from('rank_checks')
              .select('search_id, is_listed, position')
              .in('search_id', searchIds)
          : { data: [] };

        const mappedSearches = (recentSearches || []).map(s => ({
          ...s,
          rank_check: rankChecks?.find(r => r.search_id === s.id),
        }));

        setStats({
          totalSearches: searchCount || 0,
          totalAuditorSearches: auditorCount || 0,
          recentSearches: mappedSearches,
        });
      } catch (err) {
        console.warn('Dashboard stats load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: 'Total Searches',
      value: stats.totalSearches,
      icon: Search,
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total Auditor Searches',
      value: stats.totalAuditorSearches,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, {loading ? '...' : (user?.full_name?.split(' ')[0] || 'User')}!</h1>
          <p className="text-sm text-gray-500 font-medium">Your SEO ranking overview at a glance.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${card.color} rounded-full blur-2xl`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color} shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Live</span>
              </div>
            </div>
            
            <div className="space-y-1">
              {loading ? (
                <div className="shimmer h-8 w-20 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 font-[Poppins]">{card.value}</p>
              )}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Search CTA & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Search CTA */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 relative overflow-hidden bg-[#1E1B4B] rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-900/10"
        >
          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6 border border-white/5">
                <Sparkles className="w-3 h-3" />
                New Feature
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight font-[Poppins]">
                Rank check your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">competitors</span> instantly.
              </h2>
              <p className="text-indigo-200/80 text-base mb-6 leading-relaxed">
                Stay ahead of the curve. Analyze any keyword and see where your website stands in the current search landscape with Gemini Flash AI-powered results.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/search"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-900 font-bold px-6 py-3 text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                Start New Search 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/how-it-works"
                className="w-full sm:w-auto px-6 py-3 text-white/70 hover:text-white text-sm font-semibold transition-colors text-center"
              >
                Learn how it works
              </Link>
            </div>
          </div>

          {/* Abstract visual element */}
          <div className="absolute right-10 bottom-10 hidden xl:block pointer-events-none opacity-20">
             <BarChart3 className="w-40 h-40 text-indigo-300" />
          </div>
        </motion.div>

        {/* Recent Searches Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden max-h-[400px]"
        >
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-[Poppins]">Recent Activity</h2>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">LATEST SEARCH HISTORY</p>
            </div>
            <Link href="/history" className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-indigo-600">
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[460px] scrollbar-hide">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-8 py-6 border-b border-gray-50 flex items-center gap-4">
                  <div className="shimmer w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-4 w-3/4" />
                    <div className="shimmer h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : stats.recentSearches.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium font-[Poppins]">No searches yet</p>
                <Link
                  href="/search"
                  className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                >
                  Start your first search
                </Link>
              </div>
            ) : (
              stats.recentSearches.map((search, idx) => (
                <div 
                  key={search.id} 
                  className={`group px-6 py-4 flex items-center gap-3 hover:bg-indigo-50/30 transition-all cursor-default ${
                    idx !== stats.recentSearches.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all flex items-center justify-center">
                      <Search className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-900 transition-colors">{search.keyword}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-gray-400 font-medium">
                        {new Date(search.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })} at {new Date(search.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  {search.rank_check ? (
                    <div className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border uppercase tracking-wider ${
                      search.rank_check.is_listed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100'
                    }`}>
                      {search.rank_check.is_listed ? `#${search.rank_check.position}` : 'Unlisted'}
                    </div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  )}
                </div>
              ))
            )}
          </div>
          
          <Link 
            href="/history" 
            className="p-4 text-center text-xs font-bold text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-all border-t border-gray-50 uppercase tracking-widest"
          >
            View Full History
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
