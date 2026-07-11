"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';
import DoctorNavbar from './DoctorNavbar';
import MyAppointmentsModal from './MyAppointmentsModal';
import Footer from './Footer';
import { navigateTo } from '../utils/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [showAppointments, setShowAppointments] = useState(false);
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
        pathname === '/admin/dashboard' || pathname === '/admin/doctors' || pathname.startsWith('/admin/blogs') || pathname === '/admin/team' ? null : (
          <AdminNavbar onLogout={() => handleLogout('admin')} />
        )
      ) : isDoctorRoute ? (
        <DoctorNavbar onLogout={() => handleLogout('doctor')} />
      ) : (
        <Navbar 
          onOpenAppointments={() => setShowAppointments(true)}
          onOpenBlogs={() => navigateTo('/blog')}
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



      {/* Conditional Professional Footer */}
      {!isAdminRoute && !isDoctorRoute && <Footer />}
    </div>
  );
}
