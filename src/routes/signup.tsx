import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { AuthInput } from "@/components/auth/AuthInput";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { Checkbox } from "@/components/auth/Checkbox";

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
  const [agree, setAgree] = useState(true);

  return (
    <PhoneFrame>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex-1 flex flex-col px-6 pt-8 pb-8 mx-auto w-full max-w-[420px]"
      >
        <div>
          <h1 className="text-[26px] font-bold text-primary font-display">
            Create Account
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Start your journey with ASCEND
          </p>
        </div>

        <div className="space-y-6 mt-8">
          <AuthInput
            label="Full Name"
            placeholder="Pranav Gharge"
            defaultValue="Pranav Gharge"
          />
          <AuthInput
            label="Email"
            type="email"
            placeholder="pranav@example.com"
            defaultValue="pranav@example.com"
          />
          <AuthInput
            label="Password"
            type="password"
            defaultValue="password123"
          />
          <AuthInput
            label="Confirm Password"
            type="password"
            defaultValue="password123"
          />
        </div>

        <div className="mt-8">
          <Checkbox checked={agree} onChange={setAgree} id="terms">
            I agree to the{" "}
            <span className="text-[var(--brand-blue)] font-medium">
              Terms &amp; Privacy Policy
            </span>
          </Checkbox>
        </div>

        <div className="mt-8">
          <PrimaryButton type="submit" disabled={!agree}>
            Create Account
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
