import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — ASCEND" }, { name: "description", content: "Your calendar and schedule." }] }),
  component: CalendarPage,
});

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const daysGrid: (number | null)[] = [
  null, null, null, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, null,
];

const events = [
  { color: "bg-amber-400", title: "Leg Day Workout", time: "7:00 AM - 8:00 AM" },
  { color: "bg-emerald-400", title: "Data Structures Study", time: "2:00 PM - 4:00 PM" },
  { color: "bg-sky-400", title: "Read Book", time: "9:00 PM - 9:30 PM" },
];

function CalendarPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Calendar" />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center justify-between mb-3">
              <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50"><ChevronLeft className="h-4 w-4 text-slate-600" /></button>
              <h3 className="text-[16px] font-bold text-slate-900 font-display">May 2025</h3>
              <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50"><ChevronRight className="h-4 w-4 text-slate-600" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((d) => <span key={d} className="text-center text-[11px] font-semibold text-slate-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map((d, i) => (
                <div key={i} className="aspect-square grid place-items-center">
                  {d && (
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-semibold ${d === 13 ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-700"}`}>{d}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Today • Thu, 13 May</p>
            <div className="space-y-2.5">
              {events.map((e) => (
                <div key={e.title} className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                  <div className={`w-1.5 self-stretch rounded-full ${e.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-slate-900 truncate">{e.title}</p>
                    <p className="text-[12px] text-slate-500">{e.time}</p>
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
