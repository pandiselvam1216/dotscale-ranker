'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-indigo-50 border-t-indigo-600"
        />
        
        {/* Inner Pulse */}
        <motion.div
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-gray-900 tracking-wide font-[Poppins]">
          DotScale is thinking
        </h3>
        <p className="text-xs text-gray-400 mt-2 animate-pulse">
          Analyzing SERP data and preparing your dashboard...
        </p>
      </motion.div>

      {/* Skeleton placeholders for content */}
      <div className="mt-12 w-full max-w-2xl space-y-4 opacity-10 blur-[2px]">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl w-full" />
      </div>
    </div>
  );
}
