import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { supabase } from "@/integrations/supabase/client";
import splashAsset from "@/assets/splash.jpeg";

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
    let cancelled = false;
    const t = setTimeout(() => {
      // Signed-in users skip onboarding/login and land straight on Home.
      if (!supabase) {
        if (!cancelled) navigate({ to: "/onboarding" });
        return;
      }
      void supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        navigate({ to: data.session ? "/home" : "/onboarding" });
      });
    }, 2200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex-1 bg-white overflow-hidden">
        <img
          src={splashAsset}
          alt="ASCEND — Be Better. Every Day."
          className="w-full h-full object-cover object-center select-none"
          draggable={false}
        />
      </div>
    </PhoneFrame>
  );
}
