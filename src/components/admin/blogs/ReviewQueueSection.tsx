"use client";

import React, { useEffect, useState } from "react";
import { IconCheck, IconX, IconEye } from "@tabler/icons-react";
import { BookOpen } from "lucide-react";
import { usePendingBlogs, useApproveBlog, useRejectBlog } from "../../../lib/service/query/useAdmin";
import { useAlert } from "../../../context/AlertContext";
import { getApiErrorMessage } from "../../../utils/errors";
import BlogPreviewModal from "../../blog/BlogPreviewModal";

export default function ReviewQueueSection() {
  const { showAlert } = useAlert();
  const { data: pendingBlogs, isLoading, error } = usePendingBlogs();
  const approveMutation = useApproveBlog();
  const rejectMutation = useRejectBlog();

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (error) {
      showAlert(`API Error: ${getApiErrorMessage(error, "Failed to load pending articles.")}`, "error");
    }
  }, [error]);

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      showAlert("Article approved and published.", "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to approve article.")}`, "error");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) {
      showAlert("Please provide a rejection reason.", "warning");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: rejectId, reason: rejectReason.trim() });
      showAlert("Article rejected and sent back to draft.", "success");
      setRejectId(null);
      setRejectReason("");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, "Failed to reject article.")}`, "error");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white h-24 rounded-2xl border border-hairline" />
          ))}
        </div>
      ) : !pendingBlogs || pendingBlogs.length === 0 ? (
        <div className="bg-white border border-hairline rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-sprout mx-auto" />
          <h3 className="font-display font-bold text-forest">Queue is empty</h3>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">No doctor-submitted articles are currently awaiting review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingBlogs.map((blog: any) => (
            <div
              key={blog.id}
              onClick={() => setPreviewId(blog.id)}
              className="bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 cursor-pointer"
            >
              {blog.coverImage ? (
                <img src={blog.coverImage} alt={blog.title} className="w-16 h-16 rounded-xl object-cover border border-hairline shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-cream border border-hairline flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-sprout" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-forest text-sm truncate">{blog.title}</h3>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  By {blog.author?.name || "Unknown"} · {(blog.topics || []).join(", ") || "No topics"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(blog.id);
                  }}
                  disabled={approveMutation.isPending}
                  className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectId(blog.id);
                  }}
                  className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <IconX className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewId && <BlogPreviewModal blogId={previewId} onClose={() => setPreviewId(null)} />}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E17]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-hairline w-full max-w-md p-6 rounded-3xl shadow-elevated space-y-4 animate-scale-up">
            <h3 className="font-display font-bold text-lg text-forest">Reject Article</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Provide a reason so the doctor understands what to revise. The article will return to draft status.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please cite clinical sources for the claims made in paragraph two."
              className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all leading-relaxed"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectId(null);
                  setRejectReason("");
                }}
                className="flex-1 bg-cream hover:bg-cream/80 text-forest text-xs font-bold py-3 rounded-xl border border-hairline transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
