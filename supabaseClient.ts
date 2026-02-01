import { createClient } from '@supabase/supabase-js';

// Using provided credentials directly to ensure connectivity
const supabaseUrl = 'https://mxwousrkbdttlgsfqjsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14d291c3JrYmR0dGxnc2ZxanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODcyMzcsImV4cCI6MjA4NTU2MzIzN30.ZB9wR6DCdV1WZlE7J8l6OuoPBJp0n5Zj1iN_VxX5xuM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);