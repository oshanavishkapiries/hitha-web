import { create } from 'zustand';
import { getDoctorApplications } from '../service/functions/admin.service';

export interface AppNotification {
  id: string;
  type: 'DOCTOR_REGISTRATION_REQUEST';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// Stand-in data source: the admin doctor list filtered to pending applications.
// Swap this out for a dedicated notifications endpoint once the backend adds one -
// components only depend on this store's shape, not where the data comes from.
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  hasFetched: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await getDoctorApplications({ status: 'PENDING_APPROVAL', size: 20 });
      const rawData = res.data as any;
      const pending = Array.isArray(rawData)
        ? rawData
        : (rawData && Array.isArray(rawData.content) ? rawData.content : []);

      const previouslyRead = new Set(
        get().notifications.filter(n => n.read).map(n => n.id)
      );

      const nextNotifications: AppNotification[] = pending.map((doc: any) => ({
        id: doc.id,
        type: 'DOCTOR_REGISTRATION_REQUEST',
        title: 'New Doctor Registration Request',
        message: `${doc.firstName} ${doc.lastName} applied to join as ${doc.category ? doc.category.replace(/_/g, ' ') : 'a practitioner'}.`,
        createdAt: doc.createdAt,
        read: previouslyRead.has(doc.id),
      }));

      set({ notifications: nextNotifications, isLoading: false, hasFetched: true });
    } catch {
      set({ isLoading: false, hasFetched: true });
    }
  },

  markAsRead: (id: string) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),

  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
  })),
}));
