import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { todayISO, useGoals, useStudySessions, useWorkouts } from "@/hooks/use-ascend";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — ASCEND" },
      { name: "description", content: "Your calendar and schedule." },
    ],
  }),
  component: CalendarPage,
});

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Local (not UTC) YYYY-MM-DD for a given year/month/day. */
function isoOf(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function timeLabel(iso: string | null | undefined) {
  if (!iso) return "All day";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface CalEvent {
  id: string;
  color: string;
  title: string;
  time: string;
}

function CalendarPage() {
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { workouts, loading: lw, refresh: rw } = useWorkouts();
  const { sessions, loading: ls, error: se } = useStudySessions();
  const { goals, loading: lg } = useGoals();

  const loading = lw || ls || lg;

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    // Monday-first offset
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const push = (day: string, e: CalEvent) => {
      const list = map.get(day) ?? [];
      list.push(e);
      map.set(day, list);
    };

    for (const w of workouts) {
      if (!w.scheduled_at) continue;
      const day = todayISO(new Date(w.scheduled_at));
      push(day, {
        id: `w-${w.id}`,
        color: "bg-amber-400",
        title: w.name,
        time: `${timeLabel(w.scheduled_at)}${w.completed ? " • Completed" : ""}`,
      });
    }
    for (const s of sessions) {
      const day = todayISO(new Date(s.started_at));
      push(day, {
        id: `s-${s.id}`,
        color: "bg-emerald-400",
        title: s.topic ? `${s.subject} — ${s.topic}` : s.subject,
        time: `${timeLabel(s.started_at)} • ${s.duration_min ?? 0} min`,
      });
    }
    for (const g of goals) {
      if (!g.target_date) continue;
      push(g.target_date.slice(0, 10), {
        id: `g-${g.id}`,
        color: "bg-sky-400",
        title: `Goal due: ${g.title}`,
        time: `${g.progress}% complete`,
      });
    }
    return map;
  }, [workouts, sessions, goals]);

  const selectedEvents = eventsByDay.get(selected) ?? [];
  const selectedLabel = new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const shift = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Calendar" />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shift(-1)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <h3 className="text-[16px] font-bold text-slate-900 font-display">
                {MONTHS[cursor.month]} {cursor.year}
              </h3>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shift(1)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((d) => (
                <span key={d} className="text-center text-[11px] font-semibold text-slate-400">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d, i) => {
                if (!d) return <div key={i} className="aspect-square" />;
                const iso = isoOf(cursor.year, cursor.month, d);
                const isSelected = iso === selected;
                const isToday = iso === today;
                const has = (eventsByDay.get(iso)?.length ?? 0) > 0;
                return (
                  <div key={i} className="aspect-square grid place-items-center">
                    <button
                      type="button"
                      aria-label={iso}
                      aria-pressed={isSelected}
                      onClick={() => setSelected(iso)}
                      className={`relative grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-semibold transition ${
                        isSelected
                          ? "bg-[#0D47A1] text-white shadow-md"
                          : isToday
                            ? "text-[#0D47A1] ring-1 ring-[#0D47A1]/40"
                            : "text-slate-700"
                      }`}
                    >
                      {d}
                      {has && !isSelected && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#1976D2]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">
              {selected === today ? "Today • " : ""}
              {selectedLabel}
            </p>
            <div className="space-y-2.5">
              {loading && <p className="text-[13px] text-slate-400">Loading your schedule…</p>}
              {!loading && se && (
                <div className="rounded-[20px] bg-white p-3.5 border border-black/[0.03]">
                  <p className="text-[13px] text-rose-500">Couldn’t load your schedule.</p>
                  <button
                    type="button"
                    onClick={() => void rw()}
                    className="mt-1 text-[12.5px] font-semibold text-[#0D47A1]"
                  >
                    Try again
                  </button>
                </div>
              )}
              {!loading && !se && selectedEvents.length === 0 && (
                <p className="text-[13px] text-slate-400">Nothing scheduled for this day.</p>
              )}
              {selectedEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                >
                  <div className={`w-1.5 self-stretch rounded-full ${e.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-slate-900 truncate">{e.title}</p>
                    <p className="text-[12px] text-slate-500">{e.time}</p>
                  </div>
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
