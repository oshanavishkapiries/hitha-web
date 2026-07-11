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
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl border border-hairline" />
            ))}
          </div>
        ) : !blogs || blogs.length === 0 ? (
          <div className="bg-white border border-hairline rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-sprout mx-auto" />
            <h3 className="font-display font-bold text-forest">No articles found</h3>
            <p className="text-xs text-ink-soft max-w-sm mx-auto">Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog: any) => (
              <div
                key={blog.id}
                className="bg-white border border-hairline rounded-2xl p-5 flex items-center gap-4 shadow-resting"
              >
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="w-14 h-14 rounded-xl object-cover border border-hairline shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-cream border border-hairline flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-sprout" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[blog.status] || STATUS_STYLES.DRAFT}`}>
                      {blog.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[9px] font-semibold text-ink-faint bg-cream px-2 py-0.5 rounded-full">
                      {blog.authorType}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-forest text-sm truncate">{blog.title}</h3>
                  <p className="text-[11px] text-ink-soft mt-0.5">By {blog.author?.name || "Unknown"}</p>
                </div>

                <button
                  onClick={() => setPreviewId(blog.id)}
                  className="p-2.5 rounded-xl border border-hairline text-ink-soft hover:border-forest/30 hover:text-forest transition-all cursor-pointer shrink-0"
                  title="Preview"
                >
                  <IconEye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewId && <BlogPreviewModal blogId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
