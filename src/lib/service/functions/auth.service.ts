import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";

export interface ApiResponse<T = null> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  pagination?: any | null;
  errors?: any[] | null;
  debug?: any | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyResetTokenRequest {
  email: string;
  token: string;
}

export interface SendCodeRequest {
  identifier: string; // email or phone number
  purpose: "REGISTER" | "EMAIL_VERIFICATION" | "PATIENT_LOGIN" | "PASSWORD_RESET";
}

export interface VerifyCodeRequest {
  identifier: string;
  verificationCode: string;
}

export interface VerifyCodeResponse {
  verified: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  role?: string;
}

export const sendVerificationCode = async (payload: SendCodeRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.auth.sendCode, payload);
  return response.data;
};

export const verifyVerificationCode = async (payload: VerifyCodeRequest): Promise<ApiResponse<VerifyCodeResponse>> => {
  const response = await axiosInstance.post<ApiResponse<VerifyCodeResponse>>(ENDPOINTS.auth.verifyCode, payload);
  return response.data;
};

export const refreshTokens = async (payload: RefreshTokenRequest): Promise<ApiResponse<{ accessToken: string; refreshToken: string; role: string; profileComplete: boolean }>> => {
  const response = await axiosInstance.post<ApiResponse<{ accessToken: string; refreshToken: string; role: string; profileComplete: boolean }>>(
    ENDPOINTS.auth.refresh,
    payload
  );
  return response.data;
};

export const logoutSession = async (payload: RefreshTokenRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.auth.logout, payload);
  return response.data;
};

export const requestPasswordReset = async (payload: ForgotPasswordRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.auth.forgotPassword, payload);
  return response.data;
};

export const resetPasswordWithToken = async (payload: ResetPasswordRequest): Promise<ApiResponse> => {
  const response = await axiosInstance.post<ApiResponse>(ENDPOINTS.auth.resetPassword, payload);
  return response.data;
};
