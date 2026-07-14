import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Dumbbell, BookOpen, Sunrise } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — ASCEND" }, { name: "description", content: "Your active goals." }] }),
  component: GoalsPage,
});

const goals = [
  { icon: Target, name: "Lose 5 kg", progress: 60, meta: "3 kg left", tint: "bg-rose-50", fg: "text-rose-500" },
  { icon: Dumbbell, name: "Run 5K", progress: 40, meta: "2.1 km left", tint: "bg-orange-50", fg: "text-orange-500" },
  { icon: BookOpen, name: "Read 20 Books", progress: 70, meta: "6 books left", tint: "bg-amber-50", fg: "text-amber-500" },
  { icon: Sunrise, name: "Wake up at 6 AM", progress: 80, meta: "14 days left", tint: "bg-violet-50", fg: "text-violet-500" },
];

function GoalsPage() {
  const [tab, setTab] = useState<"Active" | "Completed">("Active");
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-32">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Goals" />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {(["Active", "Completed"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition ${tab === t ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}>{t}</button>
            ))}
          </div>

          <div className="space-y-2.5">
            {goals.map((g) => (
              <div key={g.name} className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${g.tint}`}><g.icon className={`h-5 w-5 ${g.fg}`} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{g.name}</p>
                    <span className="text-[11.5px] font-semibold text-slate-500 ml-2">{g.meta}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">Progress {g.progress}%</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#42A5F5] to-[#0D47A1]" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full h-12 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white text-[14px] font-semibold shadow-[0_8px_20px_-6px_rgba(25,118,210,0.55)] active:scale-[0.98] transition inline-flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add New Goal
          </button>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
