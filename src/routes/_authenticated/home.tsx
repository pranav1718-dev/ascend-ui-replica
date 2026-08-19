import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  Check,
  Dumbbell,
  BookOpen,
  User,
  Target,
  CheckCircle2,
} from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import {
  todayISO,
  useAnalytics,
  useGoals,
  useHabits,
  useProfile,
  useStudySessions,
  useWorkouts,
} from "@/hooks/use-ascend";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "ASCEND — Dashboard" },
      {
        name: "description",
        content: "Your daily progress, plan, stats and habits in one premium dashboard.",
      },
    ],
  }),
  component: HomePage,
});

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Number((target * eased).toFixed(target % 1 === 0 ? 0 : 1)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function HomePage() {
  const greeting = useGreeting();
  const { profile } = useProfile();
  const { habits, doneCount, total } = useHabits();
  const { workouts } = useWorkouts();
  const { sessions } = useStudySessions();
  const { goals } = useGoals();
  const { data: week } = useAnalytics(7);

  const today = todayISO();

  const todaysWorkouts = useMemo(
    () => workouts.filter((w) => w.scheduled_at && todayISO(new Date(w.scheduled_at)) === today),
    [workouts, today],
  );
  const todaysSessions = useMemo(
    () => sessions.filter((s) => todayISO(new Date(s.started_at)) === today),
    [sessions, today],
  );

  const plan: PlanItem[] = useMemo(() => {
    const items: PlanItem[] = [];
    todaysWorkouts.forEach((w) =>
      items.push({
        key: `w-${w.id}`,
        icon: Dumbbell,
        title: w.name,
        subtitle: w.category ?? "Workout",
        meta: w.scheduled_at
          ? new Date(w.scheduled_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "Today",
        completed: w.completed,
        tint: "bg-teal-50",
        fg: "text-teal-600",
      }),
    );
    todaysSessions.forEach((s) =>
      items.push({
        key: `s-${s.id}`,
        icon: BookOpen,
        title: s.subject,
        subtitle: s.topic ?? "Study Session",
        meta: new Date(s.started_at).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        completed: s.completed,
        tint: "bg-orange-50",
        fg: "text-orange-500",
      }),
    );
    habits
      .filter((h) => !h.completed_today)
      .slice(0, 3)
      .forEach((h) =>
        items.push({
          key: `h-${h.id}`,
          icon: CheckCircle2,
          title: h.name,
          subtitle: "Habit",
          meta: "Today",
          tint: "bg-amber-50",
          fg: "text-amber-600",
        }),
      );
    return items.slice(0, 5);
  }, [todaysWorkouts, todaysSessions, habits]);

  const todayStat = week?.[week.length - 1];
  const prevStat = week?.[week.length - 2];
  const percent = todayStat?.score ?? 0;

  const weekStudyHours = (week ?? []).reduce((a, d) => a + d.studyMinutes, 0) / 60;
  const weekWorkouts = (week ?? []).reduce((a, d) => a + d.workouts, 0);
  const habitPct = total ? Math.round((doneCount / total) * 100) : 0;

  const activeGoals = goals.filter((g) => g.status !== "archived");
  const goalAvg = activeGoals.length
    ? Math.round(activeGoals.reduce((a, g) => a + (g.progress ?? 0), 0) / activeGoals.length)
    : 0;

  const chartData = (week ?? []).map((d) => d.score);
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "there";

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-6 space-y-6">
          <Header greeting={greeting} name={firstName} />
          <DailyProgress percent={percent} delta={percent - (prevStat?.score ?? 0)} />
          <TodaysPlan items={plan} />
          <StatsRow
            workouts={weekWorkouts}
            studyHours={Number(weekStudyHours.toFixed(1))}
            habitPct={habitPct}
            goalAvg={goalAvg}
          />
          <ProgressChart data={chartData} />
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

/* ---------- Header ---------- */

function Header({ greeting, name }: { greeting: string; name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <Link
          to="/settings"
          aria-label="Menu"
          className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 backdrop-blur border border-black/[0.04] shadow-sm active:scale-95 transition"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </Link>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/70 backdrop-blur border border-black/[0.04] shadow-sm active:scale-95 transition"
          >
            <Bell className="h-5 w-5 text-slate-700" />
          </button>
          <Link
            to="/profile"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] p-[2px] shadow-md"
          >
            <div className="h-full w-full rounded-full bg-white grid place-items-center overflow-hidden">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[15px] text-slate-500 font-medium">{greeting},</p>
        <h1 className="mt-0.5 text-[28px] leading-tight font-extrabold tracking-tight text-slate-900 font-display">
          {name}{" "}
          <span className="inline-block animate-[wave_1.6s_ease-in-out_infinite] origin-[70%_70%]">
            👋
          </span>
        </h1>
      </div>
      <style>{`@keyframes wave{0%,60%,100%{transform:rotate(0)}10%{transform:rotate(14deg)}20%{transform:rotate(-8deg)}30%{transform:rotate(14deg)}40%{transform:rotate(-4deg)}50%{transform:rotate(10deg)}}`}</style>
    </motion.div>
  );
}

/* ---------- Daily Progress ---------- */

function DailyProgress({ percent, delta }: { percent: number; delta: number }) {
  const value = useCountUp(percent);
  const size = 128;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  const headline =
    percent >= 80 ? "Great job!" : percent >= 40 ? "Keep going!" : percent > 0 ? "Good start" : "Let's begin";
  const sub =
    percent === 0
      ? "Log something to start today."
      : delta >= 0
        ? "Ahead of yesterday."
        : "Keep it up.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
      className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]"
    >
      <h3 className="text-[15px] font-semibold text-slate-900">Daily Progress</h3>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#42A5F5" />
                <stop offset="60%" stopColor="#1976D2" />
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
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#ringGrad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex items-baseline">
              <span className="text-[30px] font-extrabold tracking-tight text-slate-900 font-display tabular-nums">
                {value}
              </span>
              <span className="text-sm font-semibold text-slate-500 ml-0.5">%</span>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[22px] font-extrabold tracking-tight text-slate-900 font-display">
            {headline}
          </h4>
          <p className="text-[15px] text-slate-500 mt-0.5">{sub}</p>
          <Link
            to="/analytics"
            className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(25,118,210,0.55)] bg-gradient-to-r from-[#1976D2] to-[#0D47A1] active:scale-[0.98] transition"
          >
            View Stats
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Today's Plan ---------- */

type PlanItem = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  meta: string;
  completed?: boolean;
  tint: string;
  fg: string;
};

function TodaysPlan({ items }: { items: PlanItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">Today's Plan</h3>
        <Link to="/calendar" className="text-[13px] font-semibold text-[#1976D2] active:opacity-70">
          See All
        </Link>
      </div>
      <div className="mt-3 space-y-2.5">
        {items.length === 0 && (
          <div className="rounded-[20px] bg-white p-5 text-center shadow-[0_4px_18px_rgba(15,23,42,0.04)] border border-black/[0.03]">
            <p className="text-[14px] font-semibold text-slate-700">Nothing planned yet</p>
            <p className="text-[12.5px] text-slate-500 mt-1">
              Add a workout, study session or habit to see it here.
            </p>
          </div>
        )}
        {items.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 + i * 0.06 }}
            whileTap={{ scale: 0.985 }}
            className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] border border-black/[0.03]"
          >
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.tint}`}>
              <item.icon className={`h-5 w-5 ${item.fg}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-slate-900 truncate">{item.title}</p>
              <p className="text-[13px] text-slate-500 truncate">{item.subtitle}</p>
            </div>
            {item.completed ? (
              <div className="flex items-center gap-1.5 text-[#1976D2]">
                <span className="text-[13px] font-semibold">Completed</span>
                <div className="grid h-5 w-5 place-items-center rounded-full bg-[#1976D2] text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              </div>
            ) : (
              <span className="text-[13px] font-medium text-slate-500 tabular-nums">
                {item.meta}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Stats Row ---------- */

function StatsRow({
  workouts,
  studyHours,
  habitPct,
  goalAvg,
}: {
  workouts: number;
  studyHours: number;
  habitPct: number;
  goalAvg: number;
}) {
  const stats = [
    {
      label: "Workouts",
      value: workouts,
      caption: "this week",
      icon: Dumbbell,
      tint: "bg-violet-50",
      fg: "text-violet-500",
    },
    {
      label: "Study Hours",
      value: studyHours,
      caption: "this week",
      icon: BookOpen,
      tint: "bg-orange-50",
      fg: "text-orange-500",
    },
    {
      label: "Habits",
      value: habitPct,
      suffix: "%",
      caption: `goals ${goalAvg}%`,
      icon: Target,
      tint: "bg-emerald-50",
      fg: "text-emerald-500",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s, i) => (
        <StatCard key={s.label} index={i} {...s} />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  caption,
  icon: Icon,
  tint,
  fg,
  index,
}: {
  label: string;
  value: number;
  suffix?: string;
  caption: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  fg: string;
  index: number;
}) {
  const n = useCountUp(value, 1000);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
      className="rounded-[20px] bg-white p-3.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] border border-black/[0.03] flex flex-col items-center text-center"
    >
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
        <Icon className={`h-4 w-4 ${fg}`} />
      </div>
      <p className="mt-2 text-[12px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-[20px] font-extrabold tracking-tight text-slate-900 font-display tabular-nums">
        {n}
        {suffix ?? ""}
      </p>
      <p className="text-[10.5px] text-slate-400 leading-tight mt-1">{caption}</p>
    </motion.div>
  );
}

/* ---------- Progress Chart ---------- */

function ProgressChart({ data }: { data: number[] }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const w = 320;
  const h = 130;
  const pad = 16;
  const max = 100;
  const series = data.length >= 2 ? data : [0, 0, 0, 0, 0, 0, 0];
  const stepX = (w - pad * 2) / (series.length - 1);
  const points = series.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - v / max) * (h - pad * 2),
    v,
  }));

  const path = smoothPath(points);
  const area = `${path} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;
  const last = points[points.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]"
    >
      <h3 className="text-[15px] font-semibold text-slate-900">Progress</h3>
      <div className="relative mt-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[150px]">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1976D2" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#1976D2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#42A5F5" />
              <stop offset="100%" stopColor="#0D47A1" />
            </linearGradient>
          </defs>
          {points.slice(0, 7).map((p, i) => (
            <line
              key={i}
              x1={p.x}
              x2={p.x}
              y1={h - pad}
              y2={h - pad + 4}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          ))}
          <motion.path
            d={area}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
          />
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="#1976D2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.05 }}
            />
          ))}
          <motion.g
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <rect x={last.x - 26} y={last.y - 30} width={44} height={22} rx={11} fill="#0D47A1" />
            <text
              x={last.x - 4}
              y={last.y - 15}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="white"
            >
              {last.v}%
            </text>
          </motion.g>
        </svg>
        <div className="flex justify-between px-3 mt-1 text-[11px] font-semibold text-slate-400">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
