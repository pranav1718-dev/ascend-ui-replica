import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Plus, Sunrise, Droplet, Sparkles, BookOpen, Ban, Moon, Check } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "Habits — ASCEND" },
      { name: "description", content: "Track your daily habits." },
    ],
  }),
  component: HabitsPage,
});

const days = [
  { d: "Mon", n: 10 },
  { d: "Tue", n: 11 },
  { d: "Wed", n: 12 },
  { d: "Thu", n: 13, active: true },
  { d: "Fri", n: 14 },
  { d: "Sat", n: 15 },
  { d: "Sun", n: 16 },
];

const habits = [
  {
    icon: Sunrise,
    title: "Wake up early",
    meta: "7:00 AM",
    tint: "bg-amber-50",
    fg: "text-amber-500",
    done: true,
  },
  {
    icon: Droplet,
    title: "Drink 3L Water",
    meta: "2.4 / 3 L",
    tint: "bg-sky-50",
    fg: "text-sky-500",
    progress: 0.8,
  },
  {
    icon: Sparkles,
    title: "Meditate",
    meta: "10 min",
    tint: "bg-emerald-50",
    fg: "text-emerald-500",
    done: true,
  },
  {
    icon: BookOpen,
    title: "Read Book",
    meta: "20 min",
    tint: "bg-orange-50",
    fg: "text-orange-500",
    done: true,
  },
  { icon: Ban, title: "No Fap", meta: "Stay Strong", tint: "bg-rose-50", fg: "text-rose-500" },
  {
    icon: Moon,
    title: "Sleep before 11 PM",
    meta: "10:30 PM",
    tint: "bg-indigo-50",
    fg: "text-indigo-500",
  },
];

function HabitsPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader
            title="Habits"
            right={
              <button
                aria-label="Search"
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-black/[0.04] shadow-sm"
              >
                <Search className="h-4 w-4 text-slate-600" />
              </button>
            }
          />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center justify-between px-1">
              {days.map((day) => (
                <div key={day.d} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">{day.d}</span>
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold ${day.active ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-700"}`}
                  >
                    {day.n}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900">Daily Habits</h3>
            <span className="text-[13px] font-semibold text-emerald-500">Completed 3/6</span>
          </div>

          <div className="space-y-2.5">
            {habits.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] border border-black/[0.03]"
              >
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${h.tint}`}>
                  <h.icon className={`h-5 w-5 ${h.fg}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-slate-900 truncate">{h.title}</p>
                  <p className="text-[12.5px] text-slate-500 truncate">{h.meta}</p>
                </div>
                {h.done ? (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1976D2] text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                ) : h.progress ? (
                  <svg width="28" height="28" className="-rotate-90">
                    <circle cx="14" cy="14" r="11" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                    <circle
                      cx="14"
                      cy="14"
                      r="11"
                      stroke="#1976D2"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 11}
                      strokeDashoffset={2 * Math.PI * 11 * (1 - h.progress)}
                    />
                  </svg>
                ) : (
                  <div className="h-7 w-7 rounded-full border-2 border-slate-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <button className="fixed bottom-24 right-6 z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white shadow-[0_10px_30px_-6px_rgba(25,118,210,0.6)] active:scale-95 transition">
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
