import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { AuthInput } from "@/components/auth/AuthInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — ASCEND" },
      {
        name: "description",
        content: "Reset your ASCEND password and get back to your daily progress.",
      },
      { property: "og:title", content: "Forgot Password — ASCEND" },
      {
        property: "og:description",
        content: "Reset your ASCEND password and get back to your daily progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error: err } = await authService.resetPassword(email);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNotice("If that email has an account, a reset link is on its way.");
  }

  return (
    <PhoneFrame>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pt-8 pb-8 mx-auto w-full max-w-[420px]"
      >
        <div>
          <h1 className="text-[26px] font-bold text-primary font-display">Forgot Password?</h1>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="mt-8">
          <AuthInput
            label="Email"
            type="email"
            placeholder="pranav@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {error && <p className="mt-4 text-[12.5px] text-rose-500">{error}</p>}
        {notice && <p className="mt-4 text-[12.5px] text-emerald-600">{notice}</p>}

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </PrimaryButton>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="text-[var(--brand-blue)] font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </PhoneFrame>
  );
}
