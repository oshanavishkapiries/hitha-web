import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "./auth.service";

export interface DoctorLoginRequest {
  identifier: string;
  password: string;
}

export interface DoctorLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
  profileComplete: boolean;
  emailVerified: boolean;
}

export interface DoctorRegRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
  category: "COUNSELOR" | "CLINICAL_COUNSELOR" | "PSYCHOLOGIST" | "CLINICAL_PSYCHOLOGIST" | "MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA" | "CONSULTANT_PSYCHIATRIST";
  slmcLicenseNumber?: string;
  certifiedDocument?: string;
}

export interface DoctorForgotPasswordRequest {
  identifier: string;
  verificationCode: string;
  newPassword: string;
}

export interface DoctorProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  biography?: string;
  specialties?: string[];
  languages?: string[];
  consultationFee?: number;
}

export interface BlockedDateRequest {
  blockedDate: string; // "YYYY-MM-DD"
  reason?: string;
}

export interface BlockedDateResponse {
  id: string;
  blockedDate: string;
  reason: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface AvailabilityConfigRequest {
  slots: AvailabilitySlot[];
  timeSlotDurationMinutes: number;
}

export const doctorLogin = async (payload: DoctorLoginRequest): Promise<ApiResponse<DoctorLoginResponse>> => {
  const response = await axiosInstance.post<ApiResponse<DoctorLoginResponse>>(ENDPOINTS.doctor.login, payload);
  return response.data;
};

export const doctorRegister = async (payload: DoctorRegRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.doctor.register, payload);
  return response.data;
};

export const doctorForgotPasswordReset = async (payload: DoctorForgotPasswordRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.doctor.forgotPassword, payload);
  return response.data;
};

export const getDoctorSummary = async (): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get<ApiResponse<any>>(ENDPOINTS.doctors.me);
  return response.data;
};

export const getDoctorProfile = async (): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get<ApiResponse<any>>(ENDPOINTS.doctors.meProfile);
  return response.data;
};

export const updateDoctorProfile = async (payload: DoctorProfileUpdateRequest): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put<ApiResponse<any>>(ENDPOINTS.doctors.me, payload);
  return response.data;
};

export const completeDoctorProfileOnboarding = async (payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>(ENDPOINTS.doctors.completeProfile, payload);
  return response.data;
};

export const updateDoctorOnlineStatus = async (status: "ONLINE" | "OFFLINE" | "AWAY"): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.patch<ApiResponse<any>>(ENDPOINTS.doctors.updateStatus, { status });
  return response.data;
};

export const getBlockedDates = async (): Promise<ApiResponse<BlockedDateResponse[]>> => {
  const response = await axiosInstance.get<ApiResponse<BlockedDateResponse[]>>(ENDPOINTS.doctors.blockedDates);
  return response.data;
};

export const addBlockedDate = async (payload: BlockedDateRequest): Promise<ApiResponse<BlockedDateResponse>> => {
  const response = await axiosInstance.post<ApiResponse<BlockedDateResponse>>(ENDPOINTS.doctors.blockedDates, payload);
  return response.data;
};

export const removeBlockedDate = async (id: string): Promise<ApiResponse> => {
  const response = await axiosInstance.delete<ApiResponse>(ENDPOINTS.doctors.removeBlockedDate(id));
  return response.data;
};

export const configureDoctorAvailability = async (payload: AvailabilityConfigRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.doctors.slots, payload);
  return response.data;
};

export const getDoctorPriceRequests = async (): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get<ApiResponse<any[]>>(ENDPOINTS.doctors.priceRequests);
  return response.data;
};

export const submitDoctorPriceRequest = async (payload: { requestedPrice: number; justification?: string }): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>(ENDPOINTS.doctors.priceRequests, payload);
  return response.data;
};
