"use client";

import React from "react";
import AppShell from "../../../../components/AppShell";
import AdminSidebarShell from "../../../../components/admin/AdminSidebarShell";
import BlogEditorForm from "../../../../components/blog/BlogEditorForm";

export default function NewAdminBlogPage() {
  return (
    <AppShell>
      <AdminSidebarShell
        activeNav="blogs-mine"
        title="New Article"
        subtitle="Publish wellness guidance directly from the Hitha admin team."
      >
        <BlogEditorForm
          backHref="/admin/blogs"
          afterSaveHref={(id) => `/admin/blogs/${id}`}
          uploadFolder="blog-covers"
        />
      </AdminSidebarShell>
    </AppShell>
  );
}
