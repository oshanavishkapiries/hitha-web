import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse, VerifyCodeResponse } from "./auth.service";
import { BlogResponse } from "./blog.service";

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

export interface AdminRegResponse {
  adminId: string;
  email: string;
  role: string;
}

export const adminRegister = async (payload: AdminRegRequest): Promise<ApiResponse<AdminRegResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AdminRegResponse>>(ENDPOINTS.admin.register, payload);
  return response.data;
};

export const adminSendCode = async (payload: SendCodeRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.sendCode, payload);
  return response.data;
};

export const adminVerifyCode = async (payload: VerifyCodeRequest): Promise<ApiResponse<VerifyCodeResponse>> => {
  const response = await axiosInstance.post<ApiResponse<VerifyCodeResponse>>(ENDPOINTS.admin.verifyCode, payload);
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

export interface GetPendingBlogsParams {
  page?: number;
  size?: number;
}

export const getPendingBlogs = async (params?: GetPendingBlogsParams): Promise<ApiResponse<BlogResponse[]>> => {
  const response = await axiosInstance.get<ApiResponse<BlogResponse[]>>(ENDPOINTS.admin.pendingBlogs, { params });
  return response.data;
};

export const approveBlog = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.approveBlog(id));
  return response.data;
};

export const rejectBlog = async (id: string, reason: string): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.admin.rejectBlog(id), { reason });
  return response.data;
};

export type InvitableAdminRole = "ADMIN" | "FINANCIAL_ADMIN" | "CONTENT_ADMIN";
export type AdminRole = "SUPER_ADMIN" | InvitableAdminRole;
export type AdminUserStatus = "ACTIVE" | "INVITED" | "EXPIRED" | "SUSPENDED";

export interface AdminInviteRequest {
  email: string;
  role: InvitableAdminRole;
}

export interface AdminResendInviteResponse {
  email: string;
  expiresAt: string;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  status: AdminUserStatus | string;
  invitedAt?: string;
  expiresAt?: string;
}

export interface GetAdminUsersParams {
  status?: AdminUserStatus;
  search?: string;
  page?: number;
  size?: number;
}

export interface PageAdminUserResponse {
  content: AdminUserResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminRoleUpdateResponse {
  adminId: string;
  newRole: string;
}

export interface AdminSuspendResponse {
  adminId: string;
  status: string;
}

export const inviteAdmin = async (payload: AdminInviteRequest): Promise<ApiResponse<string>> => {
  const response = await axiosInstance.post<ApiResponse<string>>(ENDPOINTS.admin.invite, payload);
  return response.data;
};

export const resendAdminInvite = async (email: string): Promise<ApiResponse<AdminResendInviteResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AdminResendInviteResponse>>(ENDPOINTS.admin.resendInvite, { email });
  return response.data;
};

export const getAdminUsers = async (params?: GetAdminUsersParams): Promise<ApiResponse<PageAdminUserResponse>> => {
  const response = await axiosInstance.get<ApiResponse<PageAdminUserResponse>>(ENDPOINTS.admin.users, { params });
  return response.data;
};

export const updateAdminRole = async (id: string, role: AdminRole): Promise<ApiResponse<AdminRoleUpdateResponse>> => {
  const response = await axiosInstance.patch<ApiResponse<AdminRoleUpdateResponse>>(ENDPOINTS.admin.updateRole(id), { role });
  return response.data;
};

export const suspendAdmin = async (id: string): Promise<ApiResponse<AdminSuspendResponse>> => {
  const response = await axiosInstance.patch<ApiResponse<AdminSuspendResponse>>(ENDPOINTS.admin.suspend(id));
  return response.data;
};

export const activateAdmin = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.patch<ApiResponse>(ENDPOINTS.admin.activate(id));
  return response.data;
};
