"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { 
  LogOut, 
  RefreshCw,
  UserCircle2,
  ArrowLeft
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

  // Redirect to login if user is unauthorized/not logged in
  useEffect(() => {
    if (summaryError || profileError) {
      console.error("Dashboard authorization check failed:", summaryError || profileError);
      navigateTo('/doctor/login');
    }
  }, [summaryError, profileError]);

  // Automatically enable server status status if doctor summary is loaded
  useEffect(() => {
    if (realSummary) {
      setIsActive(realSummary.status === "ONLINE");
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
      await updateStatusMutation.mutateAsync(nextState ? "ONLINE" : "OFFLINE");
      showAlert(`Status updated to ${nextState ? "ONLINE" : "OFFLINE"} successfully.`, "success");
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
          
          {/* Header Banner - Highly Mobile Responsive */}
          <div className="bg-gradient-to-r from-[#142B22] to-[#1E4B3A] text-white p-5 sm:p-8 rounded-2xl md:rounded-3xl shadow-resting flex flex-col md:flex-row justify-between items-stretch md:items-center gap-5 sm:gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FCB84] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
            
            <div className="relative z-10 w-full md:max-w-xl text-left">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-bold break-words leading-tight">
                Ayubowan, {docName}
              </h1>
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
          </div>

        </div>
      </div>
    </AppShell>
  );
}
