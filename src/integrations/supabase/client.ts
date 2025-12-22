import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://etecqwvgorolsyzafsge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0ZWNxd3Znb3JvbHN5emFmc2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzEyMDQsImV4cCI6MjA4MjAwNzIwNH0.9yb6pvzu3IZlS1lDciJyzFvuojHLMKs3SRTDZR8wBb4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
