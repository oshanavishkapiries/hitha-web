"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../Logo';
import NotificationBell from '../NotificationBell';
import { navigateTo } from '../../utils/navigation';
import {
  IconTrendingUp,
  IconStethoscope,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconArticle,
} from '@tabler/icons-react';
import { useDoctorApplications, usePendingBlogs } from '../../lib/service/query/useAdmin';

interface AdminSidebarShellProps {
  activeNav: 'overview' | 'doctors' | 'blogs';
  title: string;
  subtitle: string;
  titleAction?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminSidebarShell({
  activeNav,
  title,
  subtitle,
  titleAction,
  headerActions,
  children,
}: AdminSidebarShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { data: realDocs } = useDoctorApplications();
  const pendingCount = (realDocs || []).filter((doc: any) => doc.status === 'PENDING_VERIFICATION').length;

  const { data: pendingBlogs } = usePendingBlogs();
  const pendingBlogCount = (pendingBlogs || []).length;

  return (
    <div className="bg-cream min-h-screen flex flex-row overflow-hidden" id="admin-dashboard-container">

      {/* Left Column (Sidebar) */}
      <aside className={`bg-ink text-white shrink-0 flex flex-col border-r border-[#1C3A54] transition-all duration-300 h-screen overflow-y-auto ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`} id="admin-sidebar">
        {/* Logo Element (Top section aligned with right header) */}
        <div className="h-16 flex items-center px-6 border-b border-[#1C3A54] shrink-0 justify-between" id="admin-sidebar-logo-container">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Logo theme="light" id="admin-sidebar-logo" className="text-xl" />
              </motion.div>
            ) : (
              <motion.button
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigateTo('/')}
                className="font-display font-bold text-xl text-mint mx-auto cursor-pointer focus:outline-none"
                id="admin-sidebar-logo-collapsed"
              >
                H
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Navigation (Middle section) */}
        <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
          {/* Nav Menu */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => navigateTo('/admin/dashboard')}
              className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all duration-300 cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
              } ${
                activeNav === 'overview' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
              }`}
              id="admin-tab-overview"
              title="Overview & Analytics"
            >
              <IconTrendingUp className="w-4 h-4 text-mint shrink-0" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, delay: 0.03 }}
                    className="truncate"
                  >
                    Overview & Analytics
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="relative">
              <button
                onClick={() => navigateTo('/admin/doctors')}
                className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all duration-300 cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                } ${
                  activeNav === 'doctors' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-doctors"
                title="Doctor Management"
              >
                <IconStethoscope className="w-4 h-4 text-mint shrink-0" />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="flex-1 flex justify-between items-center min-w-0"
                    >
                      <span className="truncate">Doctor Registry</span>
                      {pendingCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                          {pendingCount}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              {isSidebarCollapsed && pendingCount > 0 && (
                <span className="absolute top-1 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => navigateTo('/admin/blogs')}
                className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all duration-300 cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                } ${
                  activeNav === 'blogs' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-blogs"
                title="Blogs"
              >
                <IconArticle className="w-4 h-4 text-mint shrink-0" />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="flex-1 flex justify-between items-center min-w-0"
                    >
                      <span className="truncate">Blogs</span>
                      {pendingBlogCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                          {pendingBlogCount}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              {isSidebarCollapsed && pendingBlogCount > 0 && (
                <span className="absolute top-1 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#152B22]">
          <button
            onClick={() => navigateTo('/admin/login')}
            className={`bg-[#152B22] hover:bg-[#1C3A2E] text-red-300 text-xs font-bold transition-all duration-300 cursor-pointer flex items-center border border-[#2B4E41] ${
              isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-full' : 'py-2.5 px-4 rounded-xl justify-center space-x-1.5 w-full'
            }`}
            id="admin-sidebar-logout"
            title="Sign Out"
          >
            <IconLogout className="w-3.5 h-3.5 shrink-0" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, delay: 0.23 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* Right Column (Header + Dashboard Content) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden" id="admin-main-column">

        {/* Top Header of Right Column */}
        <header className="h-16 bg-white border-b border-hairline flex items-center justify-between px-6 shrink-0" id="admin-main-header">
          {/* Header Left (Collapse button '<' / '>') */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 border border-hairline rounded-lg bg-white text-ink hover:bg-cream hover:text-forest transition-all cursor-pointer focus:outline-none flex items-center justify-center shadow-sm"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              id="admin-sidebar-toggle-btn"
            >
              {isSidebarCollapsed ? (
                <IconChevronRight className="w-4 h-4 text-ink" />
              ) : (
                <IconChevronLeft className="w-4 h-4 text-ink" />
              )}
            </button>
          </div>

          {/* Header Right (search, profile) */}
          <div className="flex items-center space-x-6">
            {headerActions}

            <NotificationBell variant="light" />

            {/* Profile Element */}
            <div className="flex items-center space-x-2.5 pl-4 border-l border-hairline" id="admin-header-profile">
              <div className="w-8 h-8 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center font-bold text-mint text-xs">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <h5 className="text-[11px] font-bold text-ink leading-tight">Admin Root</h5>
                <span className="text-[9px] text-ink-soft block leading-none">admin@hitha.lk</span>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Dashboard Core Display Panel */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto bg-cream" id="admin-main-content">

          {/* Top Info Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline pb-4" id="admin-title-row">
            <div>
              <h1 className="text-2xl font-display font-bold text-forest">{title}</h1>
              <p className="text-xs text-ink-soft mt-1">{subtitle}</p>
            </div>
            {titleAction}
          </div>

          {children}

        </main>
      </div>
    </div>
  );
}
