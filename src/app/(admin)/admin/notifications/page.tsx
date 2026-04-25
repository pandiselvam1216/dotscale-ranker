'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  User,
  Loader2,
  CheckCircle2,
  Megaphone,
} from 'lucide-react';

interface UserOption {
  id: string;
  email: string;
  full_name: string;
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [mode, setMode] = useState<'single' | 'broadcast'>('single');
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers((data.users || []).map((u: UserOption) => ({ id: u.id, email: u.email, full_name: u.full_name })));
    }
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (mode === 'single' && !selectedUser) return;

    setSending(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: mode === 'single' ? selectedUser : undefined,
          title,
          message,
          is_broadcast: mode === 'broadcast',
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTitle('');
        setMessage('');
        setSelectedUser('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold font-[Poppins]">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Send notifications to individual users or broadcast to everyone.</p>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 flex gap-2 mb-6">
        <button
          onClick={() => setMode('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            mode === 'single'
              ? 'bg-amber-50 text-amber-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" />
          Single User
        </button>
        <button
          onClick={() => setMode('broadcast')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            mode === 'broadcast'
              ? 'bg-amber-50 text-amber-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Broadcast All
        </button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6"
      >
        <form onSubmit={handleSend} className="space-y-5">
          {mode === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-sm"
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {(u.full_name || 'Unnamed').slice(0, 20)}{u.full_name && u.full_name.length > 20 ? '...' : ''} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'broadcast' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This notification will be sent to <strong>all {users.length} users</strong>.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            />
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
            >
              <CheckCircle2 className="w-4 h-4" />
              Notification sent successfully!
            </motion.div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {mode === 'broadcast' ? 'Broadcast to All Users' : 'Send Notification'}
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Tips */}
      <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Tips</span>
        </div>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>Notifications are delivered in real-time to user dashboards</li>
          <li>Broadcast messages will be sent to all registered users</li>
          <li>Keep messages concise and actionable for best engagement</li>
        </ul>
      </div>
    </div>
  );
}
