import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import student from "@/assets/onboarding-student.png";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started — ASCEND" },
      {
        name: "description",
        content:
          "Your journey to the best version of you. Track habits, workouts, studies with ASCEND.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col px-7 pt-6 pb-8">
        <div>
          <h1 className="text-[28px] leading-tight font-bold text-primary font-display">
            Your Journey to
          </h1>
          <h2 className="text-[28px] leading-tight font-bold text-[var(--brand-blue)] font-display">
            Best Version of You
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground max-w-[280px]">
            Track habits, workouts, studies and achieve your goals with ASCEND.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center my-6">
          <img
            src={student}
            alt="Student using laptop"
            width={768}
            height={768}
            className="w-[78%] max-w-[320px] object-contain"
          />
        </div>

        <div className="space-y-4">
          <Link to="/signup">
            <PrimaryButton>Get Started</PrimaryButton>
          </Link>
          <Link
            to="/login"
            className="block text-center text-[13px] text-muted-foreground"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
