"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';
import DoctorNavbar from './DoctorNavbar';
import MyAppointmentsModal from './MyAppointmentsModal';
import BlogsModal from './BlogsModal';
import { navigateTo } from '../utils/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [showAppointments, setShowAppointments] = useState(false);
  const [showBlogs, setShowBlogs] = useState(false);
  const pathname = usePathname() || "";

  const isAdminRoute = pathname.startsWith('/admin');
  const isDoctorRoute = pathname.startsWith('/doctor');

  const handleLogout = (role: 'admin' | 'doctor') => {
    Cookies.remove('accesstoken');
    Cookies.remove('user_role');
    if (role === 'admin') {
      navigateTo('/admin/login');
    } else {
      navigateTo('/doctor/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans selection:bg-sprout selection:text-forest">
      {/* Global Section-Specific Navigation Header */}
      {isAdminRoute ? (
        pathname === '/admin/dashboard' ? null : (
          <AdminNavbar onLogout={() => handleLogout('admin')} />
        )
      ) : isDoctorRoute ? (
        <DoctorNavbar onLogout={() => handleLogout('doctor')} />
      ) : (
        <Navbar 
          onOpenAppointments={() => setShowAppointments(true)}
          onOpenBlogs={() => setShowBlogs(true)}
        />
      )}

      {/* Main Page Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Conditional Modals */}
      {showAppointments && (
        <MyAppointmentsModal onClose={() => setShowAppointments(false)} />
      )}

      {showBlogs && (
        <BlogsModal onClose={() => setShowBlogs(false)} />
      )}

      {/* Simple Organic Footer */}
      <footer className="bg-forest text-white border-t border-hairline/20 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="font-display font-bold text-lg text-mint">Hitha (හිත)</span>
              <span className="text-xs text-sprout">| Digital Mental Sanctuary</span>
            </div>
            <p className="text-[11px] text-sprout/60 max-w-sm">
              Sri Lanka's local, privacy-first telehealth directory. Fully compliant with SLMC guidelines & safe trilingual care.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-sprout/70">
            <button
              onClick={() => navigateTo('/')}
              className="hover:text-white transition-colors cursor-pointer"
              id="footer-public-link"
            >
              Public Sanctuary
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => navigateTo('/doctor/login')}
              className="hover:text-white transition-colors cursor-pointer"
              id="footer-doctor-link"
            >
              Doctor Portal
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => navigateTo('/admin/login')}
              className="hover:text-white transition-colors cursor-pointer"
              id="footer-admin-link"
            >
              Admin Portal
            </button>
            <span className="hidden sm:inline">•</span>
            <span>© 2026 Hitha Sri Lanka</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
