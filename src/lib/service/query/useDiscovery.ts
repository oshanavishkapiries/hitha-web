"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  discoverDoctors,
  getDoctorPublicDetail,
  DiscoverDoctorsParams,
  PaginationMeta,
} from "../functions/discovery.service";

export const useDiscoverDoctors = (params: DiscoverDoctorsParams) => {
  return useQuery({
    queryKey: ["discover_doctors", params],
    queryFn: async () => {
      const res = await discoverDoctors(params);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctors");
      }
      return {
        doctors: res.data || [],
        pagination: (res.pagination as PaginationMeta) || null,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useDoctorPublicDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["doctor_public_detail", id],
    queryFn: async () => {
      const res = await getDoctorPublicDetail(id as string);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch doctor details");
      }
      return res.data;
    },
    enabled: !!id,
  });
};
