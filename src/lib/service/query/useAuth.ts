"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { adminLogin, AdminLoginRequest, adminRegister, AdminRegRequest } from "../functions/admin.service";
import { doctorLogin, doctorRegister, DoctorLoginRequest, DoctorRegRequest } from "../functions/doctor.service";
import {
  logoutSession,
  sendVerificationCode,
  verifyVerificationCode,
  SendCodeRequest,
  VerifyCodeRequest,
} from "../functions/auth.service";

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminLoginRequest) => {
      const res = await adminLogin(payload);
      if (res.success && res.data) {
        const { accessToken, refreshToken, role } = res.data;
        // Store in cookies
        Cookies.set("accesstoken", accessToken, { expires: 1, path: "/" });
        Cookies.set("refreshtoken", refreshToken, { expires: 7, path: "/" });
        Cookies.set("user_role", role, { expires: 7, path: "/" });
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profile"] });
    },
  });
};

export const useAdminRegister = () => {
  return useMutation({
    mutationFn: async (payload: AdminRegRequest) => {
      const res = await adminRegister(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to register admin");
      }
      return res;
    },
  });
};

export const useDoctorLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DoctorLoginRequest) => {
      const res = await doctorLogin(payload);
      if (res.success && res.data) {
        const { accessToken, refreshToken, role } = res.data;
        // Store in cookies
        Cookies.set("accesstoken", accessToken, { expires: 1, path: "/" });
        Cookies.set("refreshtoken", refreshToken, { expires: 7, path: "/" });
        Cookies.set("user_role", role, { expires: 7, path: "/" });
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_profile"] });
    },
  });
};

export const useDoctorRegister = () => {
  return useMutation({
    mutationFn: async (payload: DoctorRegRequest) => {
      const res = await doctorRegister(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to register doctor");
      }
      return res;
    },
  });
};

export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: async (payload: SendCodeRequest) => {
      const res = await sendVerificationCode(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to send verification code");
      }
      return res;
    },
  });
};

export const useVerifyVerificationCode = () => {
  return useMutation({
    mutationFn: async (payload: VerifyCodeRequest) => {
      const res = await verifyVerificationCode(payload);
      if (!res.success || !res.data?.verified) {
        throw new Error(res.message || "Invalid or expired verification code");
      }
      return res;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = Cookies.get("refreshtoken");
      if (refreshToken) {
        try {
          await logoutSession({ refreshToken });
        } catch (e) {
          console.error("Logout request to server failed:", e);
        }
      }
      // Always clear cookies regardless of server success
      Cookies.remove("accesstoken", { path: "/" });
      Cookies.remove("refreshtoken", { path: "/" });
      Cookies.remove("user_role", { path: "/" });
      queryClient.clear();
    },
  });
};

export const getAuthSession = () => {
  if (typeof window === "undefined") return null;
  const accessToken = Cookies.get("accesstoken");
  const role = Cookies.get("user_role");
  if (!accessToken) return null;
  return { accessToken, role };
};
