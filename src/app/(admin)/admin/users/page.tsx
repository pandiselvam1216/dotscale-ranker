'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Edit3,
  X,
  Loader2,
  Clock,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  last_seen_at: string;
  search_count: number;
  total_tokens: number;
  is_online: boolean;
  last_active: string;
  total_session_seconds: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [viewActivityUser, setViewActivityUser] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<{ searches: any[]; apiLogs: any[] }>({ searches: [], apiLogs: [] });
  const [loadingActivity, setLoadingActivity] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 30 seconds for live status
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewActivity = async (user: UserProfile) => {
    setViewActivityUser(user);
    setLoadingActivity(true);
    try {
      const res = await fetch(`/api/admin/users/activity?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserActivity(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleBlock = async (userId: string, block: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action: block ? 'block' : 'unblock' }),
    });
    fetchUsers();
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setSaving(true);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: editUser.id,
        action: 'update',
        data: { full_name: editName, role: editRole },
      }),
    });
    setSaving(false);
    setEditUser(null);
    fetchUsers();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const liveCount = users.filter((u) => u.is_online).length;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[Poppins]">User Management</h1>
          <p className="text-gray-500 mt-1">
            {users.length} total users ·{' '}
            <span className="text-emerald-600 font-medium">
              {liveCount} live now
            </span>
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-sm w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Searches</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">API Usage</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Time Spent</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Last Active</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="shimmer h-10 w-48" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-20" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-12" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-16" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-16" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-20" /></td>
                    <td className="px-6 py-4"><div className="shimmer h-6 w-28" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                            {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                          </div>
                          {u.is_online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full pulse-live" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {u.is_online ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                            <Wifi className="w-3 h-3" /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                            <WifiOff className="w-3 h-3" /> Offline
                          </span>
                        )}
                        {u.is_blocked && (
                          <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full w-fit">
                            Blocked
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold">{u.search_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {u.total_tokens.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatDuration(u.total_session_seconds)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(u.last_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewActivity(u)}
                          className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View Activity"
                        >
                          <Search className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setEditName(u.full_name);
                            setEditRole(u.role);
                          }}
                          className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleBlock(u.id, !u.is_blocked)}
                          className={`p-2 rounded-lg transition-colors ${
                            u.is_blocked
                              ? 'hover:bg-emerald-50'
                              : 'hover:bg-red-50'
                          }`}
                          title={u.is_blocked ? 'Unblock' : 'Block'}
                        >
                          {u.is_blocked ? (
                            <Shield className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ShieldOff className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setEditUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-[Poppins]">Edit User</h3>
                <button onClick={() => setEditUser(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={editUser.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Activity Modal */}
        {viewActivityUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setViewActivityUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold font-[Poppins]">User Activity</h3>
                  <p className="text-sm text-gray-500 mt-1">{viewActivityUser.email}</p>
                </div>
                <button onClick={() => setViewActivityUser(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                {loadingActivity ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                    <p className="text-gray-500">Loading activity...</p>
                  </div>
                ) : userActivity.searches.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No searches yet</h3>
                    <p className="text-gray-500 text-sm mt-1">This user hasn't generated any searches.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Searches</h4>
                    {userActivity.searches.map((search) => (
                      <div key={search.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{search.keyword}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(search.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-md">
                          Search
                        </div>
                      </div>
                    ))}
                    
                    {userActivity.apiLogs.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent API Consumptions</h4>
                        <div className="space-y-3">
                          {userActivity.apiLogs.slice(0, 10).map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                              <span className="text-gray-600 font-mono text-xs">{log.endpoint}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                                <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                                  <Zap className="w-3 h-3" /> {log.tokens_used}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
