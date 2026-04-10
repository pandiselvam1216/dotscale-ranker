import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    });
  },
  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    });
  },
}));
