"use client";

import React from "react";
import { IconX } from "@tabler/icons-react";
import { useBlog } from "../../lib/service/query/useBlog";
import BlockRenderer, { parseBlogContent } from "./BlockRenderer";

interface BlogPreviewModalProps {
  blogId: string;
  onClose: () => void;
}

export default function BlogPreviewModal({ blogId, onClose }: BlogPreviewModalProps) {
  const { data: blog, isLoading } = useBlog(blogId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E17]/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-elevated border border-hairline animate-scale-up">
        <div className="flex justify-between items-center px-6 py-4 border-b border-hairline bg-cream/40 shrink-0">
          <span className="font-display font-semibold text-base text-forest">Article Preview</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-cream text-ink-soft hover:text-ink transition-all cursor-pointer">
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading || !blog ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 bg-cream rounded w-2/3" />
              <div className="h-40 bg-cream rounded-2xl" />
            </div>
          ) : (
            <>
              {blog.coverImage && (
                <img src={blog.coverImage} alt={blog.title} className="w-full max-h-64 object-cover rounded-2xl border border-hairline" />
              )}
              <h2 className="text-2xl font-display font-bold text-forest">{blog.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {(blog.topics || []).map((t: string) => (
                  <span key={t} className="text-[10px] font-semibold text-forest bg-mint/20 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <BlockRenderer data={parseBlogContent(blog.content)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
