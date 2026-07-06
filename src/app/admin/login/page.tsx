"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, Mail, ShieldAlert, ArrowLeft, Terminal, Play } from 'lucide-react';
import { useAdminLogin } from '../../../lib/service/query/useAuth';
import { getApiErrorMessage } from '../../../utils/errors';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <div className="max-w-md w-full space-y-8 bg-[#0B1E17] p-8 rounded-2xl border border-[#1A3429] text-white">

          <div className="text-center">
            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-sprout/60 hover:text-white mb-6 transition-colors"
              id="admin-back-home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
            <h2 className="text-2xl font-display font-bold text-mint">
              Hitha System Admin Portal
            </h2>
            <p className="mt-2 text-xs text-sprout/70 max-w-sm mx-auto">
              Secure core terminal to verify SLMC doctor credentials, oversee secure escrow funds, and handle portal system metrics.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} id="admin-login-form">
            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-sprout/60 mb-1.5">
                  Administrative Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sprout/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#142B22] border border-[#2B4E41] focus:border-mint/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-sprout/30"
                    placeholder="admin@hitha.lk"
                    id="admin-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-sprout/60 mb-1.5">
                  Root Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sprout/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#142B22] border border-[#2B4E41] focus:border-mint/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-sprout/30"
                    placeholder="••••••••"
                    id="admin-password"
                  />
                </div>
              </div>
            </div>



            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#8FCB84] hover:bg-[#9ED993] text-[#0B1E17] font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="admin-signin-submit"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B1E17]/30 border-t-[#0B1E17] rounded-full animate-spin" />
                  <span>Loading Admin Console...</span>
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

