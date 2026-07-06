"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDoctorSummary,
  getDoctorProfile,
  updateDoctorProfile,
  updateDoctorOnlineStatus,
  getBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  configureDoctorAvailability,
  getDoctorPriceRequests,
  submitDoctorPriceRequest,
  DoctorProfileUpdateRequest,
  BlockedDateRequest,
  AvailabilityConfigRequest,
} from "../functions/doctor.service";

export const useDoctorSummary = () => {
  return useQuery({
    queryKey: ["doctor_summary"],
    queryFn: async () => {
      const res = await getDoctorSummary();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctor summary");
      }
      return res.data;
    },
  });
};

export const useDoctorProfile = () => {
  return useQuery({
    queryKey: ["doctor_profile"],
    queryFn: async () => {
      const res = await getDoctorProfile();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctor profile");
      }
      return res.data;
    },
  });
};

export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DoctorProfileUpdateRequest) => {
      const res = await updateDoctorProfile(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to update profile");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_profile"] });
      queryClient.invalidateQueries({ queryKey: ["doctor_summary"] });
    },
  });
};

export const useUpdateDoctorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: "ONLINE" | "OFFLINE" | "AWAY") => {
      const res = await updateDoctorOnlineStatus(status);
      if (!res.success) {
        throw new Error(res.message || "Failed to update status");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_summary"] });
    },
  });
};

export const useBlockedDates = () => {
  return useQuery({
    queryKey: ["doctor_blocked_dates"],
    queryFn: async () => {
      const res = await getBlockedDates();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch blocked dates");
      }
      return res.data || [];
    },
  });
};

export const useAddBlockedDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BlockedDateRequest) => {
      const res = await addBlockedDate(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to add blocked date");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_blocked_dates"] });
    },
  });
};

export const useRemoveBlockedDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await removeBlockedDate(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to remove blocked date");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_blocked_dates"] });
    },
  });
};

export const useConfigureAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AvailabilityConfigRequest) => {
      const res = await configureDoctorAvailability(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to configure availability");
      }
      return res;
    },
  });
};

export const useDoctorPriceRequests = () => {
  return useQuery({
    queryKey: ["doctor_price_requests"],
    queryFn: async () => {
      const res = await getDoctorPriceRequests();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch price requests");
      }
      return res.data || [];
    },
  });
};

export const useSubmitPriceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { requestedPrice: number; justification?: string }) => {
      const res = await submitDoctorPriceRequest(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to submit price request");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_price_requests"] });
    },
  });
};
