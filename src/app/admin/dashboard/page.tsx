"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/AppShell';
import Logo from '../../../components/Logo';
import { navigateTo } from '../../../utils/navigation';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Activity, 
  Settings, 
  Search, 
  TrendingUp, 
  Download, 
  LogOut, 
  Check, 
  X,
  FileSpreadsheet,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  useDoctorApplications,
  useApproveDoctor,
  useRejectDoctor,
} from '../../../lib/service/query/useAdmin';

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
  const [currentTab, setCurrentTab] = useState<'overview' | 'verifications' | 'escrow' | 'config'>('overview');
  const [escrows, setEscrows] = useState(initialEscrowPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // React Query service integrations
  const { data: realDocs, isLoading: isRealDocsLoading, refetch: refetchRealDocs } = useDoctorApplications();
  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();

  // Handle doc verification using secure backend server
  const handleVerifyDoc = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await approveMutation.mutateAsync(id);
      } else {
        await rejectMutation.mutateAsync(id);
      }
      alert(`Successfully ${approved ? 'approved' : 'rejected'} doctor profile on secure server.`);
      refetchRealDocs();
    } catch (err: any) {
      alert(`API Error: ${err.message || 'Failed to update doctor status on server.'}`);
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
                <TrendingUp className="w-4 h-4 text-mint shrink-0" />
                {!isSidebarCollapsed && <span>Overview & Analytics</span>}
              </button>

              <div className="relative">
                <button
                  onClick={() => setCurrentTab('verifications')}
                  className={`text-left rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center p-3 w-12 h-12 mx-auto' : 'px-4 py-3 space-x-3 w-full'
                  } ${
                    currentTab === 'verifications' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                  }`}
                  id="admin-tab-verifications"
                  title="SLMC Verifications"
                >
                  <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span className="truncate">SLMC Verifications</span>
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
                <CreditCard className="w-4 h-4 text-mint shrink-0" />
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
                <Settings className="w-4 h-4 text-mint shrink-0" />
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
              <LogOut className="w-3.5 h-3.5 shrink-0" />
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
                  <ChevronRight className="w-4 h-4 text-[#0B1E17]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-[#0B1E17]" />
                )}
              </button>
            </div>

            {/* Header Right (search, profile) */}
            <div className="flex items-center space-x-6">
              {/* Search Element */}
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0B1E17]/40">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] placeholder:text-[#0B1E17]/40 rounded-xl pl-9 pr-4 py-1.5 w-40 sm:w-48 focus:outline-none focus:border-mint/60 focus:bg-white transition-all shadow-inner"
                  id="dashboard-search-input"
                />
              </div>

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
                      <Activity className="w-4 h-4 text-mint" />
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
                      <Activity className="w-4 h-4 text-mint" />
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

          {/* 2. DOCTOR VERIFICATIONS TAB */}
          {currentTab === 'verifications' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-hairline">
                <div>
                  <h2 className="text-xl font-display font-bold text-forest">SLMC Credentials Verification Board</h2>
                  <p className="text-xs text-ink-soft mt-1">Validate doctor registration IDs with Sri Lanka Medical Council database records to approve directories.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-ink-soft/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search doctor or SLMC no..."
                    className="w-full bg-cream/40 border border-hairline rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Pending List table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-cream/10">
                      <th className="py-3 px-4">Doctor Name</th>
                      <th className="py-3 px-4">SLMC Registration No</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">System Status</th>
                      <th className="py-3 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDoctors
                      .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.slmc.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(doc => (
                        <tr key={doc.id} className="border-b border-hairline hover:bg-cream/20 transition-colors">
                          <td className="py-4 px-4 font-bold text-forest">{doc.name}</td>
                          <td className="py-4 px-4 font-mono font-semibold text-ink-soft">{doc.slmc}</td>
                          <td className="py-4 px-4 text-ink-soft">{doc.spec}</td>
                          <td className="py-4 px-4 font-mono text-ink-soft">{doc.regDate}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              doc.status === 'Verified & Active' 
                                ? 'bg-mint/20 text-forest' 
                                : doc.status === 'Rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800 animate-pulse'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {doc.status === 'Pending Verification' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleVerifyDoc(doc.id, false)}
                                  disabled={approveMutation.isPending || rejectMutation.isPending}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                  title="Reject Registration"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVerifyDoc(doc.id, true)}
                                  disabled={approveMutation.isPending || rejectMutation.isPending}
                                  className="p-1.5 bg-mint/20 hover:bg-mint/40 text-forest rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                  title="Verify & Publish Profile"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-ink-soft italic">No action needed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
                  <FileSpreadsheet className="w-4 h-4 text-mint" />
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
                <AlertTriangle className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-forest">Administrative Directive #19-A</h4>
                  <p className="text-forest/80 leading-relaxed mt-0.5">
                    Changes to localized specializations affect active patient booking pipelines immediately. Always double-check database indexes before submitting form modifications.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert("System configurations saved successfully!");
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
  </AppShell>
  );
}
