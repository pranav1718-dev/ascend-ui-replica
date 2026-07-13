import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import onboardingAsset from "@/assets/onboarding.jpeg.asset.json";

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
  const navigate = useNavigate();
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-white overflow-hidden">
        <img
          src={onboardingAsset.url}
          alt="Your Journey to Best Version of You"
          className="w-full h-full object-cover object-top select-none"
          draggable={false}
        />
        {/* Tap targets over the CTA and Sign In link in the artwork */}
        <button
          type="button"
          aria-label="Get Started"
          onClick={() => navigate({ to: "/signup" })}
          className="absolute left-[6%] right-[6%] bottom-[10%] h-[9%] rounded-full"
        />
        <button
          type="button"
          aria-label="Sign In"
          onClick={() => navigate({ to: "/login" })}
          className="absolute left-[35%] right-[10%] bottom-[4%] h-[4%]"
        />
      </div>
    </PhoneFrame>
  );
}
