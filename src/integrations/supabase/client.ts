import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://supabasekong-c8s04o8s4g0g8gwkcs8o880c.65.21.57.54.sslip.io:8000';
const SUPABASE_ANON_KEY = 'eyJ00eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjQyNDMwMCwiZXhwIjo0OTIyMDk3OTAwLCJyb2xlIjoiYW5vbiJ9.52dvbekqvWxVboqfjqAZv0Myq4BP0yOzPUrv50j-mOs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
