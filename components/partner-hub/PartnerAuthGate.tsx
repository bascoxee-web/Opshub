'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  supabaseEmailSignIn,
  supabaseEmailSignUp,
  supabaseGoogleSignIn,
  supabaseResendVerification,
  supabaseSendPasswordReset,
  supabaseSignOut,
} from '@/lib/supabase';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle,
  KeyRound,
  Database,
} from 'lucide-react';

interface PartnerAuthGateProps {
  unverifiedUser?: User | null;
  unauthorizedEmail?: string | null;
  onRefreshAuth: () => Promise<void>;
}

export const PartnerAuthGate: React.FC<PartnerAuthGateProps> = ({
  unverifiedUser,
  unauthorizedEmail,
  onRefreshAuth,
}) => {
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Screen 0: Supabase environment variables not configured yet
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                CreatorDesk Pro · Supabase Connection Setup
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Connect your Supabase project to activate login
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                CreatorDesk Pro is wired for Supabase Auth, Postgres Row Level Security, and Realtime sync. Complete these 3 steps once to go live on your Cloudflare domain:
              </p>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-sm">
              <div className="p-4 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  1. Add environment variables
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Set <code className="font-mono text-teal-700 dark:text-teal-400">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code className="font-mono text-teal-700 dark:text-teal-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your hosting Environment Variables (or AI Studio Secrets) from Supabase Dashboard → Project Settings → API.
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  2. Run the database schema script
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Open Supabase Dashboard → SQL Editor and run <code className="font-mono text-slate-900 dark:text-slate-200">supabase/schema.sql</code> to create your tables, Row Level Security policies, and Realtime channels.
                </p>
              </div>
              <div className="p-4 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  3. Add your Cloudflare domain to Auth Redirect URLs
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In Supabase Dashboard → Authentication → URL Configuration, set Site URL to your domain (e.g. <span className="font-mono">https://hub.yourdomain.com</span>) and add <span className="font-mono">https://hub.yourdomain.com/**</span> to Redirect URLs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Waiting for Supabase environment variables</span>
              </span>
              <a
                href="/gatedesk"
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
              >
                Open GateDesk →
              </a>
            </div>
          </div>
        </div>

        <footer className="py-4 px-6 text-center text-xs text-slate-400">
          CreatorDesk Pro · Social Commerce, Editing &amp; Team Access Platform
        </footer>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      await supabaseGoogleSignIn();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to start Google sign-in right now.'
      );
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (authTab === 'reset') {
        await supabaseSendPasswordReset(email);
        setInfoMsg('Password reset link sent. Check your inbox and spam folder.');
        setAuthTab('signin');
      } else if (authTab === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await supabaseEmailSignUp(email, password, displayName);
        if (res.needsEmailConfirmation) {
          setInfoMsg('Account created. Check your inbox to confirm your email, then sign in.');
          setAuthTab('signin');
        }
      } else {
        await supabaseEmailSignIn(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Incorrect email or password. Double-check your credentials or create an account.');
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Please confirm your email address using the link sent to your inbox before signing in.');
      } else if (msg.toLowerCase().includes('user already registered')) {
        setErrorMsg('An account already exists with this email. Switch to Sign In.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Screen A: Signed in, awaiting email verification
  if (unverifiedUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              CreatorDesk Pro · Security Verification
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Verify your email to enter
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {unverifiedUser.email}
              </span>
              . Click the link in your inbox, then press refresh below.
            </p>
          </div>

          {infoMsg && (
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setErrorMsg('');
                try {
                  await onRefreshAuth();
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>I have verified my email</span>
            </button>

            {unverifiedUser.email && (
              <button
                type="button"
                onClick={async () => {
                  setErrorMsg('');
                  try {
                    await supabaseResendVerification(unverifiedUser.email || '');
                    setInfoMsg('Confirmation email resent. Please check your inbox.');
                  } catch {
                    setErrorMsg('Please wait a moment before requesting another email.');
                  }
                }}
                className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors"
              >
                Resend confirmation email
              </button>
            )}

            <button
              type="button"
              onClick={() => void supabaseSignOut()}
              className="w-full py-2 px-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out and use another account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen B: Signed in & verified, but email is not yet on the authorized team seat list
  if (unauthorizedEmail) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              CreatorDesk Pro · Invite Required
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Access pending workspace approval
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are signed in as{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {unauthorizedEmail}
              </span>
              , which is not yet on this team workspace&apos;s authorized seat list.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask your Workspace Admin to open <strong>Team &amp; Access</strong> in CreatorDesk Pro and add{' '}
              <span className="font-mono">{unauthorizedEmail}</span>, or sign in with your shared team subscription email.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => void onRefreshAuth()}
              className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
            >
              Check Access Again
            </button>
            <button
              type="button"
              onClick={() => void supabaseSignOut()}
              className="py-2.5 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen C: Main CreatorDesk Pro Login Portal
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {/* Left Executive Brief */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-teal-400">
                  Team Subscription Workspace · Pro Plan
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-2 text-balance">
                  CreatorDesk Pro
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Centralized team hub for managing US seller verification, delegated account access, creative editing, and daily posting.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-white">01. Owner Verification Lane</p>
                  <p className="text-slate-400 leading-relaxed">
                    Direct portals and checklists for TikTok Shop US Seller Center, TikTok Affiliate, YouTube Shopping, Meta Commerce, Amazon Associates, and US payouts.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white">02. Editing &amp; Posting Studio Stack</p>
                  <p className="text-slate-400 leading-relaxed">
                    Canva, CapCut, Linktree, and Google Drive stay cleanly organized for your operations and editing seats without cluttering the owner&apos;s queue.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white">03. Delegated Access · Zero Password Sharing</p>
                  <p className="text-slate-400 leading-relaxed">
                    The Account Owner verifies directly on official platforms and grants Sub-Account or Manager access safely to the team.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Private encrypted sync · Authorized team seats only</span>
            </div>
          </div>

          {/* Right Auth Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {authTab === 'signin' && 'Sign in to CreatorDesk Pro'}
                {authTab === 'signup' && 'Create team member login'}
                {authTab === 'reset' && 'Reset your password'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign in with your shared team subscription email &amp; password or your authorized seat login.
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  authTab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  authTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {authTab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Display Name or Seat Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Account Owner, Ops Manager, or Editor"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {authTab !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {authTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('reset');
                          setErrorMsg('');
                        }}
                        className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      autoComplete={authTab === 'signin' ? 'current-password' : 'new-password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <span>
                  {authTab === 'signin' && 'Sign In with Email'}
                  {authTab === 'signup' && 'Create Workspace Account'}
                  {authTab === 'reset' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {authTab === 'reset' && (
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  Back to Sign In
                </button>
              )}
            </form>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-xs text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-sm rounded-lg flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4 text-teal-400 dark:text-teal-600" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="py-4 px-6 text-center text-xs text-slate-400">
        CreatorDesk Pro · Social Commerce, Editing &amp; Team Access Platform
      </footer>
    </div>
  );
};
