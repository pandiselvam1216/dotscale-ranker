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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hero Input Section */}
      <section className="text-center space-y-3 pt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-indigo-700 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-indigo-100"
        >
          <Target className="w-3.5 h-3.5" />
          AI Intelligence Auditor
        </motion.div>
        
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 font-[Poppins] tracking-tight px-4 leading-tight">
          Audit your brand in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">AI Memory</span>
        </h1>
        
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed px-6">
          Identify exactly how Gemini perceives your domain and what intents drive your presence.
        </p>

        <form onSubmit={handleAudit} className="max-w-xl mx-auto relative group mt-2 sm:mt-6 px-4 overflow-visible">
          <div className="absolute -inset-4 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/10 transition-colors duration-500 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row gap-2 p-1 rounded-xl bg-white border border-gray-200 shadow-xl shadow-indigo-500/5 transition-all focus-within:border-indigo-400">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter domain (e.g. nike.com)"
                className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-gray-900 font-bold focus:outline-none transition-all text-[13px] placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-10 px-6 bg-gray-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 group flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Audit Domain
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
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
              className="space-y-6"
            >
            {/* Verdict & Score Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-indigo-100 shadow-xl shadow-indigo-500/5 lg:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight font-[Poppins]">Audit Verdict</h2>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Master Report</p>
                        {data.recoveryUsed && (
                          <span className="flex items-center gap-1 text-[8px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-tighter">
                            <Zap className="w-2 h-2" />
                            Smart Recovery
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed italic">
                    &ldquo;{data.verdict}&rdquo;
                  </p>
                </div>
              </div>

              <div className="bg-[#1E1B4B] rounded-2xl p-6 sm:p-8 text-white shadow-2xl shadow-indigo-900/10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="226.2"
                      initial={{ strokeDashoffset: 226.2 }}
                      animate={{ strokeDashoffset: 226.2 - (226.2 * data.visibilityScore) / 100 }}
                      className="text-indigo-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black">{data.visibilityScore}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Visibility</h3>
                  <p className="text-indigo-200/40 font-bold text-[9px] mt-1 uppercase tracking-widest">Brand Impact</p>
                </div>
              </div>
            </div>

            {/* Identified Assets Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-gray-900 font-[Poppins]">Identified Brand Assets</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.pages.map((page, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">
                          {page.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {page.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2.5">
                         <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${page.relevanceScore}%` }}
                             transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                             className="h-full bg-emerald-400" 
                           />
                         </div>
                         <span className="text-[8px] font-black text-emerald-600 uppercase whitespace-nowrap">{page.relevanceScore}% Impact</span>
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
          </motion.div>
        )}

        {!data && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center pt-10 text-center"
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
