"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, ShieldCheck, Stethoscope } from 'lucide-react';
import CredentialsLoginPage from '../../../components/auth/CredentialsLoginPage';
import { navigateTo } from '../../../utils/navigation';
import { useDoctorLogin } from '../../../lib/service/query/useAuth';

function DoctorLoginContent() {
  const searchParams = useSearchParams();
  const justVerified = searchParams.get('verified') === '1';

  const loginMutation = useDoctorLogin();

  return (
    <CredentialsLoginPage
      idPrefix="doctor"
      icon={Stethoscope}
      title="Doctor Consultation Portal"
      subtitle="Access your secure, trilingual counseling sanctuary dashboard using your registered account."
      identifierLabel="Email or Phone Number"
      identifierPlaceholder="doctor@hitha.lk or +94 77 123 4567"
      identifierIcon={User}
      passwordLabel="Portal Password"
      submitIdleLabel="Sign In to Portal"
      submitPendingLabel="Verifying on Secure Server..."
      invalidCredentialsMessage="Invalid email/phone number or password combination."
      loginMutation={loginMutation}
      onSuccess={(response) => {
        if (response.data?.profileComplete === false) {
          navigateTo('/doctor/complete-profile');
        } else {
          navigateTo('/doctor/dashboard');
        }
      }}
      notice={
        justVerified ? (
          <div className="bg-mint/10 border border-mint/30 text-forest p-3 rounded-xl text-xs flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Phone verified successfully! You can now sign in.</span>
          </div>
        ) : undefined
      }
      footer={
        <p className="text-center text-xs text-ink-soft">
          New to Hitha?{' '}
          <button
            type="button"
            onClick={() => navigateTo('/doctor/register')}
            className="text-forest font-semibold hover:underline cursor-pointer"
            id="doctor-login-register-link"
          >
            Register as a Doctor
          </button>
        </p>
      }
    />
  );
}

export default function DoctorLogin() {
  return (
    <Suspense fallback={null}>
      <DoctorLoginContent />
    </Suspense>
  );
}
