import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "./auth.service";

export interface AdminLoginRequest {
  identifier: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  profileComplete: boolean;
  emailVerified: boolean;
}

export interface AdminRegRequest {
  inviteToken: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
}

export interface SendCodeRequest {
  identifier: string; // phone or email
  purpose: "REGISTER" | "EMAIL_VERIFICATION" | "PATIENT_LOGIN" | "PASSWORD_RESET";
}

export interface VerifyCodeRequest {
  identifier: string;
  verificationCode: string;
}

export interface DoctorApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  category: "COUNSELOR" | "CLINICAL_COUNSELOR" | "PSYCHOLOGIST" | "CLINICAL_PSYCHOLOGIST" | "MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA" | "CONSULTANT_PSYCHIATRIST";
  slmcLicenseNumber: string;
  status: "UNVERIFIED" | "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DELETED" | "INACTIVE";
  createdAt: string;
}

export const adminLogin = async (payload: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AdminLoginResponse>>(ENDPOINTS.admin.login, payload);
  return response.data;
};

export const adminRegister = async (payload: AdminRegRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.register, payload);
  return response.data;
};

export const adminSendCode = async (payload: SendCodeRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.sendCode, payload);
  return response.data;
};

export const adminVerifyCode = async (payload: VerifyCodeRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.verifyCode, payload);
  return response.data;
};

export const getDoctorApplications = async (): Promise<ApiResponse<DoctorApplicant[]>> => {
  const response = await axiosInstance.get<ApiResponse<DoctorApplicant[]>>(ENDPOINTS.admin.doctors);
  return response.data;
};

export const approveDoctorApplication = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.approveDoctor(id));
  return response.data;
};

export const rejectDoctorApplication = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.rejectDoctor(id));
  return response.data;
};

export const changeDoctorStatusUnified = async (id: string, status: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.changeDoctorStatus(id), { status });
  return response.data;
};
