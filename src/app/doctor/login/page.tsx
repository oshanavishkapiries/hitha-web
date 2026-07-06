"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, Mail, ShieldAlert, ArrowLeft, Stethoscope } from 'lucide-react';

export default function DoctorLogin() {
  const [email, setEmail] = useState('doctor@hitha.lk');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication
    setTimeout(() => {
      if (email.trim() === 'doctor@hitha.lk' && password === 'doctor123') {
        setIsLoading(false);
        navigateTo('/doctor/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid SLMC-registered email or password combination.');
      }
    }, 1000);
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
              Access your secure, trilingual counseling sanctuary dashboard. Log in using your SLMC-verified account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="doctor-login-form">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  SLMC Registered Email
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
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="doctor@hitha.lk"
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
              disabled={isLoading}
              className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="doctor-signin-submit"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering Sanctuary...</span>
                </>
              ) : (
                <span>Sign In to Portal</span>
              )}
            </button>

            {/* Quick Demo Assist */}
            <div className="bg-[#FAF9F5] border border-hairline p-3 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Demo Quick Access</span>
                <span className="text-[10px] text-ink-soft bg-mint/20 px-1.5 py-0.5 rounded-full font-medium">SLMC verified mockup</span>
              </div>
              <p className="text-[11px] text-ink-soft mb-2">
                Click below to instantly pre-fill credentials for the Doctor Dashboard demonstration.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('doctor@hitha.lk');
                  setPassword('doctor123');
                }}
                className="w-full bg-white hover:bg-cream border border-hairline text-forest text-xs font-semibold py-1.5 rounded-lg transition-all"
                id="doctor-demo-fill-btn"
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
