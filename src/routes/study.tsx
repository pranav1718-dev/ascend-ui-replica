import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, BookOpen, Cpu, Database, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/study")({
  head: () => ({ meta: [{ title: "Study — ASCEND" }, { name: "description", content: "Study plan and subjects." }] }),
  component: StudyPage,
});

const tabs = ["Plan", "Subjects", "Pomodoro"] as const;
const subjects = [
  { icon: BookOpen, name: "Data Structures", progress: 65, tint: "bg-sky-50", fg: "text-sky-500" },
  { icon: Cpu, name: "Operating Systems", progress: 40, tint: "bg-violet-50", fg: "text-violet-500" },
  { icon: Database, name: "Database Systems", progress: 30, tint: "bg-emerald-50", fg: "text-emerald-500" },
];

function StudyPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Plan");
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Study" />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition ${tab === t ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}>{t}</button>
            ))}
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-2">Today's Study Plan</p>
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#E3F0FF] to-[#F5F9FF] p-5 border border-black/[0.03] shadow-[0_8px_30px_rgba(13,71,161,0.08)]">
              <div className="relative z-10 max-w-[65%]">
                <h3 className="text-[20px] font-extrabold text-slate-900 font-display">Data Structures</h3>
                <p className="text-[13px] text-slate-500 mt-1">2:00 PM - 4:00 PM</p>
                <button className="mt-4 rounded-full bg-[#0D47A1] text-white text-[13px] font-semibold px-5 py-2.5 shadow-md active:scale-95 transition">Start Session</button>
              </div>
              <div className="absolute -right-2 bottom-2 grid place-items-center">
                <BookOpen className="h-20 w-20 text-[#0D47A1]/20" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Subjects</p>
            <div className="space-y-2.5">
              {subjects.map((s) => (
                <div key={s.name} className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${s.tint}`}><s.icon className={`h-5 w-5 ${s.fg}`} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="text-[12px] text-slate-500">Progress {s.progress}%</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#42A5F5] to-[#0D47A1]" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
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
