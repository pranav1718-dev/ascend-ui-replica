import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

/**
 * Authentication service. When Supabase is not yet configured, methods
 * return stub responses so the UI keeps working during manual setup.
 */

export interface AuthUser {
  id: string;
  email: string | null;
  full_name?: string | null;
}

export const authService = {
  isConfigured: () => isSupabaseConfigured,

  async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) return { user: null, error: null as Error | null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { user: data.user, error };
  },

  async signIn(email: string, password: string) {
    if (!supabase) return { user: null, error: null as Error | null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  async signOut() {
    if (!supabase) return { error: null };
    return supabase.auth.signOut();
  },

  async getUser(): Promise<AuthUser | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? null,
      full_name: (data.user.user_metadata?.full_name as string | undefined) ?? null,
    };
  },

  async resetPassword(email: string) {
    if (!supabase) return { error: null };
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    });
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      callback(
        u
          ? {
              id: u.id,
              email: u.email ?? null,
              full_name: (u.user_metadata?.full_name as string | undefined) ?? null,
            }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  },
};
