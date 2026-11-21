import { createBrowserClient } from '@supabase/ssr';

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

export const createClient = () => {
  if (!isValidHttpUrl(supabaseUrl) || !supabaseKey) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_URL (must start with https://) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
