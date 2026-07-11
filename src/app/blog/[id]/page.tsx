"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { useBlog, useToggleLikeBlog, useTrackShareBlog } from "../../../lib/service/query/useBlog";
import BlockRenderer, { parseBlogContent } from "../../../components/blog/BlockRenderer";
import { navigateTo } from "../../../utils/navigation";
import { useAlert } from "../../../context/AlertContext";
import { getApiErrorMessage } from "../../../utils/errors";
import { ArrowLeft, Heart, Share2, Calendar, User, Clock, Loader2, ShieldAlert } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { showAlert } = useAlert();

  const { data: blog, isLoading, isError } = useBlog(id);
  const toggleLikeMutation = useToggleLikeBlog();
  const trackShareMutation = useTrackShareBlog();

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Sync likes state with API data on load
  useEffect(() => {
    if (blog) {
      setLikeCount(blog.likeCount || 0);
      // The API toggles likes. In a real session, if liked, we'd persist locally or session-based.
      // We will initialize as false but keep tracked changes responsive.
    }
  }, [blog]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      const res = await toggleLikeMutation.mutateAsync(blog.id);
      setHasLiked(res.liked);
      setLikeCount(res.likeCount);
      if (res.liked) {
        showAlert("Article added to your favorites.", "success");
      } else {
        showAlert("Article removed from your favorites.", "success");
      }
    } catch (err: any) {
      showAlert(`Like Error: ${getApiErrorMessage(err, "Failed to toggle like on this article.")}`, "error");
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    try {
      // In a real browser, copy to clipboard
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        showAlert("Article link copied to clipboard!", "success");
      }
      await trackShareMutation.mutateAsync(blog.id);
    } catch (err: any) {
      // Non-blocking fail
      console.error("Failed to track share count", err);
    }
  };

  // Reading time estimation
  let readTimeMin = 3;
  if (blog?.content) {
    try {
      const rawBlocks = JSON.parse(blog.content || "{}").blocks;
      const textLength = (rawBlocks || []).reduce((acc: number, curr: any) => acc + (curr.data?.text?.length || 0), 0);
      readTimeMin = Math.max(1, Math.ceil(textLength / 1000));
    } catch (e) {
      // Ignore
    }
  }

  const formattedDate = blog?.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Published";

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back link */}
          <button
            onClick={() => navigateTo("/blog")}
            className="inline-flex items-center space-x-1.5 text-xs text-forest hover:underline font-bold cursor-pointer transition-all focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wellness Articles</span>
          </button>

          {isLoading ? (
            <div className="bg-white border border-hairline rounded-3xl p-16 flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-forest" />
              <p className="text-xs text-ink-soft font-sans font-medium">Opening wellness article...</p>
            </div>
          ) : isError || !blog ? (
            <div className="bg-white border border-hairline rounded-3xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-resting">
              <ShieldAlert className="w-12 h-12 text-clay mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-forest text-lg">Unable to load article</h3>
                <p className="text-xs text-ink-soft leading-relaxed max-w-sm mx-auto">
                  The article you requested might have been retracted, suspended, or does not exist.
                </p>
              </div>
              <button
                onClick={() => navigateTo("/blog")}
                className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-resting"
              >
                Return to Articles
              </button>
            </div>
          ) : (
            <article className="bg-white border border-hairline rounded-3xl shadow-resting p-6 sm:p-10 space-y-6 overflow-hidden">
              {/* Header meta */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(blog.topics || []).map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sprout/60 bg-sprout/10 text-forest"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-forest leading-tight tracking-tight">
                  {blog.title}
                </h1>

                {/* Author profile row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-hairline/60 py-3 text-xs text-ink-soft font-sans">
                  <div className="flex items-center space-x-3">
                    {blog.author?.profilePicture ? (
                      <img
                        src={blog.author.profilePicture}
                        alt={blog.author.name}
                        className="w-10 h-10 rounded-full object-cover border border-hairline shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cream border border-hairline flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-moss" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-forest">
                        {blog.author?.name || "Hitha Specialist"}
                      </div>
                      <div className="text-[10px] text-ink-faint">
                        {blog.authorType === "DOCTOR" ? "Accredited Practitioner" : "Editorial Team"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-ink-faint text-[11px] shrink-0">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{readTimeMin} min read</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image banner */}
              {blog.coverImage && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-hairline bg-cream relative">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Main Content Body */}
              <div className="prose prose-forest max-w-none py-2">
                <BlockRenderer data={parseBlogContent(blog.content)} />
              </div>

              {/* Bottom interaction & Bio Footer */}
              <div className="pt-6 border-t border-hairline space-y-6">
                {/* Share/Like Toolbar */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLike}
                    disabled={toggleLikeMutation.isPending}
                    className={`inline-flex items-center space-x-2 text-xs font-sans font-bold px-4 py-2.5 rounded-full border transition-all cursor-pointer ${
                      hasLiked
                        ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                        : "bg-white border-hairline text-ink-soft hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-red-600" : ""}`} />
                    <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center space-x-2 text-xs font-sans font-bold px-4 py-2.5 rounded-full border border-hairline bg-white text-ink-soft hover:border-forest/30 hover:text-forest transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-moss" />
                    <span>Share Article</span>
                  </button>
                </div>

                {/* Author Bio Card */}
                {blog.author?.professionalBio && (
                  <div className="bg-cream/20 border border-hairline rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] font-sans font-bold text-moss uppercase tracking-wider">About the Author</span>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {blog.author.professionalBio}
                    </p>
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
    </AppShell>
  );
}
