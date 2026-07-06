"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Shield, RefreshCw, LogOut, Terminal, Users, Search } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import Logo from './Logo';

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
    <nav className="bg-[#0B1E17] border-b border-[#1A3429] sticky top-0 z-40 text-white shadow-resting" id="admin-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo on the left (position start) */}
          <div className="flex items-center">
            <Logo theme="light" id="admin-nav-logo-btn" />
            <span className="ml-3 hidden sm:inline-block px-2.5 py-0.5 bg-mint/10 text-mint border border-mint/20 rounded-md text-[10px] uppercase font-bold tracking-wider">
              Admin Portal
            </span>
          </div>

          {/* Search and Profile on the right (position end) */}
          {!isLogin && (
            <div className="flex items-center space-x-4">
              {/* Search Trigger Button */}
              <button 
                onClick={() => {
                  // Focus the search input on the dashboard page if present
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

              {/* Profile Element */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-[#1A3429]" id="admin-nav-profile">
                <div className="w-8 h-8 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center font-bold text-mint text-xs">
                  AD
                </div>
                <div className="hidden md:block text-left">
                  <h5 className="text-[11px] font-bold text-white leading-tight">Admin Root</h5>
                  <span className="text-[9px] text-sprout/50 block leading-none">admin@hitha.lk</span>
                </div>
              </div>

              {/* Sign Out Shortcut */}
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
