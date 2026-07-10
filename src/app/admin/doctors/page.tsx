"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { navigateTo } from '../../../utils/navigation';
import {
  IconSearch,
  IconCheck,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconStethoscope,
  IconEye,
  IconAlertTriangle,
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
import DoctorDetailCard from '../../../components/DoctorDetailCard';
import { useNotificationStore } from '../../../lib/store/notificationStore';

function AdminDoctorRegistryContent() {
  const searchParams = useSearchParams();
  const initialSubView = searchParams.get('view') === 'requests' ? 'requests' : 'manage';

  const { showAlert } = useAlert();

  // New sub-view selection states
  const [doctorSubView, setDoctorSubView] = useState<'requests' | 'manage'>(initialSubView);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionDocId, setActiveActionDocId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  // Admin search popup visibility state
  const [isDoctorSearchPopupOpen, setIsDoctorSearchPopupOpen] = useState(false);

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
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);

  // Approve a doctor's registration
  const handleApproveDoc = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      showAlert('Successfully approved doctor profile on secure server.', 'success');
      refetchRealDocs();
      fetchNotifications();
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
      fetchNotifications();
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
      <AdminSidebarShell
        activeNav="doctors"
        title="Administration Dashboard"
        subtitle="Manage doctor verifications and platform statistics."
        headerActions={
          <button
            onClick={() => setIsDoctorSearchPopupOpen(true)}
            className="bg-[#FAF9F5] border border-[#EBE8DF] hover:bg-cream hover:text-forest transition-all text-[#0B1E17] text-xs font-bold rounded-xl px-4 py-1.5 flex items-center space-x-1.5 shadow-sm cursor-pointer focus:outline-none"
            title="Search Current Section"
            id="dashboard-header-search-btn"
          >
            <IconSearch className="w-4 h-4 text-forest animate-pulse" />
            <span>Search</span>
          </button>
        }
        titleAction={
          <button
            onClick={() => {
              if (doctorSubView === 'requests') {
                setDoctorSubView('manage');
              } else {
                setDoctorSubView('requests');
              }
            }}
            className="bg-mint/20 hover:bg-mint/40 text-forest text-xs font-bold px-4 py-2.5 rounded-xl border border-mint/30 cursor-pointer flex items-center space-x-2 transition-all"
            id="dashboard-registration-requests-btn"
            title={doctorSubView === 'requests' ? "Go to Doctor Management Section" : "Go to Registration Request Page"}
          >
            <IconStethoscope className="w-4 h-4" />
            <span>{doctorSubView === 'requests' ? 'Manage Doctors' : 'View Requests'}</span>
            {doctorSubView !== 'requests' && filteredRequestDocs.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                {filteredRequestDocs.length}
              </span>
            )}
          </button>
        }
      >
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
                                onClick={() => navigateTo(`/admin/requests?id=${encodeURIComponent(doc.id)}`)}
                                className="p-2 bg-[#FAF9F5] hover:bg-cream text-forest rounded-lg cursor-pointer transition-colors flex items-center justify-center border border-hairline"
                                title="View Request Details"
                                id={`request-view-${doc.id}`}
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
      </AdminSidebarShell>

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

      {/* Suspend Doctor Popup */}
      {activeActionDocId && actionType === 'suspend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
            <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
              <h3 className="font-display font-bold text-forest flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-yellow-600" />
                <span>Suspend Doctor</span>
              </h3>
              <button
                onClick={() => {
                  setActiveActionDocId(null);
                  setActionReason('');
                }}
                className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
              >
                <IconX className="w-4 h-4 text-ink-soft" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-ink-soft">
                You are about to suspend{' '}
                <span className="font-bold text-forest">
                  {activeDoctors.find(d => d.id === activeActionDocId)?.name || 'this doctor'}
                </span>
                . They will lose access to their portal until reactivated.
              </p>
              <div>
                <label className="block text-[10px] font-bold text-yellow-800 uppercase tracking-wider mb-1">Reason for Suspension (Optional)</label>
                <textarea
                  placeholder="e.g. Quality audit or patient complaints."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 bg-[#FAF9F5] text-[#0B1E17]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setActiveActionDocId(null);
                    setActionReason('');
                  }}
                  className="px-4 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitSuspendDoc(activeActionDocId)}
                  disabled={changeStatusMutation.isPending}
                  className="px-4 py-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer"
                >
                  {changeStatusMutation.isPending ? 'Suspending...' : 'Suspend Doctor'}
                </button>
              </div>
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
              <DoctorDetailCard doctor={viewedDoctor} />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function AdminDoctorRegistryPage() {
  return (
    <Suspense fallback={null}>
      <AdminDoctorRegistryContent />
    </Suspense>
  );
}
