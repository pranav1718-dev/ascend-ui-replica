import { useEffect, useState } from "react";
import { authService, type AuthUser } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getUser().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    const unsub = authService.onAuthStateChange((u) => setUser(u));
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
  };
}
