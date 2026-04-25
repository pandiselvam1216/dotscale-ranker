'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NetworkQuality = 'good' | 'medium' | 'bad' | 'offline';

export default function NetworkStatus() {
  const [quality, setQuality] = useState<NetworkQuality>('good');
  const [label, setLabel] = useState('Excellent');

  useEffect(() => {
    const updateStatus = () => {
      if (!navigator.onLine) {
        setQuality('offline');
        setLabel('No Connection');
        return;
      }

      // Check for Network Information API support
      const conn = (navigator as any).connection;
      if (conn) {
        const { effectiveType, rtt, downlink } = conn;
        
        // Logic for quality mapping
        if (effectiveType === '4g' && rtt < 100 && downlink > 5) {
          setQuality('good');
          setLabel('Good');
        } else if (effectiveType === '2g' || rtt > 500 || downlink < 1) {
          setQuality('bad');
          setLabel('Bad');
        } else {
          setQuality('medium');
          setLabel('Medium');
        }
      } else {
        // Fallback for browsers without Connection API
        setQuality('good');
        setLabel('Good');
      }
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (conn) {
        conn.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  const getStatusConfig = () => {
    switch (quality) {
      case 'good':
        return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Wifi };
      case 'medium':
        return { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: Wifi };
      case 'bad':
        return { color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', icon: Wifi };
      case 'offline':
        return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: WifiOff };
      default:
        return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Wifi };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} transition-colors duration-500`}
    >
      <div className="relative">
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}>
        {label}
      </span>
    </motion.div>
  );
}
