"use client";

import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import CredentialsLoginPage from '../../../components/auth/CredentialsLoginPage';
import { navigateTo } from '../../../utils/navigation';
import { useAdminLogin } from '../../../lib/service/query/useAuth';

export default function AdminLogin() {
  const loginMutation = useAdminLogin();

  return (
    <CredentialsLoginPage
      idPrefix="admin"
      icon={ShieldCheck}
      title="Hitha System Admin Portal"
      subtitle="Secure core terminal to verify SLMC doctor credentials, oversee secure escrow funds, and handle portal system metrics."
      identifierLabel="Administrative Email"
      identifierPlaceholder="admin@hitha.lk"
      identifierIcon={Mail}
      identifierType="email"
      passwordLabel="Root Password"
      submitIdleLabel="Access Admin Panel"
      submitPendingLabel="Verifying Admin Access..."
      invalidCredentialsMessage="Unauthorized administrative access."
      loginMutation={loginMutation}
      onSuccess={() => navigateTo('/admin/dashboard')}
    />
  );
}
