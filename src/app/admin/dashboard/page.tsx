"use client";

import React from 'react';
import AppShell from '../../../components/AppShell';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { navigateTo } from '../../../utils/navigation';
import { IconActivity, IconStethoscope } from '@tabler/icons-react';
import { useDoctorApplications } from '../../../lib/service/query/useAdmin';

export default function AdminOverviewPage() {
  const { data: realDocs } = useDoctorApplications();

  const pendingCount = (realDocs || []).filter((doc: any) => doc.status === 'PENDING_VERIFICATION').length;

  return (
    <AppShell>
      <AdminSidebarShell
        activeNav="overview"
        title="Administration Dashboard"
        subtitle="Manage doctor verifications and platform statistics."
        titleAction={
          <button
            onClick={() => navigateTo('/admin/doctors?view=requests')}
            className="bg-mint/20 hover:bg-mint/40 text-forest text-xs font-bold px-4 py-2.5 rounded-xl border border-mint/30 cursor-pointer flex items-center space-x-2 transition-all"
            id="dashboard-registration-requests-btn"
            title="Go to Registration Request Page"
          >
            <IconStethoscope className="w-4 h-4" />
            <span>View Requests</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        }
      >
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
                  {pendingCount}
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
      </AdminSidebarShell>
    </AppShell>
  );
}
