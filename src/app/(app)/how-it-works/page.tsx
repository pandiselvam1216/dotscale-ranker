'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Search, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Globe,
  Bot
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "1. Search Simulation",
      description: "We use Gemini Flash AI to replicate human-like search queries. This allows you to see the real-time SERP landscape exactly as an AI sees it.",
      color: "bg-indigo-50 text-indigo-600",
      accent: "indigo"
    },
    {
      icon: Target,
      title: "2. AI Memory Audit",
      description: "Our algorithms crawl identified assets in Gemini's knowledge base. We find where your brand is mentioned, cited, or represented across the AI web.",
      color: "bg-cyan-50 text-cyan-600",
      accent: "cyan"
    },
    {
      icon: ShieldCheck,
      title: "3. Visibility Verdict",
      description: "Get a concrete score of your brand's authority. We map search intents to your pages, showing you which products are driving current AI rankings.",
      color: "bg-emerald-50 text-emerald-600",
      accent: "emerald"
    }
  ];

  const features = [
    {
      icon: Bot,
      label: "AI Attribution",
      text: "See which specific pages Gemini chooses as 'Sources' for its generated answers."
    },
    {
      icon: BarChart3,
      label: "Trend Mapping",
      text: "Track how your AI visibility score changes as you optimize your contents."
    },
    {
      icon: Globe,
      label: "Global Reach",
      text: "Analyze your presence across multiple industries and search categories."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 sm:px-0">
      {/* Hero */}
      <section className="text-center space-y-4 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-indigo-700 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-indigo-100"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The DotScale Guide
        </motion.div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-[Poppins] tracking-tight leading-tight">
          How DotScale <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Works</span>
        </h1>
        
        <p className="text-gray-500 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          The world of SEO is shifting to AI. DotScale is built to help you understand and dominate your presence in Gemini and other AI search models.
        </p>
      </section>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className={`p-4 rounded-2xl ${step.color} shadow-lg shadow-current/10 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 font-[Poppins]">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Checklist */}
      <section className="bg-[#1E1B4B] rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-[Poppins]">Mastering the AI Mesh</h2>
            <p className="text-indigo-200/60 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Advanced Platform Features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="space-y-3 text-center md:text-left">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto md:mx-0">
                  <feature.icon className="w-5 h-5 text-indigo-300" />
                </div>
                <h4 className="font-bold text-white text-lg">{feature.label}</h4>
                <p className="text-sm text-indigo-100/60 leading-relaxed font-medium">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 font-black px-8 py-3 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 group shadow-xl shadow-white/5"
            >
              Start First Simulation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <footer className="text-center border-t border-gray-100 pt-12">
        <p className="text-gray-400 italic font-medium">
          &ldquo;DotScale is not just about rankings; it's about being the primary reference for AI intelligence.&rdquo;
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Alpha Build 1.0</span>
        </div>
      </footer>
    </div>
  );
}
