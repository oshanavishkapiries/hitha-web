"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { navigateTo } from '../../../utils/navigation';
import {
  IconSearch,
  IconPlus,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconUsers,
  IconRefresh,
  IconUserX,
  IconUserCheck,
  IconEdit,
} from '@tabler/icons-react';
import {
  useAdminUsers,
  useInviteAdmin,
  useResendAdminInvitation,
  useSuspendAdmin,
  useActivateAdmin,
  useUpdateAdminRole,
} from '../../../lib/service/query/useAdmin';
import { useAlert } from '../../../context/AlertContext';
import { getApiErrorMessage } from '../../../utils/errors';
import Cookies from 'js-cookie';

function AdminManagementContent() {
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();

  // Guard: Redirect non-SUPER_ADMIN to dashboard
  useEffect(() => {
    const role = Cookies.get("user_role");
    if (role !== "SUPER_ADMIN") {
      showAlert("Unauthorized administrative access. Super Admin permissions required.", "error");
      navigateTo('/admin/dashboard');
    }
  }, [showAlert]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0); // 0-based page for Spring backend
  const PAGE_SIZE = 8;

  // Modals visibility
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeAdminIdForRole, setActiveAdminIdForRole] = useState<string | null>(null);
  const [activeAdminIdForSuspend, setActiveAdminIdForSuspend] = useState<string | null>(null);

  // Form values
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('ADMIN');
  const [targetRole, setTargetRole] = useState('ADMIN');

  // React Query service integrations
  const { data: pageData, isLoading, refetch } = useAdminUsers({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    page: page,
    size: PAGE_SIZE,
  });

  const inviteMutation = useInviteAdmin();
  const resendMutation = useResendAdminInvitation();
  const suspendMutation = useSuspendAdmin();
  const activateMutation = useActivateAdmin();
  const updateRoleMutation = useUpdateAdminRole();

  // Handlers
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showAlert('Email address is required.', 'warning');
      return;
    }
    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      showAlert('Invitation sent successfully.', 'success');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('ADMIN');
      refetch();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to invite administrator.')}`, 'error');
    }
  };

  const handleResend = async (email: string) => {
    try {
      await resendMutation.mutateAsync(email);
      showAlert('Invitation resent successfully and timer reset.', 'success');
      refetch();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to resend invitation.')}`, 'error');
    }
  };

  const handleSuspend = async () => {
    if (!activeAdminIdForSuspend) return;
    try {
      await suspendMutation.mutateAsync(activeAdminIdForSuspend);
      showAlert('Administrator suspended successfully. Session terminated.', 'success');
      setActiveAdminIdForSuspend(null);
      refetch();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to suspend administrator.')}`, 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      showAlert('Administrator activated successfully.', 'success');
      refetch();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to activate administrator.')}`, 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!activeAdminIdForRole) return;
    try {
      await updateRoleMutation.mutateAsync({
        authUserId: activeAdminIdForRole,
        role: targetRole,
      });
      showAlert('Role updated successfully. Admin session invalidated to apply new permissions.', 'success');
      setActiveAdminIdForRole(null);
      refetch();
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to update admin role.')}`, 'error');
    }
  };

  // Keep pagination in bounds
  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Derived variables
  const adminUsers = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const totalElements = pageData?.totalElements || 0;
  const currentPage = pageData?.number ?? 0;

  return (
    <AppShell>
      <AdminSidebarShell
        activeNav="management"
        title="Admin Management"
        subtitle="Manage roles, suspend/activate administrators, and track pending invitations."
        titleAction={
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-forest hover:bg-forest/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-forest/30 cursor-pointer flex items-center space-x-2 transition-all shadow-resting hover:shadow-elevated"
            id="invite-new-admin-btn"
          >
            <IconPlus className="w-4 h-4" />
            <span>Invite Admin</span>
          </button>
        }
      >
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                <IconSearch className="w-4 h-4 text-forest" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-forest"
                id="admin-search-input"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-ink-soft">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3 py-2 outline-none focus:border-forest cursor-pointer"
                id="admin-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING_INVITE">Pending Invite</option>
                <option value="EXPIRED_INVITE">Expired Invite</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-ink-soft font-semibold">
                Loading administrators...
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-[#FAF9F5]">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date Joined / Invited</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => {
                    const isSelf = user.email === Cookies.get("user_email") || user.id === Cookies.get("user_id");
                    const isPending = user.status === 'PENDING_INVITE';
                    const isExpired = user.status === 'EXPIRED_INVITE';
                    const isSuspended = user.status === 'SUSPENDED';
                    const isActive = user.status === 'ACTIVE';

                    return (
                      <tr key={user.email} className="border-b border-hairline hover:bg-cream/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-forest">
                          {user.name} {isSelf && <span className="text-[10px] text-mint font-normal ml-1 font-mono">(You)</span>}
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-ink-soft">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-forest">
                            {user.role.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-mint/20 text-forest' :
                            isSuspended ? 'bg-red-100 text-red-800' :
                            isPending ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-ink-soft">
                          {user.invitedAt ? user.invitedAt.split('T')[0] : '—'}
                          {(isPending || isExpired) && user.expiresAt && (
                            <span className="text-[10px] text-ink-soft block opacity-70">
                              Expires: {user.expiresAt.split('T')[0]}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Actions for active admins */}
                            {isActive && (
                              <>
                                <button
                                  onClick={() => {
                                    setActiveAdminIdForRole(user.id);
                                    setTargetRole(user.role);
                                  }}
                                  className="p-2 bg-[#FAF9F5] hover:bg-cream text-forest rounded-lg cursor-pointer transition-colors border border-hairline flex items-center justify-center"
                                  title="Change Role"
                                >
                                  <IconEdit className="w-3.5 h-3.5" />
                                </button>
                                {!isSelf && (
                                  <button
                                    onClick={() => setActiveAdminIdForSuspend(user.id)}
                                    className="px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg cursor-pointer transition-colors border border-yellow-200 flex items-center space-x-1"
                                    title="Suspend User"
                                  >
                                    <IconUserX className="w-3.5 h-3.5" />
                                    <span className="font-semibold text-[10px]">Suspend</span>
                                  </button>
                                )}
                              </>
                            )}

                            {/* Actions for suspended admins */}
                            {isSuspended && (
                              <button
                                onClick={() => handleActivate(user.id!)}
                                className="px-2.5 py-1.5 bg-mint/10 hover:bg-mint/20 text-forest rounded-lg cursor-pointer transition-colors border border-mint/20 flex items-center space-x-1"
                                title="Activate User"
                              >
                                <IconUserCheck className="w-3.5 h-3.5" />
                                <span className="font-semibold text-[10px]">Activate</span>
                              </button>
                            )}

                            {/* Actions for uncompleted invitations */}
                            {(isPending || isExpired) && (
                              <button
                                onClick={() => handleResend(user.email)}
                                className="p-2 bg-[#FAF9F5] hover:bg-cream text-forest rounded-lg cursor-pointer transition-colors border border-hairline flex items-center justify-center"
                                title="Resend Invitation"
                              >
                                <IconRefresh className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-ink-soft italic">
                        No administrators found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Row */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-ink-soft font-semibold">
                Showing {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} admins
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  id="admin-pagination-prev"
                >
                  <IconChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-forest">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  id="admin-pagination-next"
                >
                  <IconChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </AdminSidebarShell>

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
            <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
              <h3 className="font-display font-bold text-forest flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-mint" />
                <span>Invite New Administrator</span>
              </h3>
              <button
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteEmail('');
                  setInviteRole('ADMIN');
                }}
                className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
              >
                <IconX className="w-4 h-4 text-ink-soft" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. member@hitha.lk"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-forest cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="FINANCIAL_ADMIN">FINANCIAL_ADMIN</option>
                  <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full bg-forest hover:bg-forest/95 text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {inviteMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {activeAdminIdForSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
            <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
              <h3 className="font-display font-bold text-forest flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-600" />
                <span>Suspend Administrator</span>
              </h3>
              <button
                onClick={() => setActiveAdminIdForSuspend(null)}
                className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
              >
                <IconX className="w-4 h-4 text-ink-soft" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-ink-soft">
                Are you sure you want to suspend this administrator? They will immediately lose access to the administrative platform, and all their active login sessions will be terminated.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveAdminIdForSuspend(null)}
                  className="px-4 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspend}
                  disabled={suspendMutation.isPending}
                  className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer"
                >
                  {suspendMutation.isPending ? 'Suspending...' : 'Suspend Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {activeAdminIdForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-hairline shadow-elevated relative">
            <div className="flex justify-between items-center pb-4 border-b border-hairline mb-4">
              <h3 className="font-display font-bold text-forest flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-mint" />
                <span>Change Administrator Role</span>
              </h3>
              <button
                onClick={() => setActiveAdminIdForRole(null)}
                className="p-1 hover:bg-[#FAF9F5] rounded-lg transition-all cursor-pointer"
              >
                <IconX className="w-4 h-4 text-ink-soft" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-forest uppercase tracking-wider mb-1">New Operational Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EBE8DF] text-xs text-[#0B1E17] font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-forest cursor-pointer"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="FINANCIAL_ADMIN">FINANCIAL_ADMIN</option>
                  <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <p className="text-[10px] text-yellow-700 bg-yellow-50 p-2.5 border border-yellow-200 rounded-lg">
                Warning: Updating the role will force logout the administrator from all active sessions to apply new permissions immediately.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveAdminIdForRole(null)}
                  className="px-4 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending}
                  className="px-4 py-2 text-xs bg-forest hover:bg-forest/95 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer"
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function AdminManagementPage() {
  return (
    <Suspense fallback={null}>
      <AdminManagementContent />
    </Suspense>
  );
}
