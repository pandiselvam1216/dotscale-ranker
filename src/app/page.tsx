'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const [displayText, setDisplayText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const fullText = 'best cotton clothes';

  useEffect(() => {
    let index = 0;
    let timer: NodeJS.Timeout;

    const typeText = () => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
        timer = setTimeout(typeText, 100);
      } else {
        // Wait a bit then show results
        setTimeout(() => setShowResults(true), 600);
      }
    };

    const initialDelay = setTimeout(typeText, 1000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/main-logo.png" alt="DotScale" style={{ width: '36px', height: '36px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
              <span className="gradient-text">DotScale</span> Ranker
            </span>
          </Link>
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}>Features</a>
            <a href="#demo" style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}>Demo</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/login"
              style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563', padding: '8px 16px', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '10px 24px', borderRadius: '100px', textDecoration: 'none', boxShadow: '0 2px 8px -2px rgba(99,102,241,0.4)', transition: 'all 0.2s' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '140px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }} className="px-4 sm:px-6 lg:px-8">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(238,242,255,0.5), white 50%, rgba(236,254,255,0.3))' }} />
        <div style={{ position: 'absolute', top: '80px', left: '40px', width: '300px', height: '300px', background: 'rgba(199,210,254,0.3)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '400px', height: '400px', background: 'rgba(165,243,252,0.2)', borderRadius: '50%', filter: 'blur(80px)' }} />
        
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}
        >
          <motion.div variants={fadeInUp} className="gemini-badge" style={{ marginBottom: '28px' }}>
            <img src="/gemini-logo.png" alt="Gemini" style={{ width: '16px', height: '16px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span>Powered by Gemini flash</span>
            <span style={{ color: '#a5b4fc', margin: '0 2px' }}>|</span>
            <span>Developed by NeuraGlobal</span>
            <img src="/neuraglobal-logo.png" alt="NeuraGlobal" style={{ width: '16px', height: '16px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </motion.div>
          
          <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', lineHeight: 1.15, marginBottom: '24px', color: '#111827' }}>
            Track Rankings Like a{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">Search Engine</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.8 }}>
            DotScale Ranker replicates real search engine behavior to validate your rankings, analyze SERP positions, and provide actionable SEO intelligence.
          </motion.p>
          
          <motion.div variants={fadeInUp} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <Link
              href="/signup"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 600, padding: '16px 32px', borderRadius: '100px', textDecoration: 'none', boxShadow: '0 4px 14px -3px rgba(99,102,241,0.5)', fontSize: '1rem', transition: 'all 0.2s' }}
            >
              Start Free Trial
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
            <a
              href="#demo"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: 500, padding: '16px 32px', borderRadius: '100px', border: '1.5px solid #e5e7eb', textDecoration: 'none', fontSize: '1rem', transition: 'all 0.2s', background: 'white' }}
            >
              See it in Action
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </a>
          </motion.div>

          <motion.div variants={fadeInUp} style={{ marginTop: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#6b7280' }}><Check style={{ width: '16px', height: '16px', color: '#10b981' }} /> No credit card needed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#6b7280' }}><Check style={{ width: '16px', height: '16px', color: '#10b981' }} /> 100 free searches</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#6b7280' }}><Check style={{ width: '16px', height: '16px', color: '#10b981' }} /> Cancel anytime</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 lg:px-8" style={{ padding: '96px 0', background: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Features</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginTop: '12px', marginBottom: '16px', color: '#111827' }}>
              Everything You Need for SEO Intelligence
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.0625rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              A complete toolkit for SEO professionals to simulate, validate, and optimize search rankings.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {[
              { icon: Search, title: 'SERP Simulation', desc: 'AI-powered search engine that generates realistic top 20 results for any keyword.', bg: '#eef2ff', iconColor: '#6366f1' },
              { icon: TrendingUp, title: 'Rank Validation', desc: 'Instantly check if your URL appears in search results with position tracking.', bg: '#ecfdf5', iconColor: '#10b981' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track search history, keyword trends, and ranking status over time.', bg: '#ecfeff', iconColor: '#06b6d4' },
              { icon: Globe, title: 'Semantic Matching', desc: 'Advanced fuzzy and semantic URL matching for accurate rank detection.', bg: '#f5f3ff', iconColor: '#8b5cf6' },
              { icon: Zap, title: 'Blazing Fast', desc: 'Cached results and optimized API calls for instant search responses.', bg: '#fffbeb', iconColor: '#f59e0b' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access, rate limiting, and secure server-side API key handling.', bg: '#fff1f2', iconColor: '#ef4444' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="feature-card"
              >
                <div className="feature-icon" style={{ background: feature.bg }}>
                  <feature.icon style={{ width: '24px', height: '24px', color: feature.iconColor }} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" style={{ padding: '96px 0', background: 'linear-gradient(180deg, #f9fafb, white)' }} className="px-4 sm:px-6 lg:px-8">
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Demo</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginTop: '12px', marginBottom: '16px', color: '#111827' }}>
              See DotScale Ranker in Action
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ borderRadius: '20px', border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)', overflow: 'hidden' }}
          >
            {/* Mock Browser Bar */}
            <div style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399' }} />
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '6px 16px', fontSize: '0.875rem', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                dotscale-ranker.app/search
              </div>
            </div>

            {/* Mock SERP */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '14px 20px', color: '#374151', fontWeight: 500, fontSize: '0.9375rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span>&quot;{displayText}&quot;</span>
                  {!showResults && (
                    <motion.div
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      style={{ width: '2px', height: '18px', background: '#6366f1', marginLeft: '2px' }}
                    />
                  )}
                </div>
                <motion.div 
                  animate={showResults ? { scale: [1, 0.95, 1], backgroundColor: ['#6366f1', '#4338ca', '#6366f1'] } : {}}
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', padding: '14px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', cursor: 'pointer' }}
                >
                  <Search style={{ width: '16px', height: '16px' }} /> Search
                </motion.div>
              </div>

              {/* Mock Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <AnimatePresence>
                  {showResults && (
                    <>
                      {[
                        { pos: 1, title: 'Premium Cotton Clothing — Best Quality Collection', url: 'https://www.cottonworld.com/collections/best-cotton', snippet: 'Discover our finest cotton clothing collection. 100% organic cotton, sustainably sourced.' },
                        { pos: 2, title: '15 Best Cotton Clothes Brands in 2025 — StyleGuide', url: 'https://www.styleguide.com/best-cotton-brands', snippet: 'Our experts reviewed and ranked the top 15 cotton clothing brands for every wardrobe.' },
                        { pos: 3, title: 'Best Cotton Fabric Clothes for Summer — Amazon', url: 'https://www.amazon.com/best-cotton-clothes', snippet: 'Shop the best cotton clothes on Amazon. Free shipping on eligible orders.' },
                      ].map((result, i) => (
                        <motion.div
                          key={result.pos}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="serp-result"
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: '#f3f4f6', padding: '2px 10px', borderRadius: '100px', fontWeight: 600 }}>#{result.pos}</span>
                            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>{result.url}</span>
                          </div>
                          <h3 style={{ fontSize: '1.0625rem', color: '#4338ca', fontWeight: 500, marginBottom: '4px' }}>
                            {result.title}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{result.snippet}</p>
                        </motion.div>
                      ))}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '12px 0' }}
                      >
                        ... and 17 more results
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0' }} className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #4f46e5, #4338ca)', borderRadius: '28px', padding: '64px 48px', boxShadow: '0 25px 50px -12px rgba(79,70,229,0.3)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: 'white', marginBottom: '20px', lineHeight: 1.2 }}>
              Ready to Master Your Rankings?
            </h2>
            <p style={{ color: 'rgba(199,210,254,0.9)', fontSize: '1.0625rem', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.7 }}>
              Join thousands of SEO professionals using DotScale Ranker to validate and improve their search rankings.
            </p>
            <Link
              href="/signup"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#4338ca', fontWeight: 700, padding: '16px 32px', borderRadius: '100px', textDecoration: 'none', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.15)', fontSize: '1rem', transition: 'all 0.2s' }}
            >
              Start Your Free Trial
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #f3f4f6', padding: '48px 0', background: 'white' }} className="px-4 sm:px-6 lg:px-8">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#111827' }}>DotScale Ranker</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            © 2025 DotScale Ranker. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
