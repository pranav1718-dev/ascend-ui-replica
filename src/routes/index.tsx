import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { Logo } from "@/components/auth/Logo";
import mountains from "@/assets/splash-mountains.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASCEND — Be Better. Every Day." },
      {
        name: "description",
        content:
          "Track habits, workouts, studies and achieve your goals with ASCEND.",
      },
      { property: "og:title", content: "ASCEND — Be Better. Every Day." },
      {
        property: "og:description",
        content:
          "Track habits, workouts, studies and achieve your goals with ASCEND.",
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
      <div className="relative flex-1 flex flex-col items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-primary -mt-24"
        >
          <Logo size={80} />
          <h1 className="mt-5 text-[32px] font-bold tracking-[0.18em] text-primary font-display">
            ASCEND
          </h1>
          <p className="mt-1 text-[12px] tracking-[0.12em] text-muted-foreground">
            Be Better. Every Day.
          </p>
        </motion.div>

        <img
          src={mountains}
          alt=""
          aria-hidden="true"
          width={768}
          height={768}
          className="absolute bottom-0 left-0 w-full object-contain pointer-events-none select-none"
        />
      </div>
    </PhoneFrame>
  );
}
