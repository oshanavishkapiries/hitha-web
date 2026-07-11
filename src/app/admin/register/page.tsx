"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { navigateTo } from "../../../utils/navigation";
import { Lock, Phone, User, ShieldAlert, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAdminRegister } from "../../../lib/service/query/useAuth";
import { getApiErrorMessage } from "../../../utils/errors";

function AdminRegisterContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useAdminRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteToken) {
      setError("This invitation link is missing or invalid. Please use the link from your invitation email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        inviteToken,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

      if (response.success) {
        navigateTo(`/admin/verify-phone?identifier=${encodeURIComponent(phoneNumber)}`);
      } else {
        setError(response.message || "Registration failed. Please review your details and try again.");
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Registration request failed. Please check your invitation link and try again."));
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">
          <div className="text-center">
            <button
              onClick={() => navigateTo("/admin/login")}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors cursor-pointer"
              id="admin-register-back-login"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest">
              Accept Your Admin Invitation
            </h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              Complete your profile to join the Hitha admin team.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} id="admin-register-form">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {!inviteToken && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>No invitation token was found in this link. Please open the link from your invitation email.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="Nimali"
                    id="admin-register-firstname"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="Perera"
                  id="admin-register-lastname"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="+94 77 123 4567"
                  id="admin-register-phone"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">We'll send an SMS verification code to this number.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="••••••••"
                    id="admin-register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft/40 hover:text-forest transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="••••••••"
                    id="admin-register-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft/40 hover:text-forest transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || !inviteToken}
              className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="admin-register-submit"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Admin Account</span>
              )}
            </button>

            <p className="text-center text-xs text-ink-soft">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigateTo("/admin/login")}
                className="text-forest font-semibold hover:underline cursor-pointer"
                id="admin-register-login-link"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminRegisterPage() {
  return (
    <Suspense fallback={null}>
      <AdminRegisterContent />
    </Suspense>
  );
}
