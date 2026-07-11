"use client";

import React from "react";
import { useParams } from "next/navigation";
import AppShell from "../../../../components/AppShell";
import AdminSidebarShell from "../../../../components/admin/AdminSidebarShell";
import BlogEditorForm from "../../../../components/blog/BlogEditorForm";

export default function EditAdminBlogPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <AppShell>
      <AdminSidebarShell
        activeNav="blogs-mine"
        title="Edit Article"
        subtitle="Publish wellness guidance directly from the Hitha admin team."
      >
        <BlogEditorForm
          blogId={id}
          backHref="/admin/blogs"
          afterSaveHref={(savedId) => `/admin/blogs/${savedId}`}
          uploadFolder="blog-covers"
        />
      </AdminSidebarShell>
    </AppShell>
  );
}
