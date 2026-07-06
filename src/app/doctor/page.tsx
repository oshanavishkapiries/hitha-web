"use client";

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { navigateTo } from '../../utils/navigation';

export default function DoctorIndexPage() {
  useEffect(() => {
    const accessToken = Cookies.get("accesstoken");
    const role = Cookies.get("user_role");
    
    if (accessToken && role === "DOCTOR") {
      navigateTo('/doctor/dashboard');
    } else {
      navigateTo('/doctor/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
