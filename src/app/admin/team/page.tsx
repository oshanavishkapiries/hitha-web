"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import AppShell from "../../../components/AppShell";
import AdminSidebarShell from "../../../components/admin/AdminSidebarShell";
import { navigateTo } from "../../../utils/navigation";
import {
  IconSearch,
  IconUserPlus,
  IconRefresh,
  IconBan,
  IconLockOpen,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import {
  useAdminUsers,
  useInviteAdmin,
  useResendAdminInvite,
  useUpdateAdminRole,
  useSuspendAdmin,
  useActivateAdmin,
} from "../../../lib/service/query/useAdmin";
import type { AdminRole, InvitableAdminRole } from "../../../lib/service/functions/admin.service";
import { useAlert } from "../../../context/AlertContext";
import { getApiErrorMessage } from "../../../utils/errors";
import Dropdown from "../../../components/Dropdown";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-mint/20 border-mint text-forest",
  INVITED: "bg-amber-50 border-amber-200 text-amber-700",
  EXPIRED: "bg-clay-tint border-clay/30 text-clay",
  SUSPENDED: "bg-red-50 border-red-200 text-red-700",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INVITED", label: "Invited" },
  { value: "EXPIRED", label: "Expired" },
  { value: "SUSPENDED", label: "Suspended" },
];

const INVITE_ROLE_OPTIONS: { value: InvitableAdminRole; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "FINANCIAL_ADMIN", label: "Financial Admin" },
  { value: "CONTENT_ADMIN", label: "Content Admin" },
];

const ROLE_UPDATE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "FINANCIAL_ADMIN", label: "Financial Admin" },
  { value: "CONTENT_ADMIN", label: "Content Admin" },
];

