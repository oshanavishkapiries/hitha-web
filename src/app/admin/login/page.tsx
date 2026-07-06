"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, Mail, ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@hitha.lk');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate administrative authentication
    setTimeout(() => {
      if (email.trim() === 'admin@hitha.lk' && password === 'admin123') {
        setIsLoading(false);
        navigateTo('/admin/dashboard');
      } else {
        setIsLoading(false);
        setError('Unauthorized administrative access. IP address and attempt logged.');
      }
    }, 1000);
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-md w-full space-y-8 bg-[#0B1E17] p-8 rounded-3xl border border-[#2B4E41] shadow-2xl relative overflow-hidden text-white">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-mint via-forest to-sprout" />
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-mint rounded-full filter blur-[80px] opacity-10 pointer-events-none" />

          <div className="text-center">
            <button
              onClick={() => navigateTo('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-sprout/60 hover:text-white mb-6 transition-colors"
              id="admin-back-home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-mint mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold text-mint">
              Hitha System Admin Portal
            </h2>
            <p className="mt-2 text-xs text-sprout/70 max-w-sm mx-auto">
              Secure core terminal to verify SLMC doctor credentials, oversee secure escrow funds, and handle portal system metrics.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} id="admin-login-form">
            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
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

            <div className="flex items-center justify-between text-xs text-sprout/70">
              <span className="text-[10px] text-mint flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                SSL & TLS Encrypted Core
              </span>
              <span className="hover:underline cursor-pointer">Security Policy</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8FCB84] hover:bg-[#9ED993] text-[#0B1E17] font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="admin-signin-submit"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B1E17]/30 border-t-[#0B1E17] rounded-full animate-spin" />
                  <span>Loading Admin Console...</span>
                </>
              ) : (
                <span>Access Admin Panel</span>
              )}
            </button>

            {/* Quick Demo Assist */}
            <div className="bg-[#142B22] border border-[#2B4E41] p-3 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-mint uppercase tracking-wider">Demo Quick Access</span>
                <span className="text-[10px] text-sprout bg-forest/40 border border-[#2B4E41] px-1.5 py-0.5 rounded-full font-mono">Mock credentials</span>
              </div>
              <p className="text-[11px] text-sprout/70 mb-2">
                Click below to instantly pre-fill administrative credentials for the system demonstration.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@hitha.lk');
                  setPassword('admin123');
                }}
                className="w-full bg-[#0B1E17] hover:bg-[#1A3429] border border-[#2B4E41] text-mint text-xs font-semibold py-1.5 rounded-lg transition-all"
                id="admin-demo-fill-btn"
              >
                Use Demo Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
