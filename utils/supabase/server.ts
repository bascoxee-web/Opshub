import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (!isValidHttpUrl(supabaseUrl) || !supabaseKey) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_URL (must start with https://) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored when middleware refreshes user sessions.
        }
      },
    },
  });
};
