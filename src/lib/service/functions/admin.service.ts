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

export interface DoctorProfileDetail {
  id: string;
  authUserId: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  slmcLicenseNumber?: string;
  professionalBio?: string;
  status: string;
  gender?: string;
  category?: string;
  languages?: string[];
  qualifications?: string[];
  documents?: string[];
  isProfileComplete?: boolean;
  isMobileNumberVerified?: boolean;
  isEmailVerified?: boolean;
  approvedCustomPriceLkr?: number;
}

export interface GetDoctorApplicationsParams {
  status?: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "PAUSED" | "REJECTED";
  search?: string;
  page?: number;
  size?: number;
}

export const getDoctorApplications = async (params?: GetDoctorApplicationsParams): Promise<ApiResponse<DoctorApplicant[]>> => {
  const response = await axiosInstance.get<ApiResponse<DoctorApplicant[]>>(ENDPOINTS.admin.doctors, { params });
  return response.data;
};

export const getDoctorDetails = async (id: string): Promise<ApiResponse<DoctorProfileDetail>> => {
  const response = await axiosInstance.get<ApiResponse<DoctorProfileDetail>>(ENDPOINTS.admin.getDoctor(id));
  return response.data;
};

export const approveDoctorApplication = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.approveDoctor(id));
  return response.data;
};

export const rejectDoctorApplication = async (id: string, reason: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.rejectDoctor(id), { reason });
  return response.data;
};

export const changeDoctorStatusUnified = async (id: string, status: string, reason?: string): Promise<ApiResponse> => {
  const query = `?status=${encodeURIComponent(status)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`;
  const response = await axiosInstance.post<ApiResponse>(`${ENDPOINTS.admin.changeDoctorStatus(id)}${query}`);
  return response.data;
};

// Admin invitation & management integration
export interface AdminInviteRequest {
  email: string;
  role: string;
}

export interface ResendInviteRequest {
  email: string;
}

export interface AdminRoleUpdateRequest {
  role: string;
}

export interface AdminUserResponse {
  id: string | null; // authUserId - null for pending/expired invites
  email: string;
  name: string;
  role: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_INVITE" | "EXPIRED_INVITE";
  invitedAt: string;
  expiresAt?: string;
}

export interface AdminResendInviteResponse {
  email: string;
  expiresAt: string;
}

export interface AdminSuspendResponse {
  adminId: string;
  status: string;
}

export interface AdminRoleUpdateResponse {
  adminId: string;
  newRole: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed current page
  size: number;
}

export interface GetAdminUsersParams {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const inviteAdmin = async (payload: AdminInviteRequest): Promise<ApiResponse<string>> => {
  const response = await axiosInstance.post<ApiResponse<string>>(ENDPOINTS.admin.invite, payload);
  return response.data;
};

export const resendAdminInvitation = async (payload: ResendInviteRequest): Promise<ApiResponse<AdminResendInviteResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AdminResendInviteResponse>>(ENDPOINTS.admin.resendInvite, payload);
  return response.data;
};

export const getAdminUsers = async (params?: GetAdminUsersParams): Promise<ApiResponse<PageResponse<AdminUserResponse>>> => {
  const response = await axiosInstance.get<ApiResponse<PageResponse<AdminUserResponse>>>(ENDPOINTS.admin.users, { params });
  return response.data;
};

export const suspendAdmin = async (authUserId: string): Promise<ApiResponse<AdminSuspendResponse>> => {
  const response = await axiosInstance.patch<ApiResponse<AdminSuspendResponse>>(ENDPOINTS.admin.suspend(authUserId));
  return response.data;
};

export const activateAdmin = async (authUserId: string): Promise<ApiResponse<void>> => {
  const response = await axiosInstance.patch<ApiResponse<void>>(ENDPOINTS.admin.activate(authUserId));
  return response.data;
};

export const updateAdminRole = async (authUserId: string, payload: AdminRoleUpdateRequest): Promise<ApiResponse<AdminRoleUpdateResponse>> => {
  const response = await axiosInstance.patch<ApiResponse<AdminRoleUpdateResponse>>(ENDPOINTS.admin.role(authUserId), payload);
  return response.data;
};
