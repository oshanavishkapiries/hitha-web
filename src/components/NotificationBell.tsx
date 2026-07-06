"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Bell, Stethoscope, CheckCheck } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import { useNotificationStore } from '../lib/store/notificationStore';

function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationBellProps {
  variant?: 'dark' | 'light';
}

export default function NotificationBell({ variant = 'dark' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore(state => state.notifications);
  const isLoading = useNotificationStore(state => state.isLoading);
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setIsOpen(false);
    navigateTo(`/admin/requests?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2 rounded-full transition-all cursor-pointer focus:outline-none ${
          variant === 'dark'
            ? 'hover:bg-[#152B22] text-sprout/80 hover:text-white'
            : 'bg-[#FAF9F5] border border-[#EBE8DF] hover:bg-cream text-[#0B1E17] hover:text-forest'
        }`}
        title="Notifications"
        id="admin-notification-bell"
      >
        <Bell className="w-4 h-4 text-mint" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-mono font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white text-[#0B1E17] rounded-2xl border border-hairline shadow-elevated z-50"
          id="admin-notification-panel"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline sticky top-0 bg-white rounded-t-2xl">
            <h4 className="text-xs font-display font-bold text-forest">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[10px] font-bold text-forest hover:underline cursor-pointer"
                id="admin-notification-mark-all-read"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {isLoading && notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-soft font-semibold">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-soft italic">No new notifications.</div>
          ) : (
            <ul>
              {notifications.map(notification => (
                <li key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`w-full text-left px-4 py-3 border-b border-hairline last:border-b-0 hover:bg-cream/60 transition-colors cursor-pointer flex gap-2.5 ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5 text-forest" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-forest truncate">{notification.title}</p>
                      <p className="text-[11px] text-ink-soft mt-0.5 line-clamp-2">{notification.message}</p>
                      <span className="text-[10px] text-ink-soft/70 font-mono mt-1 block">{timeAgo(notification.createdAt)}</span>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
