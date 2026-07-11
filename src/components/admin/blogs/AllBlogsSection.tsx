"use client";

import React, { useEffect, useState } from "react";
import { IconSearch, IconEye } from "@tabler/icons-react";
import { BookOpen } from "lucide-react";
import { useBlogs } from "../../../lib/service/query/useBlog";
import { useAlert } from "../../../context/AlertContext";
import { getApiErrorMessage } from "../../../utils/errors";
import BlogPreviewModal from "../../blog/BlogPreviewModal";
import type { BlogStatus } from "../../../lib/service/functions/blog.service";
import Dropdown from "../../Dropdown";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-white border-hairline text-ink-soft",
  PENDING_REVIEW: "bg-amber-50 border-amber-200 text-amber-700",
  PUBLISHED: "bg-mint/20 border-mint text-forest",
  REJECTED: "bg-red-50 border-red-200 text-red-700",
  SUSPENDED: "bg-clay-tint border-clay/30 text-clay",
};

const STATUS_OPTIONS: (BlogStatus | "")[] = ["", "DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "SUSPENDED"];

const statusOptions = STATUS_OPTIONS.map((opt) => ({
  value: opt,
  label: opt ? opt.replace(/_/g, " ") : "All statuses",
}));

export default function AllBlogsSection() {
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BlogStatus | "">("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: blogs, isLoading, error } = useBlogs({
    search: search.trim() || undefined,
    status: status || undefined,
    size: 100,
  });

  useEffect(() => {
    if (error) {
      showAlert(`API Error: ${getApiErrorMessage(error, "Failed to load articles.")}`, "error");
    }
  }, [error]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-white border border-hairline focus:border-forest/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <Dropdown
            options={statusOptions}
            value={status}
            onChange={(value) => setStatus(value as BlogStatus | "")}
            placeholder="All statuses"
            buttonClassName="w-full bg-white border border-hairline focus:border-forest/50 rounded-xl px-4 py-2.5 text-sm text-ink flex justify-between items-center cursor-pointer transition-all outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-56 rounded-2xl border border-hairline" />
            ))}
          </div>
        ) : !blogs || blogs.length === 0 ? (
          <div className="bg-white border border-hairline rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-sprout mx-auto" />
            <h3 className="font-display font-bold text-forest">No articles found</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {blogs.map((blog: any) => (
              <button
                key={blog.id}
                type="button"
                onClick={() => setPreviewId(blog.id)}
                className="group bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col text-left outline-none"
              >
                {/* Thumbnail Focus Header */}
                <div className="relative w-full aspect-video bg-cream overflow-hidden border-b border-hairline shrink-0">
                  {blog.coverImage ? (
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-sprout" />
                    </div>
                  )}
                  {/* Status Badge in thumbnail */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${STATUS_STYLES[blog.status] || STATUS_STYLES.DRAFT}`}>
                      {blog.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-forest text-sm line-clamp-2 leading-snug group-hover:text-forest-hover transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-[11px] text-ink-soft">By {blog.author?.name || "Unknown"}</p>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between pt-2 border-t border-hairline/60 text-[9px] font-semibold text-ink-faint">
                    <span className="bg-cream px-2 py-0.5 rounded-full uppercase border border-hairline">
                      {blog.authorType}
                    </span>
                    {blog.status === "PUBLISHED" && (
                      <span className="flex items-center gap-1">
                        <IconEye className="w-3.5 h-3.5" />
                        <span>{blog.views || 0}</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {previewId && <BlogPreviewModal blogId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
