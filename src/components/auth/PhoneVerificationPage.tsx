"use client";

import React, { useState, useEffect, useRef } from "react";
import AppShell from "../AppShell";
import { navigateTo } from "../../utils/navigation";
import { ShieldCheck, ShieldAlert, ArrowLeft, Smartphone } from "lucide-react";
import { getApiErrorMessage } from "../../utils/errors";

const RESEND_COOLDOWN_SECONDS = 60;

interface SendCodeMutationLike {
  mutate: (
    payload: { identifier: string; purpose: "REGISTER" },
    options: { onSuccess: () => void; onError: (err: any) => void }
  ) => void;
  isPending: boolean;
}

interface VerifyCodeMutationLike {
  mutateAsync: (payload: { identifier: string; verificationCode: string }) => Promise<any>;
  isPending: boolean;
}

interface PhoneVerificationPageProps {
  identifier: string;
  sendCodeMutation: SendCodeMutationLike;
  verifyCodeMutation: VerifyCodeMutationLike;
  idPrefix: string;
  backHref: string;
  backLabel: string;
  verifiedMessage: string;
  redirectHref: string;
}

export default function PhoneVerificationPage({
  identifier,
  sendCodeMutation,
  verifyCodeMutation,
  idPrefix,
  backHref,
  backLabel,
  verifiedMessage,
  redirectHref,
}: PhoneVerificationPageProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const hasSentInitialCode = useRef(false);

  useEffect(() => {
    if (!identifier || hasSentInitialCode.current) return;
    hasSentInitialCode.current = true;
    sendCodeMutation.mutate(
      { identifier, purpose: "REGISTER" },
      {
        onSuccess: () => {
          setNotice(`A verification code has been sent to ${identifier}.`);
          setCooldown(RESEND_COOLDOWN_SECONDS);
        },
        onError: (err: any) => {
          setError(getApiErrorMessage(err, "Failed to send verification code."));
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || !identifier) return;
    setError("");
    setNotice("");
    sendCodeMutation.mutate(
      { identifier, purpose: "REGISTER" },
      {
        onSuccess: () => {
          setNotice(`A new verification code has been sent to ${identifier}.`);
          setCooldown(RESEND_COOLDOWN_SECONDS);
        },
        onError: (err: any) => {
          setError(getApiErrorMessage(err, "Failed to resend verification code."));
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    try {
      await verifyCodeMutation.mutateAsync({ identifier, verificationCode: code });
      setVerified(true);
      setTimeout(() => {
        navigateTo(redirectHref);
      }, 1500);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Invalid or expired verification code. Please try again."));
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">
          <div className="text-center">
            <button
              onClick={() => navigateTo(backHref)}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors cursor-pointer"
              id={`${idPrefix}-back`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLabel}</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest">
              Verify Your Phone Number
            </h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              {identifier ? (
                <>
                  Enter the 6-digit code sent to <span className="font-semibold text-ink">{identifier}</span>.
                </>
              ) : (
                "No phone number was provided. Please register again."
              )}
            </p>
          </div>

          {verified ? (
            <div className="bg-mint/10 border border-mint/30 text-forest p-4 rounded-xl text-sm flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>{verifiedMessage}</span>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} id={`${idPrefix}-form`}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
              {notice && !error && (
                <div className="bg-mint/10 border border-mint/30 text-forest p-3 rounded-xl text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{notice}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  disabled={!identifier}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none transition-all disabled:opacity-50"
                  placeholder="------"
                  id={`${idPrefix}-code`}
                />
              </div>

              <button
                type="submit"
                disabled={verifyCodeMutation.isPending || !identifier || code.length < 6}
                className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                id={`${idPrefix}-submit`}
              >
                {verifyCodeMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Phone Number</span>
                )}
              </button>

              <p className="text-center text-xs text-ink-soft">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || sendCodeMutation.isPending || !identifier}
                  className="text-forest font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                  id={`${idPrefix}-resend`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
