import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser-side Supabase client.
 *
 * Configure by setting VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
 * in `.env.local` (see `.env.example`). Until they are set, the client is
 * `null` and the service layer falls back to localStorage so the app keeps
 * working during manual integration.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
