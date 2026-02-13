'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { ViewHeader, ViewFooter } from '@/components/landing';
import { authClient } from '@/lib/auth/auth-client';
import { useSession } from '@/lib/auth/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/common';
import { toast } from 'sonner';
import { FormField, FormInput } from '@/components/ui/form';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => {
    const r = searchParams.get('redirect');
    return r && r.startsWith('/') && !r.startsWith('//') ? r : '/';
  }, [searchParams]);
  const queryClient = useQueryClient();
  const { data: user, isFetched } = useSession();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already logged in
  if (isFetched && user) {
    router.replace(redirectTo);
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authClient.sendOtp(trimmed);
      toast.success('Verification code sent to your email');
      setEmail(trimmed);
      setStep('otp');
      setOtp('');
      setResendCooldown(RESEND_COOLDOWN_SEC);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await authClient.sendOtp(email);
      toast.success('Code resent');
      setResendCooldown(RESEND_COOLDOWN_SEC);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const verifyWithCode = async (code: string) => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    try {
      const { isNewUser } = await authClient.verifyOtp(email, code);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      if (isNewUser) {
        router.replace('/onboarding');
      } else {
        router.replace(redirectTo);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyWithCode(otp.replace(/\D/g, ''));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(raw);
    if (raw.length === OTP_LENGTH) {
      verifyWithCode(raw);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ViewHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-jad-primary/10 bg-white p-8 shadow-2xl shadow-foreground/5 sm:p-10">
            {/* Step indicator */}
            <div className="mb-8 flex gap-2">
              <div
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  step === 'email' ? 'bg-jad-primary' : 'bg-jad-primary/30'
                )}
              />
              <div
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-300',
                  step === 'otp' ? 'bg-jad-primary' : 'bg-foreground/10'
                )}
              />
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-jad-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-jad-foreground sm:text-3xl">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              {step === 'email'
                ? 'Enter your email to receive a one-time code'
                : `We sent a 6-digit code to ${email}`}
            </p>

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
                <FormField label="Email" htmlFor="email" required>
                  <FormInput
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    icon={<Mail className="h-5 w-5" />}
                    inputSize="lg"
                    className="bg-jad-mint/30"
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 rounded-xl bg-jad-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark hover:shadow-xl disabled:opacity-60',
                    loading && 'cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send verification code'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                <FormField label="Verification code" htmlFor="otp" required>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={loading}
                      maxLength={OTP_LENGTH}
                      className="w-full rounded-xl border border-foreground/15 bg-jad-mint/30 py-3.5 pl-12 pr-4 text-center text-2xl font-mono tracking-[0.5em] text-jad-foreground placeholder:text-foreground/40 focus:border-jad-primary focus:outline-none focus:ring-2 focus:ring-jad-primary/20 transition-colors disabled:opacity-60"
                    />
                  </div>
                </FormField>
                <button
                  type="submit"
                  disabled={loading || otp.replace(/\D/g, '').length !== OTP_LENGTH}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 rounded-xl bg-jad-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-jad-primary/25 transition-all hover:bg-jad-dark hover:shadow-xl disabled:opacity-60',
                    (loading || otp.replace(/\D/g, '').length !== OTP_LENGTH) &&
                      'cursor-not-allowed'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & sign in'
                  )}
                </button>

                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="text-sm font-medium text-jad-primary hover:text-jad-dark hover:underline disabled:opacity-60"
                  >
                    Use different email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                    className="text-sm font-medium text-jad-primary hover:text-jad-dark hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-foreground/60">
            No password needed — we&apos;ll send a secure code to your inbox.
          </p>
        </div>
      </main>
      <ViewFooter />
    </div>
  );
}
