import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Dumbbell, BookOpen, Target, Droplet, Timer, Flag } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { useAnalytics, useGoals } from "@/hooks/use-ascend";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ASCEND" },
      { name: "description", content: "Your weekly analytics." },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = [
  { label: "This Week", days: 7 },
  { label: "Last 14 Days", days: 14 },
  { label: "Last 30 Days", days: 30 },
] as const;

function AnalyticsPage() {
  const [rangeIdx, setRangeIdx] = useState(0);
  const range = RANGES[rangeIdx];
  const { data, loading } = useAnalytics(range.days);
  const { goals } = useGoals();

  const days = data ?? [];
  const workouts = days.reduce((a, d) => a + d.workouts, 0);
  const studyHours = days.reduce((a, d) => a + d.studyMinutes, 0) / 60;
  const focusMinutes = days.reduce((a, d) => a + d.focusMinutes, 0);
  const waterGlasses = days.reduce((a, d) => a + d.water, 0);
  const habitDays = days.filter((d) => d.habits > 0).length;
  const habitPct = days.length ? Math.round((habitDays / days.length) * 100) : 0;
  const activeGoals = goals.filter((g) => g.status !== "archived");
  const goalAvg = activeGoals.length
    ? Math.round(activeGoals.reduce((a, g) => a + (g.progress ?? 0), 0) / activeGoals.length)
    : 0;

  const series = days.map((d) => d.score);
  const labels = days.map((d) =>
    new Date(`${d.day}T00:00:00`).toLocaleDateString(undefined, { weekday: "narrow" }),
  );
  const hasData = days.some((d) => d.score > 0);

  const w = 320,
    h = 140,
    pad = 20,
    max = 100;
  const pts = series.length >= 2 ? series : [0, 0];
  const stepX = (w - pad * 2) / (pts.length - 1);
  const points = pts.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - v / max) * (h - pad * 2),
    v,
  }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i],
      p1 = points[i],
      p2 = points[i + 1],
      p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6,
      cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6,
      cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  const peak = points[points.length - 1];

  const cards = [
    {
      icon: Dumbbell,
      label: "Workouts",
      value: String(workouts),
      tint: "bg-violet-50",
      fg: "text-violet-500",
    },
    {
      icon: BookOpen,
      label: "Study Hours",
      value: studyHours.toFixed(1),
      tint: "bg-orange-50",
      fg: "text-orange-500",
    },
    {
      icon: Target,
      label: "Habits",
      value: `${habitPct}%`,
      tint: "bg-emerald-50",
      fg: "text-emerald-500",
    },
    {
      icon: Timer,
      label: "Focus Min",
      value: String(focusMinutes),
      tint: "bg-sky-50",
      fg: "text-sky-500",
    },
    {
      icon: Droplet,
      label: "Glasses",
      value: String(waterGlasses),
      tint: "bg-sky-50",
      fg: "text-sky-500",
    },
    {
      icon: Flag,
      label: "Goals",
      value: `${goalAvg}%`,
      tint: "bg-rose-50",
      fg: "text-rose-500",
    },
  ];

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Analytics" />

          <button
            onClick={() => setRangeIdx((i) => (i + 1) % RANGES.length)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 border border-black/[0.04] shadow-sm text-[13px] font-semibold text-slate-700"
          >
            {range.label} <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Overview</p>
            <div className="grid grid-cols-3 gap-2.5">
              {cards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] flex flex-col items-center text-center"
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.tint}`}>
                    <s.icon className={`h-4 w-4 ${s.fg}`} />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">{s.label}</p>
                  <p className="mt-1 text-[18px] font-extrabold text-slate-900 font-display tabular-nums">
                    {loading ? "—" : s.value}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">{range.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <h3 className="text-[15px] font-semibold text-slate-900">Progress</h3>
            {!loading && !hasData ? (
              <p className="mt-3 text-[13px] text-slate-500">
                No activity logged in this period yet.
              </p>
            ) : (
              <div className="relative mt-3">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
                  <defs>
                    <linearGradient id="aArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1976D2" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#1976D2" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="aLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#42A5F5" />
                      <stop offset="100%" stopColor="#0D47A1" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${path} L ${peak.x} ${h - pad} L ${points[0].x} ${h - pad} Z`}
                    fill="url(#aArea)"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="url(#aLine)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <rect
                    x={peak.x - 22}
                    y={peak.y - 28}
                    width="40"
                    height="20"
                    rx="10"
                    fill="#0D47A1"
                  />
                  <text
                    x={peak.x - 2}
                    y={peak.y - 14}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="white"
                  >
                    {peak.v}%
                  </text>
                  <circle
                    cx={peak.x}
                    cy={peak.y}
                    r="4"
                    fill="#0D47A1"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
                <div className="flex justify-between px-4 mt-1 text-[11px] font-semibold text-slate-400">
                  {labels.slice(0, 14).map((l, i) => (
                    <span key={i}>{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
