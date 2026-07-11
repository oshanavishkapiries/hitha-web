"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PhoneVerificationPage from "../../../components/auth/PhoneVerificationPage";
import { useAdminSendCode, useAdminVerifyCode } from "../../../lib/service/query/useAuth";

function AdminVerifyPhoneContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "";

  const sendCodeMutation = useAdminSendCode();
  const verifyCodeMutation = useAdminVerifyCode();

  return (
    <PhoneVerificationPage
      identifier={identifier}
      sendCodeMutation={sendCodeMutation}
      verifyCodeMutation={verifyCodeMutation}
      idPrefix="admin-verify-phone"
      backHref="/admin/login"
      backLabel="Back to login"
      verifiedMessage="Phone verified successfully! Redirecting you to the admin dashboard..."
      redirectHref="/admin/dashboard"
    />
  );
}

export default function AdminVerifyPhonePage() {
  return (
    <Suspense fallback={null}>
      <AdminVerifyPhoneContent />
    </Suspense>
  );
}
