"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Shield, RefreshCw, LogOut, Terminal, Users, Search } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

interface AdminNavbarProps {
  isRealDocsLoading?: boolean;
  onLogout?: () => void;
}

export default function AdminNavbar({ isRealDocsLoading = false, onLogout }: AdminNavbarProps) {
  const pathname = usePathname() || "";
  const isLogin = pathname === '/admin/login';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigateTo('/admin/login');
    }
  };

  return (
    <nav
      className={`sticky top-0 z-40 shadow-resting ${isLogin ? 'bg-white border-b border-hairline text-forest' : 'bg-ink border-b border-[#1A3429] text-white'}`}
      id="admin-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex h-16 items-center ${isLogin ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <Logo theme={isLogin ? 'dark' : 'light'} id="admin-nav-logo-btn" />
          </div>

          {!isLogin && (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Search doctor"]') || document.querySelector('input[type="text"]');
                  if (searchInput) {
                    (searchInput as HTMLInputElement).focus();
                  } else {
                    alert("Click on the SLMC Verifications tab to search doctors directly.");
                  }
                }}
                className="p-2 hover:bg-[#152B22] rounded-full transition-all text-sprout/80 hover:text-white cursor-pointer focus:outline-none"
                title="Search Dashboard"
                id="admin-nav-search-btn"
              >
                <Search className="w-4 h-4 text-mint" />
              </button>

              <NotificationBell />

              <div className="flex items-center space-x-2.5 pl-2 border-l border-[#1A3429]" id="admin-nav-profile">
                <div className="w-8 h-8 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center font-bold text-mint text-xs">
                  AD
                </div>
                <div className="hidden md:block text-left">
                  <h5 className="text-[11px] font-bold text-white leading-tight">Admin Root</h5>
                  <span className="text-[9px] text-sprout/50 block leading-none">admin@hitha.lk</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-950/20 hover:text-red-300 rounded-full transition-all cursor-pointer text-sprout/50 focus:outline-none"
                title="Sign Out"
                id="admin-nav-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
