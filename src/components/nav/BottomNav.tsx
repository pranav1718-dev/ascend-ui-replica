import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home as HomeIcon, CheckCircle2, Dumbbell, BookOpen, User } from "lucide-react";

const tabs = [
  { key: "home", label: "Home", icon: HomeIcon, to: "/home" },
  { key: "habits", label: "Habits", icon: CheckCircle2, to: "/habits" },
  { key: "workout", label: "Workout", icon: Dumbbell, to: "/workout" },
  { key: "study", label: "Study", icon: BookOpen, to: "/study" },
  { key: "profile", label: "Profile", icon: User, to: "/profile" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="pointer-events-auto w-full max-w-[400px]">
        <div className="relative flex items-center justify-between rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.05] shadow-[0_10px_30px_rgba(15,23,42,0.10)] px-2 py-2">
          {tabs.map((t) => {
            const isActive = pathname === t.to;
            return (
              <Link
                key={t.key}
                to={t.to}
                className="relative flex-1 grid place-items-center py-1.5"
                aria-label={t.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill-shared"
                    className="absolute inset-1 rounded-full bg-gradient-to-b from-[#E3F0FF] to-[#DCE9FF]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <div className="relative flex flex-col items-center gap-0.5">
                  <t.icon
                    className={`h-[18px] w-[18px] transition-colors ${
                      isActive ? "text-[#0D47A1]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-[10.5px] font-semibold transition-colors ${
                      isActive ? "text-[#0D47A1]" : "text-slate-400"
                    }`}
                  >
                    {t.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
