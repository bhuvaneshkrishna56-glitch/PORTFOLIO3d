import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Main Supabase Client
 * Replaces Firebase for Auth, Database, and Storage
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
