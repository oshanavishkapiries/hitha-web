"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorApplications,
  getDoctorDetails,
  approveDoctorApplication,
  rejectDoctorApplication,
  changeDoctorStatusUnified,
  getAdminUsers,
  inviteAdmin,
  resendAdminInvitation,
  suspendAdmin,
  activateAdmin,
  updateAdminRole,
  GetAdminUsersParams,
  AdminInviteRequest,
  AdminRoleUpdateRequest,
} from "../functions/admin.service";

export const useDoctorApplications = () => {
  return useQuery({
    queryKey: ["doctor_applications"],
    queryFn: async () => {
      // The dashboard filters/paginates this list client-side, so fetch the whole
      // directory in one page instead of relying on the backend's default size=10.
      const res = await getDoctorApplications({ size: 500 });
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctor applications");
      }
      const data = res.data as any;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === "object" && "content" in data && Array.isArray(data.content)) {
        return data.content;
      }
      return [];
    },
  });
};

export const useDoctorDetails = (id: string | null) => {
  return useQuery({
    queryKey: ["doctor_details", id],
    queryFn: async () => {
      const res = await getDoctorDetails(id as string);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctor details");
      }
      return res.data;
    },
    enabled: !!id,
  });
};

export const useApproveDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await approveDoctorApplication(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to approve doctor");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_applications"] });
    },
  });
};

export const useRejectDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await rejectDoctorApplication(id, reason);
      if (!res.success) {
        throw new Error(res.message || "Failed to reject doctor");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_applications"] });
    },
  });
};

export const useChangeDoctorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await changeDoctorStatusUnified(id, status, reason);
      if (!res.success) {
        throw new Error(res.message || "Failed to change doctor status");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_applications"] });
    },
  });
};

export const useAdminUsers = (params?: GetAdminUsersParams) => {
  return useQuery({
    queryKey: ["admin_users", params],
    queryFn: async () => {
      const res = await getAdminUsers(params);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch admin users");
      }
      return res.data;
    },
  });
};

export const useInviteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminInviteRequest) => {
      const res = await inviteAdmin(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to invite admin");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};

export const useResendAdminInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const res = await resendAdminInvitation({ email });
      if (!res.success) {
        throw new Error(res.message || "Failed to resend invitation");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};

export const useSuspendAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authUserId: string) => {
      const res = await suspendAdmin(authUserId);
      if (!res.success) {
        throw new Error(res.message || "Failed to suspend admin");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};

export const useActivateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authUserId: string) => {
      const res = await activateAdmin(authUserId);
      if (!res.success) {
        throw new Error(res.message || "Failed to activate admin");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};

export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ authUserId, role }: { authUserId: string; role: string }) => {
      const res = await updateAdminRole(authUserId, { role });
      if (!res.success) {
        throw new Error(res.message || "Failed to update admin role");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};
