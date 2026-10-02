import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { AuthInput } from "@/components/auth/AuthInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { Checkbox } from "@/components/auth/Checkbox";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — ASCEND" },
      {
        name: "description",
        content: "Start your journey with ASCEND. Create your account.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { user, error: err } = await authService.signUp(email, password, fullName);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (user) {
      setNotice("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <PhoneFrame>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col px-6 pt-8 pb-8 mx-auto w-full max-w-[420px]"
      >
        <div>
          <h1 className="text-[26px] font-bold text-primary font-display">Create Account</h1>
          <p className="mt-3 text-[13px] text-muted-foreground">Start your journey with ASCEND</p>
        </div>

        <div className="space-y-6 mt-8">
          <AuthInput
            label="Full Name"
            placeholder="Pranav Gharge"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <AuthInput
            label="Email"
            type="email"
            placeholder="pranav@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <Checkbox checked={agree} onChange={setAgree} id="terms">
            I agree to the{" "}
            <span className="text-[var(--brand-blue)] font-medium">Terms &amp; Privacy Policy</span>
          </Checkbox>
        </div>

        {error && <p className="mt-4 text-[12.5px] text-rose-500">{error}</p>}
        {notice && <p className="mt-4 text-[12.5px] text-emerald-600">{notice}</p>}

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={!agree || loading}>
            {loading ? "Creating…" : "Create Account"}
          </PrimaryButton>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--brand-blue)] font-medium">
            Login
          </Link>
        </p>
      </form>
    </PhoneFrame>
  );
}
