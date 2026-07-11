"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PhoneVerificationPage from '../../../components/auth/PhoneVerificationPage';
import { useSendVerificationCode, useVerifyVerificationCode } from '../../../lib/service/query/useAuth';

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || '';

  const sendCodeMutation = useSendVerificationCode();
  const verifyCodeMutation = useVerifyVerificationCode();

  return (
    <PhoneVerificationPage
      identifier={identifier}
      sendCodeMutation={sendCodeMutation}
      verifyCodeMutation={verifyCodeMutation}
      idPrefix="verify-phone"
      backHref="/doctor/register"
      backLabel="Back to registration"
      verifiedMessage="Phone verified successfully! Redirecting you to login..."
      redirectHref="/doctor/login?verified=1"
    />
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={null}>
      <VerifyPhoneContent />
    </Suspense>
  );
}
