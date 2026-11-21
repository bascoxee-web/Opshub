'use client';

import React, { useState } from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { Lock, Mail, Building, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const AuthPages: React.FC<{ initialMode?: 'login' | 'signup' | 'forgot-password' }> = ({
  initialMode = 'login',
}) => {
  const { currentView, navigateTo, login, signup, resetPassword, addToast } = useGateDesk();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(
    currentView === 'signup'
      ? 'signup'
      : currentView === 'forgot-password'
      ? 'forgot-password'
      : initialMode
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await signup(email, password, facilityName);
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        setResetSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-extrabold text-xl flex items-center justify-center mx-auto shadow-md mb-3">
            GD
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' && 'Sign in to GateDesk'}
            {mode === 'signup' && 'Create your business account'}
            {mode === 'forgot-password' && 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && 'Enter your account credentials to access your dashboard.'}
            {mode === 'signup' && 'Set up your workspace and connect your operations in minutes.'}
            {mode === 'forgot-password' && 'We will send a secure password reset link to your email.'}
          </p>
        </div>

        {resetSuccess && mode === 'forgot-password' ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Check your inbox
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We&apos;ve sent instructions to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>. Check your spam folder if it doesn&apos;t arrive in 2 minutes.
            </p>
            <button
              onClick={() => {
                setResetSuccess(false);
                setMode('login');
              }}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl text-xs transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Storage Facility Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g. Sunny Coast Storage"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourstorage.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-70 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Continue to Setup'}
                    {mode === 'forgot-password' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer switcher */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' && (
            <p>
              Don&apos;t have a GateDesk account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Sign up free
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already registered your storage facility?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot-password' && (
            <p>
              Remembered your credentials?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Back to Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
