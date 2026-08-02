import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Minus, Plus, Droplet } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/water")({
  head: () => ({ meta: [{ title: "Water Tracker — ASCEND" }, { name: "description", content: "Track your daily water intake." }] }),
  component: WaterPage,
});

function WaterPage() {
  const [glasses, setGlasses] = useState(5);
  const total = 8;
  const liters = (glasses * 0.3).toFixed(1);
  const size = 200, stroke = 14, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const percent = Math.min(1, glasses / total);
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <div className="flex items-center justify-between h-11">
            <Link to="/home" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-black/[0.04] shadow-sm"><ChevronLeft className="h-5 w-5 text-slate-700" /></Link>
            <h1 className="text-[17px] font-bold text-slate-900 font-display">Water Tracker</h1>
            <span className="w-10" />
          </div>

          <div className="grid place-items-center pt-2">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <defs>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#42A5F5" /><stop offset="100%" stopColor="#0D47A1" />
                  </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F7" strokeWidth={stroke} fill="none" />
                <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#waterGrad)" strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={c - c * percent} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[36px] font-extrabold text-slate-900 font-display tabular-nums leading-none">{liters} L</p>
                  <p className="text-[13px] text-slate-500 mt-1">of 3.0 L</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button onClick={() => setGlasses(Math.max(0, glasses - 1))} className="grid h-11 w-11 place-items-center rounded-full bg-white border border-black/[0.04] shadow-sm active:scale-95 transition"><Minus className="h-4 w-4 text-slate-700" /></button>
            <p className="text-[15px] font-semibold text-slate-700">Today</p>
            <button onClick={() => setGlasses(glasses + 1)} className="grid h-11 w-11 place-items-center rounded-full bg-white border border-black/[0.04] shadow-sm active:scale-95 transition"><Plus className="h-4 w-4 text-slate-700" /></button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <Droplet key={i} className={`h-7 w-7 ${i < glasses ? "text-[#1976D2] fill-[#1976D2]" : "text-slate-200"}`} />
            ))}
          </div>
          <p className="text-center text-[11.5px] text-slate-400">Add 250 ml</p>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-2">Quick Add</p>
            <div className="grid grid-cols-4 gap-2">
              {["250 ml", "500 ml", "750 ml", "1 L"].map((q) => (
                <button key={q} className="h-11 rounded-full bg-white border border-black/[0.04] shadow-sm text-[13px] font-semibold text-slate-700 active:scale-95 transition">{q}</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-sky-50 p-3.5 text-center">
            <p className="text-[12.5px] text-sky-700 font-medium">💧 Tip: Keep your body hydrated</p>
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
