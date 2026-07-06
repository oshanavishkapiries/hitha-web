"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Stethoscope, LogOut, Award, ShieldCheck } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import Logo from './Logo';

interface DoctorNavbarProps {
  onLogout?: () => void;
  docSlmc?: string;
  docCategory?: string;
}

export default function DoctorNavbar({ onLogout, docSlmc = "9321", docCategory = "Clinical Psychologist" }: DoctorNavbarProps) {
  const pathname = usePathname() || "";
  const isLogin = pathname === '/doctor/login';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigateTo('/doctor/login');
    }
  };

  return (
    <nav className="bg-white border-b border-hairline sticky top-0 z-40 text-forest shadow-resting" id="doctor-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16 items-center">
          
          {/* Centered Logo */}
          <Logo theme="dark" id="doctor-nav-logo-btn" />

        </div>
      </div>
    </nav>
  );
}
