import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Info, Target } from 'lucide-react';
import { AIOverview } from '@/lib/gemini';

interface AIAttributionAuditProps {
  data: AIOverview;
  activeSourcePosition: number | null;
  onHoverSource: (position: number | null) => void;
}

export default function AIAttributionAudit({ data, activeSourcePosition, onHoverSource }: AIAttributionAuditProps) {
  if (!data || !data.summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-500/10 overflow-hidden relative group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 group-hover:bg-cyan-50 transition-colors duration-500" />
      
      <div className="p-8 md:p-10 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight font-[Poppins]">AI <span className="text-indigo-600">Attribution</span> Audit</h3>
              <p className="text-sm font-bold text-gray-400 mt-0.5 uppercase tracking-widest">Source Contribution Analysis</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Fidelity: 98%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Summary Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-100 relative">
              <div className="absolute top-4 right-6 flex gap-1">
                <div className="w-1 h-1 rounded-full bg-indigo-300" />
                <div className="w-1 h-1 rounded-full bg-indigo-200" />
                <div className="w-1 h-1 rounded-full bg-indigo-100" />
              </div>
              <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed font-[Inter]">
                {data.attributions.map((attr, idx) => (
                  <span
                    key={idx}
                    onMouseEnter={() => onHoverSource(attr.sourcePosition)}
                    onMouseLeave={() => onHoverSource(null)}
                    className={`cursor-help transition-all duration-300 rounded-lg px-1 pb-1 border-b-2 ${
                      activeSourcePosition === attr.sourcePosition
                        ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200'
                        : 'border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    {attr.sentence}{' '}
                  </span>
                ))}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-500/70 uppercase tracking-widest">Hover sentences to highlight source</span>
              </div>
            </div>
          </div>

          {/* Contribution Breakdown Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
              <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest mb-6">
                <Target className="w-4 h-4 text-indigo-600" />
                Competitor Influence
              </h4>
              
              <div className="space-y-5">
                {data.attributions
                  .sort((a, b) => b.contributionScore - a.contributionScore)
                  .map((attr, i) => (
                    <div
                      key={i}
                      className={`group/attr p-3 rounded-2xl transition-all ${
                        activeSourcePosition === attr.sourcePosition ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Source #{attr.sourcePosition}</span>
                        <span className="text-sm font-black text-gray-900">{attr.contributionScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${attr.contributionScore}%` }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <p className="text-[11px] font-bold text-indigo-900/60 leading-normal uppercase">
                Audit complete. AI detected high alignment between Position #1 and the Synthesized Overview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
