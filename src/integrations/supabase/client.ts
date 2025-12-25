import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xnuwmcqfnxoxlmqvnhsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudXdtY3FmbnhveGxtcXZuaHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjgxOTEsImV4cCI6MjA4MjI0NDE5MX0.l0Fn_niB7aPPRGDoBnd8bYnMS8Nh9MCLq6o66AH5pMA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
