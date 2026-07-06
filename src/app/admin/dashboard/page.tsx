"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
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
  FileSpreadsheet
} from 'lucide-react';

// Mock doctors awaiting SLMC verification
const initialPendingDocs = [
  { id: 1, name: "Dr. Sanduni Alwis", slmc: "SLMC-9321", spec: "Clinical Psychologist", regDate: "2026-07-01", status: "Pending Verification" },
  { id: 2, name: "Dr. Thilina Perera", slmc: "SLMC-8442", spec: "Psychiatrist & Therapist", regDate: "2026-07-03", status: "Pending Verification" },
  { id: 3, name: "Dr. Nimal Fernando", slmc: "SLMC-1205", spec: "Child Behavioral Counselor", regDate: "2026-07-05", status: "Pending Verification" }
];

// Mock escrow payments
const initialEscrowPayments = [
  { id: 101, patient: "Anonymous Patient A", doctor: "Dr. Sanduni Alwis", amount: "LKR 3,500", date: "2026-07-05", status: "Held in Escrow" },
  { id: 102, patient: "Anonymous Patient B", doctor: "Dr. Thilina Perera", amount: "LKR 4,200", date: "2026-07-05", status: "Held in Escrow" },
  { id: 103, patient: "Anonymous Patient C", doctor: "Dr. Kaveesh Alwis", amount: "LKR 3,500", date: "2026-07-04", status: "Released" }
];

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'verifications' | 'escrow' | 'config'>('overview');
  const [pendingDocs, setPendingDocs] = useState(initialPendingDocs);
  const [escrows, setEscrows] = useState(initialEscrowPayments);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle doc verification
  const handleVerifyDoc = (id: number, approved: boolean) => {
    setPendingDocs(prev => prev.map(doc => {
      if (doc.id === id) {
        return { ...doc, status: approved ? 'Verified & Active' : 'Rejected' };
      }
      return doc;
    }));
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

  return (
    <AppShell>
      <div className="bg-[#FAF9F5] min-h-screen flex flex-col lg:flex-row">
        
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 bg-[#0B1E17] text-white shrink-0 flex flex-col justify-between p-6 border-r border-[#152B22]">
          <div className="space-y-8">
            {/* Sidebar Branding */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl text-mint">Hitha Control</span>
                <span className="text-[10px] bg-forest border border-[#2B4E41] text-sprout px-2 py-0.5 rounded-full font-mono">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-sprout/50 mt-1">Hitha System Command Center</p>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setCurrentTab('overview')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors cursor-pointer ${
                  currentTab === 'overview' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-overview"
              >
                <TrendingUp className="w-4 h-4 text-mint" />
                <span>Overview & Analytics</span>
              </button>

              <button
                onClick={() => setCurrentTab('verifications')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors cursor-pointer ${
                  currentTab === 'verifications' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-verifications"
              >
                <ShieldCheck className="w-4 h-4 text-mint" />
                <div className="flex-1 flex justify-between items-center">
                  <span>SLMC Verifications</span>
                  {pendingDocs.filter(d => d.status === 'Pending Verification').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                      {pendingDocs.filter(d => d.status === 'Pending Verification').length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setCurrentTab('escrow')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors cursor-pointer ${
                  currentTab === 'escrow' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-escrow"
              >
                <CreditCard className="w-4 h-4 text-mint" />
                <span>Escrow Payments</span>
              </button>

              <button
                onClick={() => setCurrentTab('config')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors cursor-pointer ${
                  currentTab === 'config' ? 'bg-[#152B22] text-white font-bold border border-[#2B4E41]' : 'text-sprout/70 hover:bg-forest/20'
                }`}
                id="admin-tab-config"
              >
                <Settings className="w-4 h-4 text-mint" />
                <span>System Configuration</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-6 border-t border-[#152B22] space-y-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center font-bold text-mint text-xs">
                AD
              </div>
              <div>
                <h5 className="text-xs font-bold">Admin Root</h5>
                <span className="text-[10px] text-sprout/50 block">admin@hitha.lk</span>
              </div>
            </div>
            <button
              onClick={() => navigateTo('/admin/login')}
              className="w-full bg-[#152B22] hover:bg-[#1C3A2E] text-red-300 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 border border-[#2B4E41]"
              id="admin-sidebar-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Admin Dashboard Core Display Panel */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Top Info Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-hairline pb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-forest">Hitha Administration Command Center</h1>
              <p className="text-xs text-ink-soft mt-1">Comprehensive system analytics, doctor verifications, and financial audit registers.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-forest text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              System Status: Fully Operational
            </span>
          </div>

          {/* 1. OVERVIEW & ANALYTICS TAB */}
          {currentTab === 'overview' && (
            <div className="space-y-8">
              
              {/* KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-hairline shadow-resting">
                  <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider mb-1">Registered Doctors</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-bold text-forest">42</span>
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
                      {pendingDocs.filter(d => d.status === 'Pending Verification').length}
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
                    {pendingDocs
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
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg cursor-pointer transition-colors"
                                  title="Reject Registration"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleVerifyDoc(doc.id, true)}
                                  className="p-1.5 bg-mint/20 hover:bg-mint/40 text-forest rounded-lg cursor-pointer transition-colors"
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
    </AppShell>
  );
}
