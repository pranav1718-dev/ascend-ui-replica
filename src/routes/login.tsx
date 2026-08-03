import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { AuthInput } from "@/components/auth/AuthInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { Checkbox } from "@/components/auth/Checkbox";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ASCEND" },
      { name: "description", content: "Login to continue your ASCEND journey." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email confirmation links land back here with ?confirmed=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("confirmed")) {
      setNotice("Email confirmed — you can log in now.");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    const { error: err } = await authService.signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate({ to: "/home" });
  }

  async function handleGoogle() {
    setError(null);
    const { error: err } = await authService.signInWithGoogle();
    if (err) setError(err.message);
  }


  return (
    <PhoneFrame>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pt-8 pb-8 mx-auto w-full max-w-[420px]"
      >
        <div>
          <h1 className="text-[26px] font-bold text-primary font-display">Welcome Back!</h1>
          <p className="mt-3 text-[13px] text-muted-foreground">Login to continue your journey</p>
        </div>

        <button
          type="button"
          className="mt-8 w-full h-12 rounded-xl border border-border bg-background flex items-center justify-center gap-3 text-[14px] font-medium text-foreground hover:bg-accent transition"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-8">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[12px] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-6">
          <AuthInput
            label="Email"
            type="email"
            placeholder="pranav@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-muted-foreground">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-background px-4 pr-20 text-[15px] text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition"
              />
              <button
                type="button"
                onClick={handleForgot}
                className="absolute inset-y-0 right-3 flex items-center text-[13px] font-medium text-[var(--brand-blue)]"
              >
                Forgot?
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-[12.5px] text-rose-500">{error}</p>}

        <div className="mt-8">
          <Checkbox checked={remember} onChange={setRemember} id="remember">
            Remember me
          </Checkbox>
        </div>

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </PrimaryButton>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[var(--brand-blue)] font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </PhoneFrame>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
