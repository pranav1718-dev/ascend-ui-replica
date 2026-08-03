import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

/**
 * Authentication service.
 *
 * All redirect URLs are derived from `window.location.origin`, so the same
 * code works in local development (http://localhost:8080), in the Lovable
 * preview and in production — no hardcoded hosts.
 */

export interface AuthUser {
  id: string;
  email: string | null;
  full_name?: string | null;
}

const origin = () => (typeof window !== "undefined" ? window.location.origin : "");

export const authService = {
  isConfigured: () => isSupabaseConfigured,

  async signUp(email: string, password: string, fullName?: string) {
    if (!supabase) return { user: null, error: new Error("Supabase is not configured.") };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Where the confirmation link lands after Supabase verifies the token.
        emailRedirectTo: `${origin()}/login?confirmed=1`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { user: data.user, error };
  },

  async signIn(email: string, password: string) {
    if (!supabase) return { user: null, error: new Error("Supabase is not configured.") };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  async signInWithGoogle() {
    if (!supabase) return { error: new Error("Supabase is not configured.") };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin()}/home`,
        queryParams: { prompt: "select_account" },
      },
    });
    return { error };
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

  async getUserId(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  },

  /** Sends the reset email; the link opens /reset-password. */
  async resetPassword(email: string) {
    if (!supabase) return { error: new Error("Supabase is not configured.") };
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin()}/reset-password`,
    });
  },

  /** Called from /reset-password once the recovery session is active. */
  async updatePassword(password: string) {
    if (!supabase) return { error: new Error("Supabase is not configured.") };
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
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
