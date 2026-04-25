'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  History,
  Bell,
  LogOut,
  TrendingUp,
  Shield,
  Menu,
  X,
  ChevronRight,
  Target,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import NetworkStatus from '@/components/NetworkStatus';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/auditor', icon: Target, label: 'Auditor' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markAsRead } = useNotificationStore();

  const loadUserData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profileError) throw profileError;

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          });
        }

        // Load notifications
        const { data: notifs, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${authUser.id},is_broadcast.eq.true`)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (notifs) {
          setNotifications(notifs);
        }

        // Track session activity
        await supabase.from('user_sessions').upsert({
          user_id: authUser.id,
          last_active_at: new Date().toISOString(),
          is_active: true,
        }, { onConflict: 'user_id' }).select();

        // Update last_seen_at
        await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', authUser.id);
      }
    } catch (err) {
      console.error('Error loading layout data:', err);
      // Fail silently for user experience, but log for debugging
    }
  }, [setUser, setNotifications]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Heartbeat for session tracking
  useEffect(() => {
    const interval = setInterval(async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', authUser.id);
      }
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('user_id', authUser.id).eq('is_active', true);
    }
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleMarkRead = async (id: string) => {
    markAsRead(id);
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  return (
    <div className="h-screen bg-neutral-50 flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.02),transparent_50%)] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 z-30">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/main-logo.png" alt="DotScale" className="w-9 h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-lg font-bold font-[Poppins]">
              <span className="gradient-text">DotScale</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.startsWith('/admin')
                ? 'bg-amber-50 text-amber-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100/50">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-100">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate tracking-tight">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate font-medium uppercase tracking-wider">{user?.role || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <img src="/main-logo.png" alt="DotScale" className="w-9 h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="text-lg font-bold font-[Poppins] gradient-text">DotScale</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <Shield className="w-5 h-5" />
                    Admin Panel
                  </Link>
                )}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/50 rounded-2xl border border-gray-100/50 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-100">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate tracking-tight">{user?.full_name || 'User'}</p>
                    <p className="text-[11px] text-gray-500 truncate font-medium uppercase tracking-wider">{user?.role || 'Member'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 relative flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/60 backdrop-blur-md border-b border-gray-100/80 h-16 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <NetworkStatus />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 border ${
                notifOpen ? 'bg-white shadow-sm border-gray-200' : 'hover:bg-gray-100 active:scale-95 border-transparent'
              }`}
            >
              <Bell className={`w-5 h-5 transition-colors ${notifOpen ? 'text-indigo-600' : 'text-gray-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-rose-500 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/50' : ''
                            }`}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
