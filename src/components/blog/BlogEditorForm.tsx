"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ImagePlus, Plus, RefreshCw, Send, Save, X, ArrowLeft } from "lucide-react";
import type { BlockEditorHandle } from "./BlockEditor";
import BlockRenderer, { parseBlogContent } from "./BlockRenderer";
import { useBlog, useCreateBlog, useUpdateBlog } from "../../lib/service/query/useBlog";
import { useUploadFile } from "../../lib/service/query/useUpload";
import { getApiErrorMessage } from "../../utils/errors";
import { useAlert } from "../../context/AlertContext";
import { navigateTo } from "../../utils/navigation";
import type { OutputData } from "@editorjs/editorjs";

const BlockEditor = dynamic(() => import("./BlockEditor"), {
  ssr: false,
  loading: () => <div className="text-xs text-ink-faint py-8 text-center">Loading editor...</div>,
});

interface BlogEditorFormProps {
  blogId?: string;
  backHref: string;
  afterSaveHref: (id: string) => string;
  uploadFolder?: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-white border-hairline text-ink-soft",
  PENDING_REVIEW: "bg-amber-50 border-amber-200 text-amber-700",
  PUBLISHED: "bg-mint/20 border-mint text-forest",
  REJECTED: "bg-red-50 border-red-200 text-red-700",
  SUSPENDED: "bg-clay-tint border-clay/30 text-clay",
};

export default function BlogEditorForm({ blogId, backHref, afterSaveHref, uploadFolder = "blog-covers" }: BlogEditorFormProps) {
  const { showAlert } = useAlert();
  const { data: blog, isLoading: isBlogLoading, error: blogError } = useBlog(blogId);
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  const uploadFileMutation = useUploadFile();

  const editorRef = useRef<BlockEditorHandle>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState<OutputData | undefined>(undefined);
  const [savingAction, setSavingAction] = useState<"draft" | "review" | null>(null);

  useEffect(() => {
    if (blogError) {
      showAlert(`API Error: ${getApiErrorMessage(blogError, "Failed to load article.")}`, "error");
    }
  }, [blogError]);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || "");
      setTopics(blog.topics || []);
      setCoverImagePreview(blog.coverImage || null);
      setInitialContent(parseBlogContent(blog.content) || { blocks: [] });
    }
  }, [blog]);

  const isEditingExisting = !!blogId;
  const status = blog?.status;
  const isReadOnly = isEditingExisting && !!status && status !== "DRAFT" && status !== "REJECTED";

  const handleAddTopic = () => {
    const val = topicInput.trim();
    if (val && !topics.includes(val)) {
      setTopics((prev) => [...prev, val]);
    }
    setTopicInput("");
  };

  const handleRemoveTopic = (topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert("Cover image exceeds the 5MB limit.", "warning");
      return;
    }
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!title.trim()) {
      showAlert("Please give your article a title before saving.", "warning");
      return;
    }

    setSavingAction(submitForReview ? "review" : "draft");
    try {
      const outputData = await editorRef.current?.save();
      if (!outputData || outputData.blocks.length === 0) {
        showAlert("Add at least one block of content before saving.", "warning");
        setSavingAction(null);
        return;
      }

      let coverImageUrl = coverImagePreview || undefined;
      if (coverImageFile) {
        coverImageUrl = await uploadFileMutation.mutateAsync({ file: coverImageFile, folder: uploadFolder });
      }

      const payload = {
        title: title.trim(),
        content: JSON.stringify(outputData),
        coverImage: coverImageUrl,
        topics,
        submitForReview,
      };

      const result = blogId
        ? await updateBlogMutation.mutateAsync({ id: blogId, payload })
        : await createBlogMutation.mutateAsync(payload);

      showAlert(
        submitForReview ? "Article submitted for review!" : "Draft saved successfully!",
        "success"
      );

      if (result?.id) {
        navigateTo(afterSaveHref(result.id));
      }
    } catch (err: any) {
      showAlert(`Error saving article: ${getApiErrorMessage(err, "Please try again.")}`, "error");
    } finally {
      setSavingAction(null);
    }
  };

  if (isEditingExisting && isBlogLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white h-64 rounded-3xl border border-hairline" />
        <div className="bg-white h-96 rounded-3xl border border-hairline" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigateTo(backHref)}
        className="inline-flex items-center space-x-1.5 text-xs text-forest hover:underline font-bold cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {status && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
          {status.replace(/_/g, " ")}
        </div>
      )}

      {isReadOnly && (
        <div className="bg-cream border border-hairline rounded-2xl p-4 text-xs text-ink-soft leading-relaxed">
          {status === "PENDING_REVIEW" &&
            "This article has been submitted and is awaiting administrator review. It can't be edited until it's reviewed."}
          {status === "PUBLISHED" && "This article is live on the platform."}
          {status === "SUSPENDED" && "This article has been suspended by an administrator."}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Title</label>
          {isReadOnly ? (
            <h1 className="text-2xl font-display font-bold text-forest">{title}</h1>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A compassionate, clear title for your article..."
              className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-base font-display font-semibold text-forest outline-none transition-all"
            />
          )}
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Cover Image</label>
          {isReadOnly ? (
            coverImagePreview && (
              <img src={coverImagePreview} alt={title} className="w-full max-h-72 object-cover rounded-2xl border border-hairline" />
            )
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative group w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed border-hairline hover:border-mint bg-cream flex items-center justify-center cursor-pointer transition-colors"
            >
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-ink-faint">
                  <ImagePlus className="w-7 h-7 mb-1.5" />
                  <span className="text-xs font-semibold">Click to upload a cover image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-[#0B1E17]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Change Cover</span>
              </div>
            </div>
          )}
          <input type="file" ref={coverInputRef} onChange={handleCoverImageChange} accept="image/*" className="hidden" />
        </div>

        {/* Topics */}
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-2">Topics</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-mint/20 border border-mint text-forest flex items-center gap-1"
              >
                <span>{topic}</span>
                {!isReadOnly && (
                  <button type="button" onClick={() => handleRemoveTopic(topic)} className="cursor-pointer">
                    <X className="w-3 h-3 text-forest" />
                  </button>
                )}
              </span>
            ))}
            {topics.length === 0 && <p className="text-xs text-ink-soft italic">No topics added yet.</p>}
          </div>
          {!isReadOnly && (
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="e.g. Anxiety"
                className="bg-cream border border-hairline rounded-xl px-3 py-1.5 text-xs text-forest outline-none focus:border-forest"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1.5">Content</label>
          <div className="bg-cream/40 border border-hairline rounded-2xl px-4 py-4 min-h-[300px]">
            {isReadOnly ? (
              <BlockRenderer data={initialContent} />
            ) : (
              <BlockEditor ref={editorRef} initialData={initialContent} uploadFolder={uploadFolder} />
            )}
          </div>
        </div>

        {/* Actions */}
        {!isReadOnly && (
          <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={savingAction !== null}
              className="bg-cream hover:bg-cream/80 text-forest border border-hairline text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {savingAction === "draft" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={savingAction !== null}
              className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {savingAction === "review" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Submit for Review</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
