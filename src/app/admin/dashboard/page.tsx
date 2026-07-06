"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/AppShell';
import Logo from '../../../components/Logo';
import { navigateTo } from '../../../utils/navigation';
import { 
  IconUsers, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconShieldCheck, 
  IconCreditCard, 
  IconActivity, 
  IconSettings, 
  IconSearch, 
  IconTrendingUp, 
  IconDownload, 
  IconLogout, 
  IconCheck, 
  IconX,
  IconFileSpreadsheet,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconStethoscope,
  IconEye,
  IconMail,
  IconPhone,
  IconLanguage,
  IconCertificate,
  IconFileText,
  IconUserCircle
} from '@tabler/icons-react';
import {
  useDoctorApplications,
  useApproveDoctor,
  useRejectDoctor,
  useChangeDoctorStatus,
  useDoctorDetails,
} from '../../../lib/service/query/useAdmin';
import { useAlert } from '../../../context/AlertContext';
import { getApiErrorMessage } from '../../../utils/errors';

// Mock doctors awaiting SLMC verification as fallback/demo
const initialPendingDocs = [
  { id: "1", name: "Dr. Sanduni Alwis", slmc: "SLMC-9321", spec: "Clinical Psychologist", regDate: "2026-07-01", status: "Pending Verification" },
  { id: "2", name: "Dr. Thilina Perera", slmc: "SLMC-8442", spec: "Psychiatrist & Therapist", regDate: "2026-07-03", status: "Pending Verification" },
  { id: "3", name: "Dr. Nimal Fernando", slmc: "SLMC-1205", spec: "Child Behavioral Counselor", regDate: "2026-07-05", status: "Pending Verification" }
];

// Mock escrow payments
const initialEscrowPayments = [
  { id: 101, patient: "Anonymous Patient A", doctor: "Dr. Sanduni Alwis", amount: "LKR 3,500", date: "2026-07-05", status: "Held in Escrow" },
  { id: 102, patient: "Anonymous Patient B", doctor: "Dr. Thilina Perera", amount: "LKR 4,200", date: "2026-07-05", status: "Held in Escrow" },
  { id: 103, patient: "Anonymous Patient C", doctor: "Dr. Kaveesh Alwis", amount: "LKR 3,500", date: "2026-07-04", status: "Released" }
];