export default function AdminTeamPage() {
  const { showAlert } = useAlert();
  const [isGateChecked, setIsGateChecked] = useState(false);

  useEffect(() => {
    if (Cookies.get("user_role") !== "SUPER_ADMIN") {
      navigateTo("/admin/dashboard");
      return;
    }
    setIsGateChecked(true);
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InvitableAdminRole>("ADMIN");
  const [roleEditId, setRoleEditId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminUsers({
    status: (status as any) || undefined,
    search: search.trim() || undefined,
    page,
    size: PAGE_SIZE,
  });
  const inviteMutation = useInviteAdmin();
  const resendMutation = useResendAdminInvite();
  const roleMutation = useUpdateAdminRole();
  const suspendMutation = useSuspendAdmin();
  const activateMutation = useActivateAdmin();

  useEffect(() => {
    if (error) {
      showAlert(`API Error: ${getApiErrorMessage(error, "Failed to load admin team.")}`, "error");
    }
  }, [error]);

  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showAlert("Please enter an email address.", "warning");
      return;
    }
    try {
      await inviteMutation.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
      showAlert(`Invitation sent to ${inviteEmail.trim()}.`, "success");
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("ADMIN");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to send invitation.")}`, "error");
    }
  };

  const handleResend = async (email: string) => {
    try {
      const result = await resendMutation.mutateAsync(email);
      const expiry = result?.expiresAt ? new Date(result.expiresAt).toLocaleString() : "soon";
      showAlert(`Invitation resent to ${email}. Expires ${expiry}.`, "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to resend invitation.")}`, "error");
    }
  };

  const handleRoleChange = async (id: string, role: AdminRole) => {
    try {
      await roleMutation.mutateAsync({ id, role });
      showAlert("Admin role updated.", "success");
      setRoleEditId(null);
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to update role.")}`, "error");
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendMutation.mutateAsync(id);
      showAlert("Admin account suspended.", "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to suspend admin.")}`, "error");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      showAlert("Admin account activated.", "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to activate admin.")}`, "error");
    }
  };

  if (!isGateChecked) {
    return null;
  }

  const users = data?.content || [];
  const totalPages = Math.max(1, data?.totalPages || 1);

  return (
    <AppShell>
      <AdminSidebarShell
        activeNav="team"
        title="Admin Team"
        subtitle="Invite administrators, manage roles, and control platform access."
        titleAction={
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all"
            id="admin-team-invite-btn"
          >
            <IconUserPlus className="w-4 h-4" />
            <span>Invite Admin</span>
          </button>
        }
      >
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <IconSearch className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all"
              />
            </div>
            <div className="w-full sm:w-48">
              <Dropdown
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                placeholder="All statuses"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-hairline text-forest font-bold uppercase text-[10px] tracking-wider bg-cream">
                  <th className="py-3 px-4">Name / Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invited / Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-ink-soft italic">
                      Loading admin team...
                    </td>
                  </tr>
                )}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-ink-soft italic">
                      No admins or invitations found.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  users.map((user) => {
                    const isInvited = user.status === "INVITED" || user.status === "EXPIRED";
                    const isSuspended = user.status === "SUSPENDED";
                    return (
                      <tr key={user.id ?? user.email} className="border-b border-hairline hover:bg-cream/10 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-forest">{user.name || "—"}</div>
                          <div className="text-ink-soft">{user.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          {roleEditId === user.id ? (
                            <div className="w-40">
                              <Dropdown
                                options={ROLE_UPDATE_OPTIONS}
                                value={user.role}
                                onChange={(value) => handleRoleChange(user.id!, value as AdminRole)}
                                buttonClassName="w-full bg-white border border-forest/40 rounded-lg px-3 py-1.5 text-xs text-ink flex justify-between items-center cursor-pointer transition-all outline-none"
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => !isInvited && setRoleEditId(user.id)}
                              disabled={isInvited}
                              className="font-mono font-semibold text-ink-soft hover:text-forest disabled:hover:text-ink-soft disabled:cursor-not-allowed cursor-pointer"
                              title={isInvited ? "Role can be changed once the invite is accepted" : "Change role"}
                            >
                              {user.role.replace(/_/g, " ")}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[user.status] || STATUS_STYLES.ACTIVE}`}>
                            {String(user.status).replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-ink-soft">
                          {(user.invitedAt || user.expiresAt)
                            ? new Date(user.invitedAt || user.expiresAt!).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isInvited && (
                              <button
                                onClick={() => handleResend(user.email)}
                                disabled={resendMutation.isPending}
                                className="p-2 bg-cream hover:bg-cream/80 text-forest rounded-lg cursor-pointer transition-colors border border-hairline disabled:opacity-50 flex items-center justify-center"
                                title="Resend Invitation"
                              >
                                <IconRefresh className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {!isInvited && isSuspended && (
                              <button
                                onClick={() => handleActivate(user.id!)}
                                disabled={activateMutation.isPending}
                                className="px-3 py-1.5 bg-mint/20 hover:bg-mint/40 text-forest rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <IconLockOpen className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </button>
                            )}
                            {!isInvited && !isSuspended && (
                              <button
                                onClick={() => handleSuspend(user.id!)}
                                disabled={suspendMutation.isPending}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <IconBan className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {!isLoading && users.length > 0 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-ink-soft font-semibold">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-[11px] font-bold"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page + 1 >= totalPages}
                  className="px-3 py-1.5 border border-hairline rounded-lg bg-white text-forest hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-[11px] font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminSidebarShell>

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-dark/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-hairline w-full max-w-md p-6 rounded-3xl shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-mint/10 flex items-center justify-center text-forest">
                  <IconUsersGroup className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-forest">Invite Admin</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-ink-soft hover:text-forest cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              We'll email an invitation link to this address. They'll set their own password and phone number when accepting it.
            </p>
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@hitha.lk"
                className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Role</label>
              <Dropdown
                options={INVITE_ROLE_OPTIONS}
                value={inviteRole}
                onChange={(value) => setInviteRole(value as InvitableAdminRole)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="flex-1 bg-cream hover:bg-cream/80 text-forest text-xs font-bold py-3 rounded-xl border border-hairline transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
                onClick={handleInvite}
                className="flex-1 bg-forest hover:bg-forest/90 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
