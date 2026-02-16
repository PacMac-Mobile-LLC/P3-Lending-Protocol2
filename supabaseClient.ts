import { createClient } from '@supabase/supabase-js';
import { frontendEnv } from './services/env';

const supabaseUrl = frontendEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = frontendEnv.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
