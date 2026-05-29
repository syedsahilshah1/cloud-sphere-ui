import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tskqovnnyphomrcwakuj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn(
    'Warning: VITE_SUPABASE_ANON_KEY is missing in your .env file. Database actions might fail until it is added.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
