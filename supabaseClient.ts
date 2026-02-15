import { createClient } from '@supabase/supabase-js';

// Using provided credentials directly to ensure connectivity
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

declare const __BACKEND_URL__: string;
const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : 'http://localhost:3001';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);