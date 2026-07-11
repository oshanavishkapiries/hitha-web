"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import {
  LogOut,
  RefreshCw,
  UserCircle2,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import {
  useDoctorSummary,
  useDoctorProfile,
  useUpdateDoctorStatus
} from '../../../lib/service/query/useDoctor';
import { getApiErrorMessage } from '../../../utils/errors';
import { useAlert } from '../../../context/AlertContext';

export default function DoctorDashboard() {
  const [isActive, setIsActive] = useState(true);
  const { showAlert } = useAlert();

  // React Query server integrations
  const { data: realSummary, isLoading: isSummaryLoading, error: summaryError } = useDoctorSummary();
  const { data: realProfile, isLoading: isProfileLoading, error: profileError } = useDoctorProfile();
  const updateStatusMutation = useUpdateDoctorStatus();

  // Surface non-auth data-fetch errors (real auth failures are handled centrally by the axios interceptor)
  useEffect(() => {
    if (summaryError || profileError) {
      showAlert(`API Error: ${getApiErrorMessage(summaryError || profileError, 'Failed to load dashboard data.')}`, "error");
    }
  }, [summaryError, profileError]);

  // Automatically enable server status status if doctor summary is loaded
  useEffect(() => {
    if (realSummary) {
      setIsActive(realSummary.status === "ACTIVE");
    }
  }, [realSummary]);

  // Safety net: if the profile is incomplete, force complete profile flow
  useEffect(() => {
    if (realProfile && realProfile.isProfileComplete === false) {
      navigateTo('/doctor/complete-profile');
    }
  }, [realProfile]);

  // Toggle status accepted
  const handleToggleActive = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    try {
      await updateStatusMutation.mutateAsync(nextState ? "ACTIVE" : "PAUSED");
      showAlert(`Status updated to ${nextState ? "Online" : "Offline"} successfully.`, "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to update status on server.')}`, "error");
      setIsActive(isActive); // Revert state
    }
  };

  // Render premium loading skeleton
  if (isSummaryLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
            {/* Banner Skeleton */}
            <div className="bg-[#142B22]/10 h-44 rounded-2xl md:rounded-3xl border border-hairline" />
            
            {/* Card Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-hairline h-48" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Extract metadata
  const docName = realSummary
    ? `Dr. ${realSummary.firstName}`
    : "Dr. Kaveesh";

  const docSlmc = realSummary
    ? realSummary.slmcLicenseNumber || "9321"
    : "9321";

  const docCategory = realSummary && realSummary.category
    ? realSummary.category.replace(/_/g, " ")
    : "Clinical Psychologist";

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Banner - Highly Mobile Responsive & Visually Enhanced */}
          <div 
            className="text-white p-5 sm:p-8 rounded-xl md:rounded-2xl shadow-resting flex flex-col md:flex-row justify-between items-stretch md:items-center gap-5 sm:gap-6 relative overflow-hidden border border-[#2B4E41]/30 animate-fade-in"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(20, 43, 34, 0.96), rgba(30, 75, 58, 0.85)), url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FCB84] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
            
            <div className="relative z-10 w-full md:max-w-xl text-left space-y-0.5">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-bold break-words leading-tight tracking-wide">
                Ayubowan, {docName}
              </h1>
              <p className="text-[10px] sm:text-xs text-sprout/80 font-medium">Welcome back to your digital sanctuary dashboard.</p>
            </div>

            {/* Quick Availability Switch & Logout */}
            <div className="flex flex-row md:flex-col lg:flex-row items-center justify-between sm:justify-start md:items-stretch lg:items-center gap-3 relative z-10 w-full md:w-auto shrink-0">
              <div className="bg-[#0B1E17] border border-[#2B4E41] px-3.5 py-2 rounded-2xl flex items-center justify-between gap-3 text-sm flex-1 md:flex-none">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-mint animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-sprout">
                    {isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
                <button
                  onClick={handleToggleActive}
                  disabled={updateStatusMutation.isPending}
                  className="bg-white hover:bg-cream text-forest text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  id="doctor-status-toggle"
                >
                  Change
                </button>
              </div>

              <button
                onClick={() => navigateTo('/doctor/login')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 text-xs font-bold shrink-0"
                id="doctor-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">Logout</span>
              </button>
            </div>
          </div>

          {/* Dashboard Hub Cards - Active Profile Settings Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigateTo('/doctor/profile')}
              className="bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated p-6 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between group min-h-48 h-auto"
              id="doc-card-profile"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <UserCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-sans">
                    Configure
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-forest text-base mb-1 group-hover:text-[#8FCB84] transition-colors">
                    Profile & Settings
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Update your professional identity, bio, list qualifications, and languages for the public directories.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-forest font-bold group-hover:underline">
                <span>Manage Profile</span>
                <ArrowLeft className="w-3.5 h-3.5 ml-1 rotate-180" />
              </div>
            </button>

            <button
              onClick={() => navigateTo('/doctor/blogs')}
              className="bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated p-6 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between group min-h-48 h-auto"
              id="doc-card-blogs"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-mint/20 text-forest rounded-xl group-hover:bg-mint/30 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-forest bg-mint/20 px-2.5 py-0.5 rounded-full font-sans">
                    Create
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-forest text-base mb-1 group-hover:text-[#8FCB84] transition-colors">
                    Wellness Blog
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Write and publish mental health articles for patients, from draft through admin review.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-forest font-bold group-hover:underline">
                <span>Manage Articles</span>
                <ArrowLeft className="w-3.5 h-3.5 ml-1 rotate-180" />
              </div>
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
