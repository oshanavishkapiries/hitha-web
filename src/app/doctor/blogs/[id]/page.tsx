"use client";

import React from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../../components/AppShell";
import BlogEditorForm from "../../../../components/blog/BlogEditorForm";

export default function EditDoctorBlogPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <BlogEditorForm
          blogId={id}
          backHref="/doctor/blogs"
          afterSaveHref={(savedId) => `/doctor/blogs/${savedId}`}
          uploadFolder="blog-covers"
        />
      </div>
    </AppShell>
  );
}
