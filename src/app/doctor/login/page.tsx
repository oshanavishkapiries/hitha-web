"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, User, ShieldAlert, ArrowLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import { useDoctorLogin } from '../../../lib/service/query/useAuth';

function DoctorLoginContent() {
  const searchParams = useSearchParams();
  const justVerified = searchParams.get('verified') === '1';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useDoctorLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Attempt authenticating using the real backend API service
      const response = await loginMutation.mutateAsync({
        identifier,
        password: password
      });

      if (response.success) {
        if (response.data?.profileComplete === false) {
          navigateTo('/doctor/complete-profile');
        } else {
          navigateTo('/doctor/dashboard');
        }
      } else {
        setError(response.message || 'Invalid email/phone number or password combination.');
      }
    } catch (err: any) {
      console.error("Real login failed:", err);
      setError(
        err?.message || 'Real backend API connection failed or is currently unreachable. Please verify your internet connection or server status.'
      );
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-mint via-forest to-moss" />

          <div className="text-center">
            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors"
              id="doctor-back-home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest">
              Doctor Consultation Portal
            </h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              Access your secure, trilingual counseling sanctuary dashboard using your registered account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="doctor-login-form">
            {justVerified && !error && (
              <div className="bg-mint/10 border border-mint/30 text-forest p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Phone verified successfully! You can now sign in.</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="doctor@hitha.lk or +94 77 123 4567"
                    id="doctor-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Portal Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="••••••••"
                    id="doctor-password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-ink-soft cursor-pointer">
                <input type="checkbox" className="rounded text-forest focus:ring-forest border-hairline" defaultChecked />
                <span>Remember this workstation</span>
              </label>
              <span className="text-forest hover:underline cursor-pointer font-medium">Reset credential</span>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="doctor-signin-submit"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying on Secure Server...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>

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
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function DoctorLogin() {
  return (
    <Suspense fallback={null}>
      <DoctorLoginContent />
    </Suspense>
  );
}

