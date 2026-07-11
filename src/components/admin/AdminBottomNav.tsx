"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cookies from 'js-cookie';
import { navigateTo } from '../../utils/navigation';
import {
  IconTrendingUp,
  IconStethoscope,
  IconArticle,
  IconUsersGroup,
  IconLogout,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { useDoctorApplications, usePendingBlogs } from '../../lib/service/query/useAdmin';

type AdminNavKey = 'overview' | 'doctors' | 'blogs' | 'team';

interface AdminNavItem {
  key: AdminNavKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface AdminBottomNavProps {
  activeNav: AdminNavKey;
}

function QuickNavSlot({ item, isActive, onClick }: { item: AdminNavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 h-full cursor-pointer"
      id={`admin-bottomnav-${item.key}`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-mint' : 'text-sprout/60'}`} />
      <span className={`text-[9px] font-semibold ${isActive ? 'text-mint' : 'text-sprout/60'}`}>
        {item.label.split(' ')[0]}
      </span>
      {!!item.badge && item.badge > 0 && (
        <span className="absolute top-1.5 right-1/2 translate-x-3.5 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}

export default function AdminBottomNav({ activeNav }: AdminBottomNavProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsSuperAdmin(Cookies.get('user_role') === 'SUPER_ADMIN');
  }, []);

  const { data: realDocs } = useDoctorApplications();
  const pendingCount = (realDocs || []).filter((doc: any) => doc.status === 'PENDING_VERIFICATION').length;

  const { data: pendingBlogs } = usePendingBlogs();
  const pendingBlogCount = (pendingBlogs || []).length;

  const navItems: AdminNavItem[] = [
    { key: 'overview', label: 'Overview & Analytics', href: '/admin/dashboard', icon: IconTrendingUp },
    { key: 'doctors', label: 'Doctor Registry', href: '/admin/doctors', icon: IconStethoscope, badge: pendingCount },
    { key: 'blogs', label: 'Blogs', href: '/admin/blogs', icon: IconArticle, badge: pendingBlogCount },
    ...(isSuperAdmin
      ? [{ key: 'team' as AdminNavKey, label: 'Admin Team', href: '/admin/team', icon: IconUsersGroup }]
      : []),
  ];

  // Quick-access slots either side of the center hamburger button.
  const quickLeft = navItems.slice(0, 2);
  const quickRight = navItems.slice(2, 4);

  const go = (href: string) => {
    setIsSheetOpen(false);
    navigateTo(href);
  };

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-forest-dark border-t border-forest-divider px-2 pb-[env(safe-area-inset-bottom)]"
        id="admin-bottom-nav"
      >
        <div className="grid grid-cols-5 items-center h-16">
          {quickLeft.map((item) => (
            <QuickNavSlot key={item.key} item={item} isActive={activeNav === item.key} onClick={() => go(item.href)} />
          ))}

          {/* Center hamburger */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsSheetOpen(true)}
              className="h-12 w-12 rounded-full bg-mint text-forest-ink flex items-center justify-center shadow-elevated -translate-y-3 cursor-pointer"
              id="admin-bottomnav-hamburger"
              title="More"
            >
              <IconMenu2 className="w-5 h-5" />
            </button>
          </div>

          {quickRight.map((item) => (
            <QuickNavSlot key={item.key} item={item} isActive={activeNav === item.key} onClick={() => go(item.href)} />
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-forest-dark/60 backdrop-blur-sm"
              id="admin-bottomnav-sheet-backdrop"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl border-t border-hairline shadow-elevated pb-[env(safe-area-inset-bottom)]"
              id="admin-bottomnav-sheet"
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-hairline">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center font-bold text-forest text-xs">
                    AD
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-forest leading-tight">Admin Root</h5>
                    <span className="text-[10px] text-ink-soft block leading-none">admin@hitha.lk</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-cream text-ink-soft cursor-pointer"
                  id="admin-bottomnav-sheet-close"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => go(item.href)}
                      className={`w-full text-left rounded-xl text-sm font-semibold flex items-center space-x-3 px-4 py-3.5 transition-colors cursor-pointer ${
                        isActive ? 'bg-mint/15 text-forest' : 'text-ink-soft hover:bg-cream'
                      }`}
                      id={`admin-bottomnav-sheet-${item.key}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest' : 'text-ink-faint'}`} />
                      <span className="flex-1">{item.label}</span>
                      {!!item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 pt-1 border-t border-hairline">
                <button
                  onClick={() => go('/admin/login')}
                  className="w-full text-left rounded-xl text-sm font-semibold flex items-center space-x-3 px-4 py-3.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  id="admin-bottomnav-sheet-logout"
                >
                  <IconLogout className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
