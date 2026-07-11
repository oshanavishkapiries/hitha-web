"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorApplications,
  getDoctorDetails,
  approveDoctorApplication,
  rejectDoctorApplication,
  changeDoctorStatusUnified,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
  inviteAdmin,
  resendAdminInvite,
  getAdminUsers,
  updateAdminRole,
  suspendAdmin,
  activateAdmin,
  AdminInviteRequest,
  AdminRole,
  GetAdminUsersParams,
} from "../functions/admin.service";
import { normalizeList } from "./normalizeList";

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
      return normalizeList(res.data);
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

export const usePendingBlogs = () => {
  return useQuery({
    queryKey: ["pending_blogs"],
    queryFn: async () => {
      const res = await getPendingBlogs({ size: 100 });
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch pending blogs");
      }
      return normalizeList(res.data);
    },
  });
};

export const useApproveBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await approveBlog(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to approve blog");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useRejectBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await rejectBlog(id, reason);
      if (!res.success) {
        throw new Error(res.message || "Failed to reject blog");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending_blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
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
        throw new Error(res.message || "Failed to send invitation");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};

export const useResendAdminInvite = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await resendAdminInvite(email);
      if (!res.success) {
        throw new Error(res.message || "Failed to resend invitation");
      }
      return res.data;
    },
  });
};

export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AdminRole }) => {
      const res = await updateAdminRole(id, role);
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

export const useSuspendAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await suspendAdmin(id);
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
    mutationFn: async (id: string) => {
      const res = await activateAdmin(id);
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
