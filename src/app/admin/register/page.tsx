"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, User, Phone, ShieldCheck, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAdminRegister } from '../../../lib/service/query/useAuth';
import { useAlert } from '../../../context/AlertContext';
import { getApiErrorMessage } from '../../../utils/errors';

function AdminRegisterContent() {
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  const token = searchParams.get('token');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const registerMutation = useAdminRegister();

  // Guard: token check
  useEffect(() => {
    if (!token) {
      setError('Missing administrative invitation token. You cannot register without a valid invitation link.');
      showAlert('Missing invitation token.', 'error');
    }
  }, [token, showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing administrative invitation token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Phone number basic validation (must start with + and have at least 8 digits)
    if (!phoneNumber.startsWith('+') || phoneNumber.length < 8) {
      setError('Phone number must start with a country code (e.g. +94771234567).');
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        inviteToken: token,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

      if (response.success) {
        showAlert('Registration successful. Redirecting to login...', 'success');
        setTimeout(() => {
          navigateTo('/admin/login');
        }, 1500);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      console.error("Admin registration failed:", err);
      setError(getApiErrorMessage(err, 'Failed to complete registration. Token may be invalid or expired.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">
        
        <div className="text-center">
          <button
            onClick={() => navigateTo('/admin/login')}
            className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors cursor-pointer"
            id="admin-back-login"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
          <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold text-forest">
            Register Admin Profile
          </h2>
          <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
            Complete your administrative registration to access the secure Hitha management system.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit} id="admin-register-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={!token}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={!token}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Mobile Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  disabled={!token}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                  placeholder="+94771234567"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!token}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sprout/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={!token}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending || !token}
            className="w-full mt-4 bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            id="admin-register-submit"
          >
            {registerMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Completing Profile Registration...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminRegister() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <AdminRegisterContent />
      </Suspense>
    </AppShell>
  );
}
