import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { AuthInput } from "@/components/auth/AuthInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { authService } from "@/services/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  // The recovery token arrives in the URL hash, which only the browser sees.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — ASCEND" },
      { name: "description", content: "Choose a new password for your ASCEND account." },
      { property: "og:title", content: "Reset Password — ASCEND" },
      {
        property: "og:description",
        content: "Choose a new password for your ASCEND account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Supabase parses the recovery token from the URL and emits PASSWORD_RECOVERY.
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: s }) => {
      if (!active) return;
      if (s.session) setReady(true);
      else if (!window.location.hash.includes("access_token")) {
        setError("This reset link is invalid or has expired. Request a new one.");
        setReady(true);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: err } = await authService.updatePassword(password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNotice("Password updated. Redirecting…");
    await authService.signOut();
    setTimeout(() => navigate({ to: "/login", replace: true }), 900);
  }

  return (
    <PhoneFrame>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pt-8 pb-8 mx-auto w-full max-w-[420px]"
      >
        <div>
          <h1 className="text-[26px] font-bold text-primary font-display">Set New Password</h1>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Choose a strong password you haven't used before
          </p>
        </div>

        <div className="space-y-6 mt-8">
          <AuthInput
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="mt-4 text-[12.5px] text-rose-500">{error}</p>}
        {notice && <p className="mt-4 text-[12.5px] text-emerald-600">{notice}</p>}

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={loading || !ready}>
            {loading ? "Updating…" : "Update Password"}
          </PrimaryButton>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          <Link to="/login" className="text-[var(--brand-blue)] font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </PhoneFrame>
  );
}
