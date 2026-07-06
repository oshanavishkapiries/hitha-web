"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../functions/upload.service";

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const res = await uploadFile(file, folder);
      if (!res.success || !res.data) {
        throw new Error(res.message || `Failed to upload ${file.name}`);
      }
      return res.data;
    },
  });
};
