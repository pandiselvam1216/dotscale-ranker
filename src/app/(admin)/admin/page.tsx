'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Zap,
  TrendingUp,
  Activity,
  Eye,
} from 'lucide-react';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  liveUsers: number;
  totalSearches: number;
  totalAudits: number;
  weeklySearches: number;
  weeklyAudits: number;
  totalTokens: number;
  dailySearches: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
    // Auto-refresh every 30 seconds for live data
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const cards = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      label: 'Live Now',
      value: analytics?.liveUsers || 0,
      icon: Eye,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      isLive: true,
    },
    {
      label: 'Active (7d)',
      value: analytics?.activeUsers || 0,
      icon: Activity,
      color: 'from-cyan-500 to-cyan-600',
      bg: 'bg-cyan-50',
      textColor: 'text-cyan-700',
    },
    {
      label: 'Total Searches',
      value: analytics?.totalSearches || 0,
      icon: Search,
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50',
      textColor: 'text-violet-700',
    },
    {
      label: 'Total Audits',
      value: analytics?.totalAudits || 0,
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Weekly Searches',
      value: analytics?.weeklySearches || 0,
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      label: 'Weekly Audits',
      value: analytics?.weeklyAudits || 0,
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
    },
    {
      label: 'API Tokens Used',
      value: analytics?.totalTokens || 0,
      icon: Zap,
      color: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
      textColor: 'text-rose-700',
    },
  ];

  const maxDailySearch = Math.max(
    ...Object.values(analytics?.dailySearches || { a: 1 }),
    1
  );

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold font-[Poppins]">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Platform analytics and user insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.textColor}`} />
              </div>
              {card.isLive && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-live" />
                  LIVE
                </span>
              )}
            </div>
            {loading ? (
              <div className="shimmer h-8 w-20 mb-0.5" />
            ) : (
              <p className="text-2xl font-bold font-[Poppins]">{formatNumber(card.value)}</p>
            )}
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h2 className="text-base font-semibold font-[Poppins] mb-4">Search Trend (Last 7 Days)</h2>
        {loading ? (
          <div className="shimmer h-48 w-full" />
        ) : Object.keys(analytics?.dailySearches || {}).length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No search data available for this period
          </div>
        ) : (
          <div className="flex items-end gap-3 h-32">
            {Object.entries(analytics?.dailySearches || {}).map(([day, count], i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-700">{count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxDailySearch) * 100}%` }}
                  transition={{ delay: i * 0.1 + 0.5, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md min-h-[4px]"
                />
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium whitespace-nowrap">{day}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
