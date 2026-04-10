'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(238,242,255,0.6), white 50%, rgba(236,254,255,0.4))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-160px', right: '-160px', width: '400px', height: '400px', background: 'rgba(199,210,254,0.25)', borderRadius: '50%', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '400px', height: '400px', background: 'rgba(165,243,252,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
          <img src="/main-logo.png" alt="DotScale" style={{ width: '44px', height: '44px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            <span className="gradient-text">DotScale</span> Ranker
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}
