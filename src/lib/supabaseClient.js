import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tskqovnnyphomrcwakuj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '') {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn(
      'Warning: VITE_SUPABASE_ANON_KEY is missing or empty. Database actions will operate in resilient local fallback mode.'
    );
  }
} catch (err) {
  console.error('Failed to initialize Supabase client client-side:', err);
}

// Resilient fallback client to prevent module initialization crashes (white screen) on Vercel deployments
export const supabase = supabaseInstance || {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    eq: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  }
};
