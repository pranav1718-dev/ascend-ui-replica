import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/_authenticated/pomodoro")({
  head: () => ({
    meta: [
      { title: "Pomodoro — ASCEND" },
      { name: "description", content: "Focus with the Pomodoro technique." },
    ],
  }),
  component: PomodoroPage,
});

const modes = { Focus: 25 * 60, "Short Break": 5 * 60, "Long Break": 15 * 60 } as const;
type Mode = keyof typeof modes;

function PomodoroPage() {
  const [mode, setMode] = useState<Mode>("Focus");
  const [seconds, setSeconds] = useState(modes.Focus);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setSeconds(modes[mode]);
    setRunning(false);
  }, [mode]);
  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const size = 240,
    stroke = 12,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const percent = 1 - seconds / modes[mode];

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Pomodoro" />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {(Object.keys(modes) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 h-9 rounded-full text-[12.5px] font-semibold transition ${mode === m ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid place-items-center pt-4">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <defs>
                  <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#42A5F5" />
                    <stop offset="100%" stopColor="#0D47A1" />
                  </linearGradient>
                </defs>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke="#EEF2F7"
                  strokeWidth={stroke}
                  fill="none"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke="url(#pomoGrad)"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={c}
                  strokeDashoffset={c - c * percent}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[48px] font-extrabold text-slate-900 font-display tabular-nums leading-none">
                    {mm}:{ss}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-2">{mode} Time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="h-12 min-w-[140px] rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white text-[14px] font-semibold shadow-[0_8px_20px_-6px_rgba(25,118,210,0.55)] active:scale-95 transition"
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(modes[mode]);
              }}
              className="grid h-12 w-12 place-items-center rounded-full bg-white border border-black/[0.04] shadow-sm active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-slate-500">Today's Sessions</p>
              <button className="text-[12.5px] font-semibold text-[#1976D2]">View Stats</button>
            </div>
            <div className="rounded-[20px] bg-white p-4 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] flex items-center justify-between">
              <div>
                <p className="text-[13px] text-slate-500">Completed</p>
                <p className="text-[22px] font-extrabold text-slate-900 font-display">
                  3<span className="text-slate-400 text-[16px]">/8</span>
                </p>
              </div>
              <div className="text-3xl">🌱</div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