export default function AdminDashboard() {
  const { showAlert } = useAlert();
  const [currentTab, setCurrentTab] = useState<'overview' | 'doctors' | 'escrow' | 'config'>('overview');
  const [escrows, setEscrows] = useState(initialEscrowPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // New sub-view selection states
  const [doctorSubView, setDoctorSubView] = useState<'requests' | 'manage'>('manage');
  const [activeActionDocId, setActiveActionDocId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  // Admin search popups visibility states
  const [isDoctorSearchPopupOpen, setIsDoctorSearchPopupOpen] = useState(false);
  const [isEscrowSearchPopupOpen, setIsEscrowSearchPopupOpen] = useState(false);

  // Doctor details popup state
  const [viewDoctorId, setViewDoctorId] = useState<string | null>(null);

  // Pagination state (separate per sub-view)
  const DOCTORS_PAGE_SIZE = 8;
  const [requestsPage, setRequestsPage] = useState(1);
  const [managePage, setManagePage] = useState(1);

  // React Query service integrations
  const { data: realDocs, isLoading: isRealDocsLoading, refetch: refetchRealDocs } = useDoctorApplications();
  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();
  const changeStatusMutation = useChangeDoctorStatus();
  const { data: viewedDoctor, isLoading: isViewedDoctorLoading, isError: isViewedDoctorError } = useDoctorDetails(viewDoctorId);

  // Approve a doctor's registration
  const handleApproveDoc = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      showAlert('Successfully approved doctor profile on secure server.', 'success');
      refetchRealDocs();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to approve doctor status.')}`, 'error');
    }
  };

  // Submit rejection with reason
  const submitRejectDoc = async (id: string) => {
    if (!actionReason.trim()) {
      showAlert('Rejection reason is required.', 'warning');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, reason: actionReason });
      showAlert('Successfully rejected doctor profile.', 'success');
      setActiveActionDocId(null);
      setActionReason('');
      refetchRealDocs();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to reject doctor profile.')}`, 'error');
    }
  };

  // Submit suspension with optional reason
  const submitSuspendDoc = async (id: string) => {
    try {
      await changeStatusMutation.mutateAsync({ 
        id, 
        status: 'SUSPENDED', 
        reason: actionReason || 'Administrative suspension' 
      });
      showAlert('Doctor suspended successfully.', 'success');
      setActiveActionDocId(null);
      setActionReason('');
      refetchRealDocs();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to suspend doctor.')}`, 'error');
    }
  };

  // Handle re-activation
  const handleUnsuspendDoc = async (id: string) => {
    try {
      await changeStatusMutation.mutateAsync({ 
        id, 
        status: 'ACTIVE', 
        reason: 'Re-activated by administrator' 
      });
      showAlert('Doctor activated/unsuspended successfully.', 'success');
      refetchRealDocs();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to activate doctor.')}`, 'error');
    }
  };

  // Handle escrow release
  const handleReleaseEscrow = (id: number, action: 'release' | 'refund') => {
    setEscrows(prev => prev.map(esc => {
      if (esc.id === id) {
        return { ...esc, status: action === 'release' ? 'Released to Doctor' : 'Refunded to Patient' };
      }
      return esc;
    }));
  };

  // Prepare active list to show
  const getActiveDoctorsList = () => {
    if (realDocs && Array.isArray(realDocs)) {
      return realDocs.map(doc => ({
        id: doc.id,
        name: `${doc.firstName} ${doc.lastName}`,
        slmc: doc.slmcLicenseNumber || "N/A",
        spec: doc.category ? doc.category.replace(/_/g, " ") : "Counseling Specialist",
        regDate: doc.createdAt ? doc.createdAt.split('T')[0] : "Just Now",
        status: doc.status === "ACTIVE" ? "Verified & Active" : doc.status === "PENDING_VERIFICATION" ? "Pending Verification" : doc.status
      }));
    }
    return [];
  };

  const activeDoctors = getActiveDoctorsList();

  // Filtered lists for each sub-view
  const filteredRequestDocs = activeDoctors
    .filter(d => d.status === 'Pending Verification' || d.status === 'PENDING_APPROVAL' || d.status === 'PENDING_VERIFICATION')
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.slmc.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredManagedDocs = activeDoctors
    .filter(d => d.status === 'Verified & Active' || d.status === 'ACTIVE' || d.status === 'SUSPENDED')
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.slmc.toLowerCase().includes(searchTerm.toLowerCase()));

  // Paginated slices
  const requestsTotalPages = Math.max(1, Math.ceil(filteredRequestDocs.length / DOCTORS_PAGE_SIZE));
  const manageTotalPages = Math.max(1, Math.ceil(filteredManagedDocs.length / DOCTORS_PAGE_SIZE));
  const clampedRequestsPage = Math.min(requestsPage, requestsTotalPages);
  const clampedManagePage = Math.min(managePage, manageTotalPages);
  const paginatedRequestDocs = filteredRequestDocs.slice(
    (clampedRequestsPage - 1) * DOCTORS_PAGE_SIZE,
    clampedRequestsPage * DOCTORS_PAGE_SIZE
  );
  const paginatedManagedDocs = filteredManagedDocs.slice(
    (clampedManagePage - 1) * DOCTORS_PAGE_SIZE,
    clampedManagePage * DOCTORS_PAGE_SIZE
  );

  useEffect(() => {
    setRequestsPage(1);
    setManagePage(1);
  }, [searchTerm]);

  return (
    <AppShell>
      <div className="bg-[#FAF9F5] min-h-screen flex flex-row overflow-hidden" id="admin-dashboard-container">
        
        {/* Left Column (Sidebar) */}
        <aside className={`bg-[#0B1E17] text-white shrink-0 flex flex-col border-r border-[#152B22] transition-all duration-300 h-screen overflow-y-auto ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`} id="admin-sidebar">
          {/* Logo Element (Top section aligned with right header) */}
          <div className="h-16 flex items-center px-6 border-b border-[#152B22] shrink-0 justify-between" id="admin-sidebar-logo-container">
            {!isSidebarCollapsed ? (
              <Logo theme="light" id="admin-sidebar-logo" className="text-xl" />
            ) : (
              <button 
                onClick={() => navigateTo('/')} 
                className="font-display font-bold text-xl text-mint mx-auto cursor-pointer focus:outline-none"
                id="admin-sidebar-logo-collapsed"
              >
                H
              </button>
            )}
          </div>

          {/* Sidebar Navigation (Middle section) */}
          <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
            {/* Nav Menu */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setCurrentTab('overview')}
                className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                } ${
                  currentTab === 'overview' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-overview"
                title="Overview & Analytics"
              >
                <IconTrendingUp className="w-4 h-4 text-mint shrink-0" />
                {!isSidebarCollapsed && <span>Overview & Analytics</span>}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setCurrentTab('doctors');
                    setDoctorSubView('manage');
                  }}
                  className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                  } ${
                    currentTab === 'doctors' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                  }`}
                  id="admin-tab-doctors"
                  title="Doctor Management"
                >
                  <IconStethoscope className="w-4 h-4 text-mint shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span className="truncate">Doctor Registry</span>
                      {activeDoctors.filter(d => d.status === 'Pending Verification').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                          {activeDoctors.filter(d => d.status === 'Pending Verification').length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
                {isSidebarCollapsed && activeDoctors.filter(d => d.status === 'Pending Verification').length > 0 && (
                  <span className="absolute top-1 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setCurrentTab('escrow')}
                className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                } ${
                  currentTab === 'escrow' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-escrow"
                title="Escrow Payments"
              >
                <IconCreditCard className="w-4 h-4 text-mint shrink-0" />
                {!isSidebarCollapsed && <span>Escrow Payments</span>}
              </button>

              <button
                onClick={() => setCurrentTab('config')}
                className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                } ${
                  currentTab === 'config' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-config"
                title="System Configuration"
              >
                <IconSettings className="w-4 h-4 text-mint shrink-0" />
                {!isSidebarCollapsed && <span>System Configuration</span>}
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#152B22]">
            <button
              onClick={() => navigateTo('/admin/login')}
              className={`bg-[#152B22] hover:bg-[#1C3A2E] text-red-300 text-xs font-bold transition-all cursor-pointer flex items-center border border-[#2B4E41] ${
                isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto rounded-full' : 'py-2.5 px-4 rounded-xl justify-center space-x-1.5 w-full'
              }`}
              id="admin-sidebar-logout"
              title="Sign Out"
            >
              <IconLogout className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Right Column (Header + Dashboard Content) */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden" id="admin-main-column">
          
          {/* Top Header of Right Column */}
          <header className="h-16 bg-white border-b border-[#EBE8DF] flex items-center justify-between px-6 shrink-0" id="admin-main-header">
            {/* Header Left (Collapse button '<' / '>') */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 border border-[#EBE8DF] rounded-lg bg-white text-[#0B1E17] hover:bg-[#FAF9F5] hover:text-[#0D241C] transition-all cursor-pointer focus:outline-none flex items-center justify-center shadow-sm"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                id="admin-sidebar-toggle-btn"
              >
                {isSidebarCollapsed ? (
                  <IconChevronRight className="w-4 h-4 text-[#0B1E17]" />
                ) : (
                  <IconChevronLeft className="w-4 h-4 text-[#0B1E17]" />
                )}
              </button>
            </div>

            {/* Header Right (search, profile) */}
            <div className="flex items-center space-x-6">
              {/* Search Button (not an input field!) */}
              {(currentTab === 'doctors' || currentTab === 'escrow') && (
                <button
                  onClick={() => {
                    if (currentTab === 'doctors') {
                      setIsDoctorSearchPopupOpen(true);
                    } else if (currentTab === 'escrow') {
                      setIsEscrowSearchPopupOpen(true);
                    }
                  }}
                  className="bg-[#FAF9F5] border border-[#EBE8DF] hover:bg-cream hover:text-forest transition-all text-[#0B1E17] text-xs font-bold rounded-xl px-4 py-1.5 flex items-center space-x-1.5 shadow-sm cursor-pointer focus:outline-none"
                  title="Search Current Section"
                  id="dashboard-header-search-btn"
                >
                  <IconSearch className="w-4 h-4 text-forest animate-pulse" />
                  <span>Search</span>
                </button>
              )}

              {/* Profile Element */}
              <div className="flex items-center space-x-2.5 pl-4 border-l border-[#EBE8DF]" id="admin-header-profile">
                <div className="w-8 h-8 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center font-bold text-mint text-xs">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <h5 className="text-[11px] font-bold text-[#0B1E17] leading-tight">Admin Root</h5>
                  <span className="text-[9px] text-[#0B1E17]/50 block leading-none">admin@hitha.lk</span>
                </div>
              </div>
            </div>
          </header>

          {/* Admin Dashboard Core Display Panel */}
          <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto bg-[#FAF9F5]" id="admin-main-content">
            
            {/* Top Info Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline pb-4" id="admin-title-row">
              <div>
                <h1 className="text-2xl font-display font-bold text-forest">Administration Dashboard</h1>
                <p className="text-xs text-ink-soft mt-1">Manage doctor verifications, escrow releases, and platform statistics.</p>
              </div>
              <button
                onClick={() => {
                  if (currentTab === 'doctors' && doctorSubView === 'requests') {
                    setDoctorSubView('manage');
                  } else {
                    setCurrentTab('doctors');
                    setDoctorSubView('requests');
                  }
                }}
                className="bg-mint/20 hover:bg-mint/40 text-forest text-xs font-bold px-4 py-2.5 rounded-xl border border-mint/30 cursor-pointer flex items-center space-x-2 transition-all"
                id="dashboard-registration-requests-btn"
                title={currentTab === 'doctors' && doctorSubView === 'requests' ? "Go to Doctor Management Section" : "Go to Registration Request Page"}
              >
                <IconStethoscope className="w-4 h-4" />
                <span>{currentTab === 'doctors' && doctorSubView === 'requests' ? 'Manage Doctors' : 'View Requests'}</span>
                {!(currentTab === 'doctors' && doctorSubView === 'requests') && activeDoctors.filter(d => d.status === 'Pending Verification' || d.status === 'PENDING_APPROVAL' || d.status === 'PENDING_VERIFICATION').length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                    {activeDoctors.filter(d => d.status === 'Pending Verification' || d.status === 'PENDING_APPROVAL' || d.status === 'PENDING_VERIFICATION').length}
                  </span>
                )}
              </button>
            </div>

            {/* 1. OVERVIEW & ANALYTICS TAB */}
            {currentTab === 'overview' && (
            <div className="space-y-8">
              
              {/* KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-hairline shadow-resting">
                  <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider mb-1">Registered Doctors</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-bold text-forest">{realDocs ? realDocs.length : 0}</span>
                    <span className="text-xs text-mint font-bold">+3 new this week</span>
                  </div>
                  <p className="text-[11px] text-ink-soft mt-2">Verified SLMC clinical directory.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-hairline shadow-resting">
                  <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider mb-1">Escrow Funds Held</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-bold text-forest">LKR 145,200</span>
                    <span className="text-xs text-mint font-bold">100% Secured</span>
                  </div>
                  <p className="text-[11px] text-ink-soft mt-2">Patient funds held before session release.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-hairline shadow-resting">
                  <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider mb-1">Total Safe Sessions</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-bold text-forest">1,418</span>
                    <span className="text-xs text-forest/70 font-mono font-bold">99.4% completed</span>
                  </div>
                  <p className="text-[11px] text-ink-soft mt-2">Completed telehealth sessions.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-hairline shadow-resting">
                  <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider mb-1">Pending Approvals</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-bold text-red-600">
                      {activeDoctors.filter(d => d.status === 'Pending Verification').length}
                    </span>
                    <span className="text-xs text-red-500 font-bold">Urgent Verification</span>
                  </div>
                  <p className="text-[11px] text-ink-soft mt-2">Doctors awaiting SLMC status verify.</p>
                </div>

              </div>

              {/* Analytics and System Performance Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SVG Mock Chart card */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-hairline shadow-resting space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-hairline">
                    <h3 className="font-display font-bold text-forest text-sm flex items-center space-x-2">
                      <IconActivity className="w-4 h-4 text-mint" />
                      <span>Counseling Session Volume Growth (Last 6 Months)</span>
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-forest">
                      <span className="w-2.5 h-2.5 rounded-full bg-forest inline-block" />
                      <span>Completed Calls</span>
                    </div>
                  </div>

                  {/* SVG Bar Chart rendering */}
                  <div className="h-64 flex items-end justify-between gap-2 pt-6 px-4">
                    {[
                      { month: "Jan", val: 120, height: "h-24" },
                      { month: "Feb", val: 190, height: "h-36" },
                      { month: "Mar", val: 240, height: "h-44" },
                      { month: "Apr", val: 310, height: "h-52" },
                      { month: "May", val: 280, height: "h-48" },
                      { month: "Jun", val: 410, height: "h-60" },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <span className="text-[10px] font-mono text-forest font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.val}
                        </span>
                        <div className={`w-full bg-forest hover:bg-mint rounded-t-lg transition-all ${bar.height}`} />
                        <span className="text-[10px] font-bold text-ink-soft mt-2">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Activity Feed */}
                <div className="bg-white p-6 rounded-3xl border border-hairline shadow-resting space-y-4">
                  <div className="pb-2 border-b border-hairline flex justify-between items-center">
                    <h3 className="font-display font-bold text-forest text-sm flex items-center space-x-2">
                      <IconActivity className="w-4 h-4 text-mint" />
                      <span>Security Events Log</span>
                    </h3>
                    <span className="text-[10px] text-mint font-bold uppercase">Real-Time</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-mint shrink-0 mt-1.5" />
                      <div>
                        <p className="font-semibold text-forest">SLMC Database Sync Successful</p>
                        <span className="text-[10px] text-ink-soft block font-mono">1 minute ago • Core Scheduler</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-mint shrink-0 mt-1.5" />
                      <div>
                        <p className="font-semibold text-forest">Escrow Payment Released</p>
                        <span className="text-[10px] text-ink-soft block font-mono">15 minutes ago • Invoice #103 released</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0 mt-1.5" />
                      <div>
                        <p className="font-semibold text-forest">SLMC Verification Request</p>
                        <span className="text-[10px] text-ink-soft block font-mono font-bold">1 hour ago • Dr. Nimal Fernando</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. DOCTOR REGISTRY TAB */}
          {currentTab === 'doctors' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EBE8DF]">
                <div>
                  <h2 className="text-xl font-display font-bold text-forest">Doctor Registry Portal</h2>
                  <p className="text-xs text-ink-soft mt-1">Manage approved practitioners, audit statuses, or verify incoming registration requests.</p>
                </div>
              </div>

              {/* View 1: Doctor Registration Requests */}
              {doctorSubView === 'requests' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-[#FAF9F5]">
                        <th className="py-3 px-4">Doctor Name</th>
                        <th className="py-3 px-4">SLMC Registration No</th>
                        <th className="py-3 px-4">Specialization</th>
                        <th className="py-3 px-4">Registration Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRequestDocs
                        .map(doc => (
                          <tr key={doc.id} className="border-b border-hairline hover:bg-cream/10 transition-colors">
                            <td className="py-4 px-4 font-bold text-forest">{doc.name}</td>
                            <td className="py-4 px-4 font-mono font-semibold text-ink-soft">{doc.slmc}</td>
                            <td className="py-4 px-4 text-ink-soft">{doc.spec}</td>
                            <td className="py-4 px-4 font-mono text-ink-soft">{doc.regDate}</td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 animate-pulse">
                                Pending Approval
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {activeActionDocId === doc.id && actionType === 'reject' ? (
                                <div className="inline-block text-left bg-red-50 p-3 rounded-xl border border-red-200 mt-1 max-w-sm">
                                  <label className="block text-[10px] font-bold text-red-800 mb-1">Reason for Rejection (Required):</label>
                                  <textarea
                                    placeholder="e.g. SLMC number mismatch or documents unreadable."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    rows={2}
                                    className="w-full text-xs p-2 border border-red-200 rounded-lg outline-none focus:border-red-400 bg-white text-[#0B1E17]"
                                  />
                                  <div className="flex justify-end gap-1.5 mt-2">
                                    <button
                                      onClick={() => {
                                        setActiveActionDocId(null);
                                        setActionReason('');
                                      }}
                                      className="px-2.5 py-1 text-[10px] bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-bold cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => submitRejectDoc(doc.id)}
                                      disabled={rejectMutation.isPending}
                                      className="px-2.5 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setViewDoctorId(doc.id)}
                                    className="p-2 bg-[#FAF9F5] hover:bg-cream text-forest rounded-lg cursor-pointer transition-colors flex items-center justify-center border border-hairline"
                                    title="View Doctor Details"
                                  >
                                    <IconEye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveActionDocId(doc.id);
                                      setActionType('reject');
                                      setActionReason('');
                                    }}
                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center"
                                    title="Reject Request"
                                  >
                                    <IconX className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleApproveDoc(doc.id)}
                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                    className="p-2 bg-mint/20 hover:bg-mint/40 text-forest rounded-lg cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center"
                                    title="Approve & Activate"
                                  >
                                    <IconCheck className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      {filteredRequestDocs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-ink-soft italic">
                              No registration requests awaiting verification.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination: Registration Requests */}
              {doctorSubView === 'requests' && filteredRequestDocs.length > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-ink-soft font-semibold">
                    Showing {(clampedRequestsPage - 1) * DOCTORS_PAGE_SIZE + 1}-{Math.min(clampedRequestsPage * DOCTORS_PAGE_SIZE, filteredRequestDocs.length)} of {filteredRequestDocs.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                      disabled={clampedRequestsPage === 1}
                      className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      id="requests-pagination-prev"
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-forest">
                      Page {clampedRequestsPage} of {requestsTotalPages}
                    </span>
                    <button
                      onClick={() => setRequestsPage(p => Math.min(requestsTotalPages, p + 1))}
                      disabled={clampedRequestsPage === requestsTotalPages}
                      className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      id="requests-pagination-next"
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Manage Registered Doctors */}
              {doctorSubView === 'manage' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-[#FAF9F5]">
                        <th className="py-3 px-4">Doctor Name</th>
                        <th className="py-3 px-4">SLMC Registration No</th>
                        <th className="py-3 px-4">Specialization</th>
                        <th className="py-3 px-4">Registration Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right font-bold">Platform Management</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedManagedDocs
                        .map(doc => {
                          const isSuspended = doc.status === 'SUSPENDED';
                          return (
                            <tr key={doc.id} className="border-b border-hairline hover:bg-cream/10 transition-colors">
                              <td className="py-4 px-4 font-bold text-forest">{doc.name}</td>
                              <td className="py-4 px-4 font-mono font-semibold text-ink-soft">{doc.slmc}</td>
                              <td className="py-4 px-4 text-ink-soft">{doc.spec}</td>
                              <td className="py-4 px-4 font-mono text-ink-soft">{doc.regDate}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isSuspended ? 'bg-red-100 text-red-800' : 'bg-mint/20 text-forest'
                                }`}>
                                  {isSuspended ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                {activeActionDocId === doc.id && actionType === 'suspend' ? (
                                  <div className="inline-block text-left bg-yellow-50 p-3 rounded-xl border border-yellow-200 mt-1 max-w-sm">
                                    <label className="block text-[10px] font-bold text-yellow-800 mb-1">Reason for Suspension (Optional):</label>
                                    <textarea
                                      placeholder="e.g. Quality audit or patient complaints."
                                      value={actionReason}
                                      onChange={(e) => setActionReason(e.target.value)}
                                      rows={2}
                                      className="w-full text-xs p-2 border border-yellow-200 rounded-lg outline-none focus:border-yellow-400 bg-white text-[#0B1E17]"
                                    />
                                    <div className="flex justify-end gap-1.5 mt-2">
                                      <button
                                        onClick={() => {
                                          setActiveActionDocId(null);
                                          setActionReason('');
                                        }}
                                        className="px-2.5 py-1 text-[10px] bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-bold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => submitSuspendDoc(doc.id)}
                                        disabled={changeStatusMutation.isPending}
                                        className="px-2.5 py-1 text-[10px] bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
                                      >
                                        Suspend
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setViewDoctorId(doc.id)}
                                      className="p-2 bg-[#FAF9F5] hover:bg-cream text-forest rounded-lg cursor-pointer transition-colors flex items-center justify-center border border-hairline"
                                      title="View Doctor Details"
                                    >
                                      <IconEye className="w-3.5 h-3.5" />
                                    </button>
                                    {isSuspended ? (
                                      <button
                                        onClick={() => handleUnsuspendDoc(doc.id)}
                                        disabled={changeStatusMutation.isPending}
                                        className="px-3 py-1.5 bg-mint/20 hover:bg-mint/40 text-forest rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        Activate Doctor
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setActiveActionDocId(doc.id);
                                          setActionType('suspend');
                                          setActionReason('');
                                        }}
                                        disabled={changeStatusMutation.isPending}
                                        className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        Suspend Doctor
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {filteredManagedDocs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-ink-soft italic">
                              No registered clinical practitioners found.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination: Manage Registered Doctors */}
              {doctorSubView === 'manage' && filteredManagedDocs.length > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-ink-soft font-semibold">
                    Showing {(clampedManagePage - 1) * DOCTORS_PAGE_SIZE + 1}-{Math.min(clampedManagePage * DOCTORS_PAGE_SIZE, filteredManagedDocs.length)} of {filteredManagedDocs.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setManagePage(p => Math.max(1, p - 1))}
                      disabled={clampedManagePage === 1}
                      className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      id="manage-pagination-prev"
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold text-forest">
                      Page {clampedManagePage} of {manageTotalPages}
                    </span>
                    <button
                      onClick={() => setManagePage(p => Math.min(manageTotalPages, p + 1))}
                      disabled={clampedManagePage === manageTotalPages}
                      className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                      id="manage-pagination-next"
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. ESCROW PAYMENTS TAB */}
          {currentTab === 'escrow' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-hairline">
                <div>
                  <h2 className="text-xl font-display font-bold text-forest">Telehealth Escrow Registers</h2>
                  <p className="text-xs text-ink-soft mt-1">Audit and release funds securely. Patients pay in escrow, released to doctors upon session completion.</p>
                </div>
                <button className="bg-cream hover:bg-cream-dark text-forest text-xs font-bold py-2 px-4 rounded-xl transition-all border border-hairline flex items-center space-x-1.5">
                  <IconFileSpreadsheet className="w-4 h-4 text-mint" />
                  <span>Export Spreadsheet</span>
                </button>
              </div>

              {/* Escrow table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-cream/10">
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Patient Profile</th>
                      <th className="py-3 px-4">Destination Doctor</th>
                      <th className="py-3 px-4">Escrow Amount</th>
                      <th className="py-3 px-4">Session Date</th>
                      <th className="py-3 px-4">Escrow Status</th>
                      <th className="py-3 px-4 text-right">Escrow Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escrows.map(esc => (
                      <tr key={esc.id} className="border-b border-hairline hover:bg-cream/20 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-forest">#TX-00{esc.id}</td>
                        <td className="py-4 px-4 font-semibold text-ink-soft">{esc.patient}</td>
                        <td className="py-4 px-4 text-forest font-bold">{esc.doctor}</td>
                        <td className="py-4 px-4 font-mono font-semibold text-forest">{esc.amount}</td>
                        <td className="py-4 px-4 font-mono text-ink-soft">{esc.date}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            esc.status.includes('Released') 
                              ? 'bg-mint/20 text-forest' 
                              : esc.status.includes('Refund') 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-blue-100 text-blue-800 animate-pulse'
                          }`}>
                            {esc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {esc.status === 'Held in Escrow' ? (
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => handleReleaseEscrow(esc.id, 'refund')}
                                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                              >
                                Refund Patient
                              </button>
                              <button
                                onClick={() => handleReleaseEscrow(esc.id, 'release')}
                                className="px-3 py-1 bg-[#8FCB84] hover:bg-[#9ED993] text-[#0B1E17] rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                              >
                                Release to Doctor
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-ink-soft italic">Audit Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SYSTEM CONFIGURATION TAB */}
          {currentTab === 'config' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
              <div className="pb-4 border-b border-hairline">
                <h2 className="text-xl font-display font-bold text-forest">System-Wide Configuration Control</h2>
                <p className="text-xs text-ink-soft mt-1">Configure active telehealth rules, specializations, matching algorithms, and security guidelines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4 border border-hairline p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-forest mb-2 uppercase tracking-wide">Trilingual Localization Settings</h3>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center space-x-2 text-ink-soft cursor-pointer">
                      <input type="checkbox" className="rounded text-forest focus:ring-forest border-hairline" defaultChecked />
                      <span>Sinhala (සිංහල) Directory Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-ink-soft cursor-pointer">
                      <input type="checkbox" className="rounded text-forest focus:ring-forest border-hairline" defaultChecked />
                      <span>Tamil (தமிழ்) Directory Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-ink-soft cursor-pointer">
                      <input type="checkbox" className="rounded text-forest focus:ring-forest border-hairline" defaultChecked />
                      <span>English Directory Active</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 border border-hairline p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-forest mb-2 uppercase tracking-wide">Escrow & Refund Deadlines</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Escrow Holding Window (Days)</label>
                      <input
                        type="number"
                        defaultValue="7"
                        className="w-full bg-cream border border-hairline rounded-xl p-2.5 text-xs text-forest outline-none focus:border-forest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Auto-refund on Doctor No-Show (Hours)</label>
                      <input
                        type="number"
                        defaultValue="2"
                        className="w-full bg-cream border border-hairline rounded-xl p-2.5 text-xs text-forest outline-none focus:border-forest"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-mint/10 p-4 rounded-xl border border-mint/30 flex items-start gap-3 text-xs">
                <IconAlertTriangle className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-forest">Administrative Directive #19-A</h4>
                  <p className="text-forest/80 leading-relaxed mt-0.5">
                    Changes to localized specializations affect active patient booking pipelines immediately. Always double-check database indexes before submitting form modifications.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  showAlert("System configurations saved successfully!", "success");
                  setCurrentTab('overview');
                }}
                className="bg-forest text-white hover:bg-forest/95 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-resting cursor-pointer"
              >
                Save Operational Parameters
              </button>
            </div>
          )}

        </main>
      </div>
    </div>

    {/* Admin Doctor Registry Search Popup */}
    {isDoctorSearchPopupOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
          <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
            <h3 className="font-display font-bold text-forest flex items-center gap-2">
              <IconSearch className="w-4 h-4 text-mint" />
              <span>Search Doctors Directory</span>
            </h3>
            <button 
              onClick={() => setIsDoctorSearchPopupOpen(false)}
              className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
            >
              <IconX className="w-4 h-4 text-ink-soft" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">Doctor Name or SLMC No.</label>
              <input
                type="text"
                placeholder="e.g. Dr. Sanduni or SLMC-9321"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
            <button
              onClick={() => setIsDoctorSearchPopupOpen(false)}
              className="w-full bg-forest hover:bg-forest/95 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2"
            >
              <IconSearch className="w-4 h-4 text-mint" />
              <span>Apply Search Filter</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Admin Escrow Payments Search Popup */}
    {isEscrowSearchPopupOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
          <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
            <h3 className="font-display font-bold text-forest flex items-center gap-2">
              <IconSearch className="w-4 h-4 text-mint" />
              <span>Search Escrow Payments</span>
            </h3>
            <button 
              onClick={() => setIsEscrowSearchPopupOpen(false)}
              className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
            >
              <IconX className="w-4 h-4 text-ink-soft" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">Search Patient, Doctor or Status</label>
              <input
                type="text"
                placeholder="e.g. Patient A, held, active"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
            <button
              onClick={() => setIsEscrowSearchPopupOpen(false)}
              className="w-full bg-forest hover:bg-forest/95 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2"
            >
              <IconSearch className="w-4 h-4 text-mint" />
              <span>Apply Escrow Search</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Admin Doctor Details Popup (used by both Registration Requests and Manage Registered Doctors) */}
    {viewDoctorId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-hairline shadow-elevated relative max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
            <h3 className="font-display font-bold text-forest flex items-center gap-2">
              <IconStethoscope className="w-4 h-4 text-mint" />
              <span>Doctor Profile Details</span>
            </h3>
            <button
              onClick={() => setViewDoctorId(null)}
              className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
            >
              <IconX className="w-4 h-4 text-ink-soft" />
            </button>
          </div>

          {isViewedDoctorLoading && (
            <div className="py-10 text-center text-xs text-ink-soft font-semibold">Loading doctor details...</div>
          )}

          {isViewedDoctorError && !isViewedDoctorLoading && (
            <div className="py-10 text-center text-xs text-red-600 font-semibold">Failed to load doctor details.</div>
          )}

          {!isViewedDoctorLoading && !isViewedDoctorError && viewedDoctor && (
            <div className="space-y-5">
              {/* Header block */}
              <div className="flex items-center gap-4 pb-4 border-b border-hairline">
                <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center overflow-hidden shrink-0">
                  {viewedDoctor.profilePicture ? (
                    <img src={viewedDoctor.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <IconUserCircle className="w-9 h-9 text-mint" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-display font-bold text-forest truncate">
                    {viewedDoctor.firstName} {viewedDoctor.lastName}
                  </h4>
                  <p className="text-[11px] text-ink-soft mt-0.5">{viewedDoctor.category ? viewedDoctor.category.replace(/_/g, " ") : "Counseling Specialist"}</p>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    viewedDoctor.status === 'ACTIVE' ? 'bg-mint/20 text-forest'
                      : viewedDoctor.status === 'SUSPENDED' ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewedDoctor.status}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <IconMail className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Email</span>
                    <span className="text-forest font-semibold break-all">{viewedDoctor.email || "N/A"}</span>
                    {viewedDoctor.isEmailVerified && <span className="ml-1 text-[9px] text-mint font-bold">(Verified)</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <IconPhone className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Phone Number</span>
                    <span className="text-forest font-semibold">{viewedDoctor.phoneNumber || "N/A"}</span>
                    {viewedDoctor.isMobileNumberVerified && <span className="ml-1 text-[9px] text-mint font-bold">(Verified)</span>}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">SLMC Registration No</span>
                  <span className="text-forest font-mono font-semibold">{viewedDoctor.slmcLicenseNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Gender</span>
                  <span className="text-forest font-semibold">{viewedDoctor.gender || "N/A"}</span>
                </div>
                {viewedDoctor.approvedCustomPriceLkr != null && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Approved Custom Price</span>
                    <span className="text-forest font-semibold">LKR {viewedDoctor.approvedCustomPriceLkr}</span>
                  </div>
                )}
                <div>
                  <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Profile Complete</span>
                  <span className="text-forest font-semibold">{viewedDoctor.isProfileComplete ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Bio */}
              {viewedDoctor.professionalBio && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1">Professional Bio</span>
                  <p className="text-xs text-ink-soft leading-relaxed bg-[#FAF9F5] p-3 rounded-xl border border-hairline">
                    {viewedDoctor.professionalBio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {viewedDoctor.languages && viewedDoctor.languages.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
                    <IconLanguage className="w-3.5 h-3.5 text-mint" />
                    <span>Languages</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewedDoctor.languages.map((lang, i) => (
                      <span key={i} className="px-2.5 py-1 bg-mint/10 border border-mint/30 rounded-lg text-[10px] font-bold text-forest">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {viewedDoctor.qualifications && viewedDoctor.qualifications.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
                    <IconCertificate className="w-3.5 h-3.5 text-mint" />
                    <span>Qualifications</span>
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-forest font-semibold">
                    {viewedDoctor.qualifications.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {viewedDoctor.documents && viewedDoctor.documents.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
                    <IconFileText className="w-3.5 h-3.5 text-mint" />
                    <span>Submitted Documents</span>
                  </span>
                  <div className="space-y-1.5">
                    {viewedDoctor.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-forest font-semibold underline hover:text-mint truncate"
                      >
                        <IconFileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">Document {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </AppShell>
  );
}
