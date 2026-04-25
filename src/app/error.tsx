'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-[Poppins]">
          Something went wrong
        </h2>
        <p className="text-gray-500 mb-4 leading-relaxed">
          An unexpected error occurred while loading this section.
        </p>

        {error.message && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Error Detail</p>
            <p className="text-sm font-mono text-red-600 break-words">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gray-50 text-gray-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[10px] text-gray-400 font-mono tracking-tighter uppercase">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
