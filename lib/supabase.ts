import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_KEY &&
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_SUPABASE')
);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are not configured yet.'
    );
  }
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

export async function supabaseEmailSignIn(email: string, password: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function supabaseEmailSignUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; needsEmailConfirmation: boolean }> {
  const supabase = getSupabaseClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: displayName?.trim() ? { display_name: displayName.trim().slice(0, 60) } : undefined,
    },
  });
  if (error) throw error;
  return {
    user: data.user,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function supabaseGoogleSignIn(): Promise<void> {
  const supabase = getSupabaseClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
}

export async function supabaseSendPasswordReset(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw error;
}

export async function supabaseResendVerification(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  if (error) throw error;
}

export async function supabaseSignOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
