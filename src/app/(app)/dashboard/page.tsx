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
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalSearches: number;
  listedCount: number;
  notListedCount: number;
  recentSearches: Array<{
    id: string;
    keyword: string;
    created_at: string;
    rank_check?: { is_listed: boolean; position: number | null };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSearches: 0,
    listedCount: 0,
    notListedCount: 0,
    recentSearches: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch searches
      const { data: searches, count } = await supabase
        .from('searches')
        .select('id, keyword, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch rank checks
      const { data: rankChecks } = await supabase
        .from('rank_checks')
        .select('search_id, is_listed, position')
        .in('search_id', (searches || []).map(s => s.id));

      const listedCount = rankChecks?.filter(r => r.is_listed).length || 0;
      const notListedCount = rankChecks?.filter(r => !r.is_listed).length || 0;

      const recentSearches = (searches || []).map(s => ({
        ...s,
        rank_check: rankChecks?.find(r => r.search_id === s.id),
      }));

      setStats({
        totalSearches: count || 0,
        listedCount,
        notListedCount,
        recentSearches,
      });
      setLoading(false);
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
      label: 'Listed Results',
      value: stats.listedCount,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Not Listed',
      value: stats.notListedCount,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Success Rate',
      value: stats.totalSearches > 0
        ? `${Math.round((stats.listedCount / Math.max(stats.listedCount + stats.notListedCount, 1)) * 100)}%`
        : '—',
      icon: BarChart3,
      color: 'from-cyan-500 to-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>Dashboard</h1>
        <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '0.9375rem' }}>Your SEO ranking overview at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.bg === 'bg-indigo-50' ? '#eef2ff' : card.bg === 'bg-emerald-50' ? '#ecfdf5' : card.bg === 'bg-red-50' ? '#fef2f2' : '#ecfeff' }}>
                <card.icon style={{ width: '20px', height: '20px', color: card.bg === 'bg-indigo-50' ? '#6366f1' : card.bg === 'bg-emerald-50' ? '#10b981' : card.bg === 'bg-red-50' ? '#ef4444' : '#06b6d4' }} />
              </div>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#d1d5db' }} />
            </div>
            {loading ? (
              <div className="shimmer" style={{ height: '32px', width: '80px', marginBottom: '4px' }} />
            ) : (
              <p style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>{card.value}</p>
            )}
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '4px' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Search CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '20px', padding: '32px', color: 'white', marginBottom: '32px' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Ready to check your rankings?</h2>
            <p style={{ color: 'rgba(199,210,254,0.9)', marginTop: '4px', fontSize: '0.9375rem' }}>Enter a keyword and see where your site ranks in the top 20.</p>
          </div>
          <Link
            href="/search"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#4338ca', fontWeight: 600, padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontSize: '0.9375rem' }}
          >
            New Search <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </motion.div>

      {/* Recent Searches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold font-[Poppins]">Recent Searches</h2>
          <Link href="/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-4">
                <div className="shimmer w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <div className="shimmer h-4 w-40 mb-2" />
                  <div className="shimmer h-3 w-24" />
                </div>
              </div>
            ))
          ) : stats.recentSearches.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No searches yet. Start your first search!</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Go to Search <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            stats.recentSearches.map((search) => (
              <div key={search.id} className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Search className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{search.keyword}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(search.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {search.rank_check && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      search.rank_check.is_listed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {search.rank_check.is_listed
                      ? `Listed #${search.rank_check.position}`
                      : 'Not Listed'}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
