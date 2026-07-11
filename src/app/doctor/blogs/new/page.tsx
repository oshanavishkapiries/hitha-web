"use client";

import React from "react";
import AppShell from "../../../../components/AppShell";
import BlogEditorForm from "../../../../components/blog/BlogEditorForm";

export default function NewDoctorBlogPage() {
  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <BlogEditorForm
          backHref="/doctor/blogs"
          afterSaveHref={(id) => `/doctor/blogs/${id}`}
          uploadFolder="blog-covers"
        />
      </div>
    </AppShell>
  );
}
