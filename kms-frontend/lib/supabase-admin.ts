// lib/supabase-admin.ts
// This module provides a function to create a Supabase client with admin privileges using the service role key.
import { createClient } from '@supabase/supabase-js';

export function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
