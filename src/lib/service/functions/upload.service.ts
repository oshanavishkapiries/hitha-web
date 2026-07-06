import axiosInstance from "../axios.client";
import { ENDPOINTS } from "../endpoints";
import { ApiResponse } from "./auth.service";

export const uploadFile = async (file: File, folder?: string): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<ApiResponse<string>>(ENDPOINTS.files.upload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    params: folder ? { folder } : undefined,
  });
  return response.data;
};
