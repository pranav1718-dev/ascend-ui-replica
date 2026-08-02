import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import splashAsset from "@/assets/splash.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASCEND — Be Better. Every Day." },
      {
        name: "description",
        content: "Track habits, workouts, studies and achieve your goals with ASCEND.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex-1 bg-white overflow-hidden">
        <img
          src={splashAsset.url}
          alt="ASCEND — Be Better. Every Day."
          className="w-full h-full object-cover object-center select-none"
          draggable={false}
        />
      </div>
    </PhoneFrame>
  );
}
