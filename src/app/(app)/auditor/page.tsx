'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Loader2, 
  Globe, 
  Sparkles, 
  Search, 
  TrendingUp, 
  Activity, 
  UserSearch, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { DeepDomainAuditResponse } from '@/lib/gemini';

export default function AuditorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DeepDomainAuditResponse | null>(null);
  const [error, setError] = useState('');

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch('/api/domain-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: url.trim() }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Audit failed');

      setData(resData);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Hero Input Section */}
      <section className="text-center space-y-6 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-bold tracking-widest uppercase border border-indigo-100"
        >
          <Target className="w-4 h-4" />
          AI Intelligence Auditor
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-[Poppins] tracking-tight">
          Audit your brand in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">AI Memory</span>
        </h1>
        
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          See exactly which pages and products Gemini recognizes from your domain and understand what search intents drive your visibility.
        </p>

        <form onSubmit={handleAudit} className="max-w-2xl mx-auto relative group mt-8">
          <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/10 transition-colors duration-500" />
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your website URL (e.g., nike.com)"
                className="w-full h-16 pl-14 pr-6 bg-white border-2 border-gray-100 rounded-3xl text-gray-900 font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 ring-indigo-50 transition-all text-lg shadow-xl shadow-gray-200/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-16 px-10 bg-gray-900 hover:bg-black text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              ) : (
                <>
                  Audit Domain
                  <Zap className="w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-700 max-w-2xl mx-auto"
          >
            <div className="p-3 bg-rose-500 rounded-full shadow-lg shadow-rose-200">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest mb-1">Audit Failed</p>
              <p className="font-bold text-lg leading-tight">{error}</p>
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Verdict & Score Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-[2.5rem] p-10 border-2 border-gray-50 shadow-xl shadow-gray-200/40 lg:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight font-[Poppins]">AI Visibility Verdict</h2>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Master Audit Report</p>
                    </div>
                  </div>
                  <p className="text-xl text-gray-700 font-medium leading-relaxed italic">
                    &ldquo;{data.verdict}&rdquo;
                  </p>
                </div>
              </div>

              <div className="bg-[#1E1B4B] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="364.4"
                      initial={{ strokeDashoffset: 364.4 }}
                      animate={{ strokeDashoffset: 364.4 - (364.4 * data.visibilityScore) / 100 }}
                      className="text-indigo-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black">{data.visibilityScore}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest leading-none">Visibility</h3>
                  <p className="text-indigo-200/60 font-bold text-sm mt-2 uppercase tracking-widest">Aggregate Brand Impact</p>
                </div>
              </div>
            </div>

            {/* Knowledge vs Intent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Identified Assets */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 font-[Poppins]">Identified Assets</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {data.pages.map((page, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white rounded-3xl p-6 border-2 border-gray-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded">
                            {page.type}
                          </span>
                          <span className="text-xs font-bold text-gray-400">#{(i+1).toString().padStart(2, '0')}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {page.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-emerald-400" 
                               style={{ width: `${page.relevanceScore}%` }} 
                             />
                           </div>
                           <span className="text-[10px] font-black text-emerald-600 uppercase">{page.relevanceScore}% Impact</span>
                        </div>
                      </div>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* User Search Intents */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <UserSearch className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 font-[Poppins]">Search Driver Mapping</h3>
                </div>

                <div className="space-y-4">
                  {data.intents.map((intent, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-50/50 rounded-3xl p-8 border border-white relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <TrendingUp className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-200 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">
                            {intent.intent} Intent
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">
                          &ldquo;{intent.query}&rdquo;
                        </h4>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                          {intent.context}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!data && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center pt-20 text-center"
          >
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8 relative">
               <div className="absolute inset-0 bg-indigo-200/30 rounded-full animate-ping" />
               <Activity className="w-12 h-12 text-indigo-400 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 font-[Poppins]">Enter a domain to begin</h3>
            <p className="text-gray-500 max-w-sm font-medium">
              We'll crawl through Gemini's index to find exactly how your brand is being represented and what drives your AI visibility.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
