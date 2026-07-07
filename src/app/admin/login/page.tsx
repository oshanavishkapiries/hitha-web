"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, Mail, ShieldAlert, ShieldCheck, ArrowLeft, Terminal, Play, Eye, EyeOff } from 'lucide-react';
import { useAdminLogin } from '../../../lib/service/query/useAuth';
import { getApiErrorMessage } from '../../../utils/errors';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const loginMutation = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Attempt authenticating using the real backend API service
      const response = await loginMutation.mutateAsync({
        identifier: email,
        password: password
      });

      if (response.success) {
        navigateTo('/admin/dashboard');
      } else {
        setError(response.message || 'Unauthorized administrative access.');
      }
    } catch (err: any) {
      console.error("Real admin login failed:", err);
      setError(
        getApiErrorMessage(err, 'Real backend API connection failed or is currently unreachable. Please verify your internet connection or server status.')
      );
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">

          <div className="text-center">
            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors cursor-pointer"
              id="admin-back-home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest">
              Hitha System Admin Portal
            </h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              Secure core terminal to verify SLMC doctor credentials, oversee secure escrow funds, and handle portal system metrics.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="admin-login-form">
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
                  Administrative Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                    placeholder="admin@hitha.lk"
                    id="admin-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  Root Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-faint/60"
                    placeholder="••••••••"
                    id="admin-password"
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
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="admin-signin-submit"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Admin Access...</span>
                </>
              ) : (
                <span>Access Admin Panel</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

