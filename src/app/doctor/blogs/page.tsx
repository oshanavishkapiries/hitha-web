"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../../../components/AppShell";
import { navigateTo } from "../../../utils/navigation";
import { ArrowLeft, Plus, BookOpen, Eye, Heart } from "lucide-react";
import { useDoctorProfile } from "../../../lib/service/query/useDoctor";
import { useMyBlogs } from "../../../lib/service/query/useBlog";
import { getApiErrorMessage } from "../../../utils/errors";
import { useAlert } from "../../../context/AlertContext";
import type { BlogStatus } from "../../../lib/service/functions/blog.service";

const TABS: { label: string; value: BlogStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-white border-hairline text-ink-soft",
  PENDING_REVIEW: "bg-amber-50 border-amber-200 text-amber-700",
  PUBLISHED: "bg-mint/20 border-mint text-forest",
  REJECTED: "bg-red-50 border-red-200 text-red-700",
  SUSPENDED: "bg-clay-tint border-clay/30 text-clay",
};

export default function DoctorBlogsPage() {
  const { showAlert } = useAlert();
  const { data: profile } = useDoctorProfile();
  const doctorId = profile?.id as string | undefined;
  const { data: blogs, isLoading, error } = useMyBlogs(doctorId);
  const [activeTab, setActiveTab] = useState<BlogStatus | "ALL">("ALL");

  useEffect(() => {
    if (error) {
      showAlert(`API Error: ${getApiErrorMessage(error, "Failed to load your articles.")}`, "error");
    }
  }, [error]);

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    if (activeTab === "ALL") return blogs;
    return blogs.filter((b: any) => b.status === activeTab);
  }, [blogs, activeTab]);

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <button
            onClick={() => navigateTo("/doctor/dashboard")}
            className="inline-flex items-center space-x-1.5 text-xs text-forest hover:underline font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-forest">My Wellness Articles</h1>
              <p className="text-xs text-ink-soft mt-1">Write and share mental health insights with the Hitha community.</p>
            </div>
            <button
              onClick={() => navigateTo("/doctor/blogs/new")}
              className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 shrink-0"
              id="doctor-new-blog-btn"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-hairline pb-4">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  activeTab === tab.value
                    ? "bg-forest text-white border-forest"
                    : "bg-white border-hairline text-ink-soft hover:border-forest/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white h-28 rounded-2xl border border-hairline" />
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="bg-white border border-hairline rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-sprout mx-auto" />
              <h3 className="font-display font-bold text-forest">No articles here yet</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Share your clinical insights and wellness guidance with patients across Sri Lanka.
              </p>
              <button
                onClick={() => navigateTo("/doctor/blogs/new")}
                className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write your first article</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBlogs.map((blog: any) => (
                <button
                  key={blog.id}
                  onClick={() => navigateTo(`/doctor/blogs/${blog.id}`)}
                  className="w-full text-left bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated rounded-2xl p-5 transition-all cursor-pointer flex items-center gap-4"
                >
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-20 h-20 rounded-xl object-cover border border-hairline shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-cream border border-hairline flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-sprout" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[blog.status] || STATUS_STYLES.DRAFT}`}>
                        {blog.status.replace(/_/g, " ")}
                      </span>
                      {(blog.topics || []).slice(0, 2).map((topic: string) => (
                        <span key={topic} className="text-[9px] font-semibold text-ink-faint bg-cream px-2 py-0.5 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display font-bold text-forest text-sm truncate">{blog.title}</h3>
                    {blog.status === "PUBLISHED" && (
                      <div className="flex items-center gap-3 text-[10px] text-ink-faint">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views || 0} views</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blog.likeCount || 0} likes</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
