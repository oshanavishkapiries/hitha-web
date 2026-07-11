"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  toggleLike,
  trackShare,
  GetBlogsParams,
  BlogCreateRequest,
} from "../functions/blog.service";

const normalizeList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && Array.isArray(data.content)) {
    return data.content;
  }
  return [];
};

export const useBlogs = (params?: GetBlogsParams) => {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: async () => {
      const res = await getBlogs(params);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch blogs");
      }
      return normalizeList(res.data);
    },
  });
};

export const useMyBlogs = (authorId: string | null | undefined, status?: GetBlogsParams["status"]) => {
  return useQuery({
    queryKey: ["my_blogs", authorId, status],
    queryFn: async () => {
      const res = await getBlogs({ authorId: authorId as string, status, size: 100 });
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch your blogs");
      }
      return normalizeList(res.data);
    },
    enabled: !!authorId,
  });
};

export const useBlog = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await getBlog(id as string);
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch blog");
      }
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BlogCreateRequest) => {
      const res = await createBlog(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to create blog");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: BlogCreateRequest }) => {
      const res = await updateBlog(id, payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to update blog");
      }
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my_blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
    },
  });
};

export const useToggleLikeBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await toggleLike(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to toggle like");
      }
      return res.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useTrackShareBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await trackShare(id);
      if (!res.success) {
        throw new Error(res.message || "Failed to track share");
      }
      return res.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};
