import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Flame, Timer } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/_authenticated/workout")({
  head: () => ({ meta: [{ title: "Workout — ASCEND" }, { name: "description", content: "Today's workout plan." }] }),
  component: WorkoutPage,
});

const tabs = ["Plan", "Exercises", "Progress"] as const;

function WorkoutPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Plan");
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Workout" />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition ${tab === t ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}>{t}</button>
            ))}
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-2">Today's Workout</p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#E3F0FF] to-[#F5F9FF] p-5 border border-black/[0.03] shadow-[0_8px_30px_rgba(13,71,161,0.08)]">
              <div className="relative z-10 max-w-[60%]">
                <h3 className="text-[22px] font-extrabold text-slate-900 font-display">Leg Day</h3>
                <p className="text-[13px] text-slate-500 mt-1">6 Exercises • 45 min</p>
                <button className="mt-4 rounded-full bg-[#0D47A1] text-white text-[13px] font-semibold px-5 py-2.5 shadow-md active:scale-95 transition">Start Workout</button>
              </div>
              <div className="absolute -right-4 bottom-0 top-0 w-[45%] grid place-items-center">
                <Dumbbell className="h-24 w-24 text-[#0D47A1]/20" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Muscle Focus</p>
            <div className="rounded-[20px] bg-white p-4 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
              <div className="grid grid-cols-3 gap-3">
                {["Quads", "Glutes", "Calves"].map((m) => (
                  <div key={m} className="flex flex-col items-center gap-2">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50">
                      <div className="h-10 w-6 rounded-full bg-gradient-to-b from-[#42A5F5] to-[#0D47A1]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Workout Stats</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: Dumbbell, label: "Workouts", value: "24", tint: "bg-violet-50", fg: "text-violet-500" },
                { icon: Flame, label: "Calories", value: "3,450", tint: "bg-orange-50", fg: "text-orange-500" },
                { icon: Timer, label: "Minutes", value: "1,860", tint: "bg-emerald-50", fg: "text-emerald-500" },
              ].map((s) => (
                <div key={s.label} className="rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] flex flex-col items-center text-center">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.tint}`}><s.icon className={`h-4 w-4 ${s.fg}`} /></div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">{s.label}</p>
                  <p className="mt-1 text-[17px] font-extrabold text-slate-900 font-display tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
