import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "./auth.service";

export type BlogStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "SUSPENDED";
export type BlogAuthorType = "DOCTOR" | "ADMIN";

export interface AuthorInfo {
  id: string;
  name: string;
  profilePicture?: string;
}

export interface AuthorDetailInfo extends AuthorInfo {
  professionalBio?: string;
}

export interface BlogResponse {
  id: string;
  title: string;
  summary?: string;
  coverImage?: string;
  topics: string[];
  likeCount: number;
  views: number;
  status: BlogStatus;
  authorType: BlogAuthorType;
  author: AuthorInfo;
  publishedAt?: string;
}

export interface BlogDetailResponse {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  topics: string[];
  likeCount: number;
  views: number;
  status?: BlogStatus;
  authorType: BlogAuthorType;
  author: AuthorDetailInfo;
  publishedAt?: string;
}

export interface BlogSaveResponse {
  id: string;
  status: BlogStatus;
}

export interface BlogCreateRequest {
  title: string;
  content: string;
  coverImage?: string;
  topics?: string[];
  submitForReview?: boolean;
}

export interface GetBlogsParams {
  status?: BlogStatus;
  topic?: string;
  authorId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export const getBlogs = async (params?: GetBlogsParams): Promise<ApiResponse<BlogResponse[]>> => {
  const response = await axiosInstance.get<ApiResponse<BlogResponse[]>>(ENDPOINTS.blogs.list, { params });
  return response.data;
};

export const getBlog = async (id: string): Promise<ApiResponse<BlogDetailResponse>> => {
  const response = await axiosInstance.get<ApiResponse<BlogDetailResponse>>(ENDPOINTS.blogs.detail(id));
  return response.data;
};

export const createBlog = async (payload: BlogCreateRequest): Promise<ApiResponse<BlogSaveResponse>> => {
  const response = await axiosInstance.post<ApiResponse<BlogSaveResponse>>(ENDPOINTS.blogs.list, payload);
  return response.data;
};

export const updateBlog = async (id: string, payload: BlogCreateRequest): Promise<ApiResponse<BlogSaveResponse>> => {
  const response = await axiosInstance.put<ApiResponse<BlogSaveResponse>>(ENDPOINTS.blogs.detail(id), payload);
  return response.data;
};
