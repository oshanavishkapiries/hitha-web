import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "./auth.service";
import { Specialization } from "../../../types";

export interface DoctorCardResponse {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  languages: string[];
  startingPrice: number | null;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  reviewText: string;
  reviewerNickname: string;
  createdAt: string;
}

export interface SlotResponse {
  id: string;
  startTime: string;
  endTime: string;
  priceLkr: number;
}

export interface DoctorDetailResponse {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  professionalBio?: string;
  gender?: string;
  languages: string[];
  qualifications: string[];
  reviews: ReviewResponse[];
  availableSlots: SlotResponse[];
  extraTimePriceLkr?: number;
  extraTimeMinutes?: number;
  slotDurationMinutes?: number;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// The backend's registration category enum (e.g. "CONSULTANT_PSYCHIATRIST") differs
// from the human-readable Specialization labels shown in the UI.
export const SPECIALIZATION_TO_CATEGORY: Record<Specialization, string> = {
  "Counselor": "COUNSELOR",
  "Clinical Counselor": "CLINICAL_COUNSELOR",
  "Psychologist": "PSYCHOLOGIST",
  "Clinical Psychologist": "CLINICAL_PSYCHOLOGIST",
  "Medical Officer (Psychiatry Diploma)": "MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA",
  "Consultant Psychiatrist": "CONSULTANT_PSYCHIATRIST",
};

export interface DiscoverDoctorsParams {
  name?: string;
  category?: Specialization | "";
  language?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number; // 0-indexed
  size?: number;
}

export const discoverDoctors = async (
  params: DiscoverDoctorsParams
): Promise<ApiResponse<DoctorCardResponse[]>> => {
  const { category, ...rest } = params;
  const response = await axiosInstance.get<ApiResponse<DoctorCardResponse[]>>(ENDPOINTS.patients.doctors, {
    params: {
      ...rest,
      category: category ? SPECIALIZATION_TO_CATEGORY[category] : undefined,
    },
  });
  return response.data;
};

export const getDoctorPublicDetail = async (id: string): Promise<ApiResponse<DoctorDetailResponse>> => {
  const response = await axiosInstance.get<ApiResponse<DoctorDetailResponse>>(ENDPOINTS.patients.doctorDetail(id));
  return response.data;
};
