import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clean the Supabase URL to ensure it's just the base protocol + host
const getCleanUrl = (url: string | undefined) => {
  if (!url) return '';
  let u = url.trim();
  try {
    const urlObj = new URL(u);
    // Remove /rest/v1 if the user pasted the API endpoint instead of the project URL
    if (urlObj.pathname.includes('/rest/v1')) {
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    // Just return protocol + host, specifically avoiding any trailing slash
    return `${urlObj.protocol}//${urlObj.host}`.replace(/\/$/, '');
  } catch (e) {
    // Fallback if URL parsing fails: string manipulation
    return u.split('/rest/v1')[0].replace(/\/$/, '');
  }
};

const supabaseUrl = getCleanUrl(rawUrl);
const supabaseAnonKey = rawKey?.trim() || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
