'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto mb-8 transform -rotate-6">
            <MapPin className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-8xl font-black text-gray-900 mb-4 font-[Poppins] tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-[Poppins]">
            You've Lost Your Way
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a new location in the SERP.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
            >
              <Home className="w-4 h-4" />
              Back Home
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back to previous page
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
