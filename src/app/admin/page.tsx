"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { navigateTo } from '../../utils/navigation';

export default function AdminIndexPage() {
  useEffect(() => {
    const accessToken = Cookies.get("accesstoken");
    const role = Cookies.get("user_role");
    
    if (accessToken && role === "ADMIN") {
      navigateTo('/admin/dashboard');
    } else {
      navigateTo('/admin/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#0B1E17] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
