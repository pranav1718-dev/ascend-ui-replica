import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, Check, Timer, CalendarDays, ArrowRight } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { SheetDialog } from "@/components/common/SheetDialog";
import { iconFor } from "@/lib/icon-map";
import {
  localDay,
  todayISO,
  useStudySessions,
  useStudySubjects,
  usePomodoro,
  useSettings,
} from "@/hooks/use-ascend";
import type { StudySession } from "@/types/models";

export const Route = createFileRoute("/_authenticated/study")({
  head: () => ({
    meta: [
      { title: "Study — ASCEND" },
      { name: "description", content: "Study plan, subjects and focus sessions." },
    ],
  }),
  component: StudyPage,
});

const tabs = ["Plan", "Subjects", "Pomodoro"] as const;

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function bookLabel(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (clean.length <= 19) return clean.toUpperCase();
  const initials = clean
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 8);
  return initials.length >= 2
    ? initials.toUpperCase()
    : `${clean.slice(0, 16).trim()}…`.toUpperCase();
}

function DynamicBookStack({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;

  const books = labels.slice(0, 3);
  const positions = [
    "bottom-1 right-0 rotate-[3deg] bg-primary text-primary-foreground",
    "bottom-[2.35rem] right-2 -rotate-[2deg] bg-card text-primary",
    "bottom-[4.7rem] right-0 rotate-[4deg] bg-brand-blue text-primary-foreground",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-3 right-3 h-[8.25rem] w-[8.75rem] sm:right-6 sm:w-[10rem]"
      aria-label={`Study books: ${books.join(", ")}`}
      role="img"
    >
      <div className="absolute bottom-0 right-1 h-3 w-[92%] rounded-full bg-primary/15 blur-md" />
      {books.map((label, index) => (
        <div
          key={`${label}-${index}`}
          className={`absolute flex h-10 w-[8.15rem] items-center overflow-hidden rounded-[7px] border border-primary/20 shadow-[0_8px_16px_rgba(13,71,161,0.18)] sm:w-[9.25rem] ${positions[index]}`}
        >
          <span className="h-full w-2.5 shrink-0 border-r border-primary/20 bg-primary/15" />
          <span className="min-w-0 flex-1 px-1.5 text-center text-[8px] font-extrabold leading-tight tracking-normal">
            {bookLabel(label)}
          </span>
          <span className="h-[72%] w-1.5 shrink-0 rounded-l-full border-l border-primary/20 bg-background/70" />
        </div>
      ))}
    </motion.div>
  );
}

const DATE_KEY = "ascend:study-date";

function StudyPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Plan");
  const [open, setOpen] = useState(false);

  /* selected day — kept across navigation and refresh */
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (typeof window === "undefined") return todayISO();
    return window.localStorage.getItem(DATE_KEY) || todayISO();
  });
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(DATE_KEY, selectedDate);
  }, [selectedDate]);

  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
    create: createSubject,
    setProgress,
  } = useStudySubjects();
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    create: createSession,
    complete,
    uncomplete,
  } = useStudySessions();
  const { completedToday, focusMinutesToday } = usePomodoro();
  const { settings } = useSettings();

  /* sessions on the selected day (local dates, never UTC-shifted) */
  const todaysSessions = useMemo(
    () => sessions.filter((s) => todayISO(new Date(s.started_at)) === selectedDate),
    [sessions, selectedDate],
  );
  const next = todaysSessions.find((s) => !s.completed) ?? null;

  /* running session timer (client-side, persisted on complete) */
  const [active, setActive] = useState<StudySession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const tick = useRef<number | null>(null);

  const bookLabels = useMemo(() => {
    const preferred = active ?? next;
    const candidates = [
      preferred?.subject,
      preferred?.topic,
      ...todaysSessions.map((session) => session.subject),
      ...subjects.map((subject) => subject.name),
    ];
    return candidates.reduce<string[]>((labels, candidate) => {
      const value = candidate?.trim();
      if (
        value &&
        !labels.some((label) => label.toLocaleLowerCase() === value.toLocaleLowerCase())
      ) {
        labels.push(value);
      }
      return labels;
    }, []);
  }, [active, next, subjects, todaysSessions]);

  useEffect(() => {
    if (!active) return;
    tick.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [active]);

  function start(session: StudySession) {
    setActive(session);
    setElapsed(0);
  }

  async function finish() {
    if (!active) return;
    const minutes = Math.max(1, Math.round(elapsed / 60));
    await complete(active, minutes);
    setActive(null);
    setElapsed(0);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="mx-auto max-w-2xl space-y-6 px-5 pt-5 sm:px-8">
          <ScreenHeader
            title="Study"
            right={
              <button
                type="button"
                onClick={() => setTab("Plan")}
                aria-label="Open study plan calendar"
                className="grid h-10 w-10 place-items-center rounded-2xl text-primary transition active:scale-95"
              >
                <CalendarDays className="h-6 w-6" strokeWidth={2.2} />
              </button>
            }
          />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition ${tab === t ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Plan" && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value || todayISO())}
                  aria-label="Selected day"
                  className="h-10 flex-1 rounded-full bg-white border border-black/[0.04] px-4 text-[13px] font-semibold text-slate-700 shadow-sm outline-none focus:border-[#1976D2]/40"
                />
                {selectedDate !== todayISO() && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayISO())}
                    className="h-10 rounded-full bg-[#0D47A1]/[0.06] text-[#0D47A1] text-[12.5px] font-semibold px-4"
                  >
                    Today
                  </button>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[17px] font-bold text-slate-900 font-display">
                    {selectedDate === todayISO() ? "Today's Study Plan" : "Study Plan"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab("Plan")}
                    className="inline-flex h-10 items-center gap-1 text-[12.5px] font-semibold text-brand-blue"
                  >
                    See All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative min-h-[14rem] overflow-hidden rounded-[24px] border border-primary/5 bg-gradient-to-br from-accent to-background p-5 shadow-[0_12px_36px_rgba(13,71,161,0.10)] sm:min-h-[15rem] sm:p-6">
                  <div className="relative z-10 max-w-[62%] sm:max-w-[66%]">
                    {sessionsLoading ? (
                      <p className="text-[13px] text-slate-500">Loading your plan…</p>
                    ) : active ? (
                      <>
                        <h3 className="text-[22px] font-extrabold leading-tight text-slate-900 font-display">
                          {active.subject}
                        </h3>
                        <p className="text-[13px] text-slate-500 mt-1 tabular-nums">
                          In progress · {mm}:{ss}
                        </p>
                        <button
                          onClick={() => void finish()}
                          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md transition active:scale-95"
                        >
                          Complete Session
                        </button>
                      </>
                    ) : next ? (
                      <>
                        <h3 className="text-[22px] font-extrabold leading-tight text-slate-900 font-display">
                          {next.subject}
                        </h3>
                        <p className="text-[13px] text-slate-500 mt-1">
                          {fmtTime(next.started_at)}
                          {next.topic ? ` · ${next.topic}` : ""}
                        </p>
                        <button
                          onClick={() => start(next)}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md transition active:scale-95"
                        >
                          Start Session <ArrowRight className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-[22px] font-extrabold leading-tight text-slate-900 font-display">
                          No session planned
                        </h3>
                        <p className="text-[13px] text-slate-500 mt-1">
                          Tap + to schedule your next study block.
                        </p>
                      </>
                    )}
                  </div>
                  <DynamicBookStack labels={bookLabels} />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[17px] font-bold text-slate-900 font-display">Subjects</h2>
                  <button
                    type="button"
                    onClick={() => setTab("Subjects")}
                    className="inline-flex h-10 items-center gap-1 text-[12.5px] font-semibold text-brand-blue"
                  >
                    See All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {subjectsLoading && <p className="text-[13px] text-slate-400">Loading subjects…</p>}
                {subjectsError && (
                  <p className="text-[13px] text-rose-500">Couldn't load subjects.</p>
                )}
                {!subjectsLoading && !subjectsError && subjects.length === 0 && (
                  <p className="text-[13px] text-slate-400">
                    No subjects yet — open Subjects and tap +.
                  </p>
                )}
                <div className="space-y-3">
                  {subjects.slice(0, 3).map((subject, index) => {
                    const look = iconFor(subject.icon, "book");
                    const Icon = look.icon;
                    return (
                      <motion.button
                        key={subject.id}
                        type="button"
                        onClick={() => setTab("Subjects")}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid min-h-[5.25rem] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[20px] border border-black/[0.03] bg-white p-4 text-left shadow-[0_6px_22px_rgba(15,23,42,0.05)]"
                      >
                        <span
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${look.tint}`}
                        >
                          <Icon className={`h-6 w-6 ${look.fg}`} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-semibold text-slate-900">
                            {subject.name}
                          </span>
                          <span className="block text-[12px] text-slate-500">
                            Progress {subject.progress ?? 0}%
                          </span>
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-[17px] font-bold text-slate-900 font-display">
                  {selectedDate === todayISO() ? "Today's Sessions" : "Sessions"}
                </h2>
                {sessionsError && (
                  <p className="text-[13px] text-rose-500">Couldn't load sessions.</p>
                )}
                {!sessionsLoading && !sessionsError && todaysSessions.length === 0 && (
                  <p className="text-[13px] text-slate-400">
                    No sessions on this day — tap + to add one.
                  </p>
                )}
                <div className="space-y-2.5">
                  {todaysSessions.map((s, i) => {
                    const look = iconFor(null, "book");
                    const Icon = look.icon;
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                      >
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${look.tint}`}
                        >
                          <Icon className={`h-5 w-5 ${look.fg}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-slate-900 truncate">
                            {s.subject}
                          </p>
                          <p className="text-[12px] text-slate-500 truncate">
                            {fmtTime(s.started_at)}
                            {s.duration_min ? ` · ${s.duration_min} min` : ""}
                          </p>
                        </div>
                        {s.completed ? (
                          <button
                            type="button"
                            onClick={() => void uncomplete(s)}
                            aria-label={`Mark ${s.subject} incomplete`}
                            title="Mark incomplete"
                            className="grid h-7 w-7 place-items-center rounded-full bg-[#1976D2] text-white active:scale-95 transition"
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </button>
                        ) : (
                          <button
                            onClick={() => start(s)}
                            className="rounded-full bg-[#0D47A1]/[0.06] text-[#0D47A1] text-[12px] font-semibold px-3.5 py-1.5"
                          >
                            Start
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === "Subjects" && (
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-3">Subjects</p>
              {subjectsLoading && <p className="text-[13px] text-slate-400">Loading subjects…</p>}
              {subjectsError && (
                <p className="text-[13px] text-rose-500">Couldn't load subjects.</p>
              )}
              {!subjectsLoading && !subjectsError && subjects.length === 0 && (
                <p className="text-[13px] text-slate-400">
                  No subjects yet — tap + to add your first one.
                </p>
              )}
              <div className="space-y-2.5">
                {subjects.map((s, i) => {
                  const look = iconFor(s.icon, "book");
                  const Icon = look.icon;
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => void setProgress(s, (s.progress ?? 0) + 10)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-full text-left flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                    >
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${look.tint}`}
                      >
                        <Icon className={`h-5 w-5 ${look.fg}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-slate-900 truncate">
                          {s.name}
                        </p>
                        <p className="text-[12px] text-slate-500">Progress {s.progress ?? 0}%</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#42A5F5] to-[#0D47A1]"
                            style={{ width: `${s.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "Pomodoro" && (
            <div className="space-y-4">
              <div className="rounded-[24px] bg-white p-5 border border-black/[0.03] shadow-[0_8px_30px_rgba(13,71,161,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50">
                    <Timer className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-slate-900">Focus today</p>
                    <p className="text-[12.5px] text-slate-500">
                      {completedToday} sessions · {focusMinutesToday} min
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[12.5px] text-slate-500">
                  Current preset: {settings.focus_min} min focus / {settings.break_min} min break.
                </p>
                <Link
                  to="/pomodoro"
                  className="mt-4 inline-flex rounded-full bg-[#0D47A1] text-white text-[13px] font-semibold px-5 py-2.5 shadow-md active:scale-95 transition"
                >
                  Open Pomodoro
                </Link>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label={tab === "Subjects" ? "Add subject" : "Add study session"}
          className="fixed bottom-24 right-6 z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-primary text-primary-foreground shadow-[0_10px_30px_-6px_rgba(25,118,210,0.6)] transition active:scale-95 sm:right-[max(1.5rem,calc((100vw-42rem)/2))]"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {tab === "Subjects" ? (
          <SheetDialog
            open={open}
            onClose={() => setOpen(false)}
            title="New Subject"
            submitLabel="Add Subject"
            withIconPicker
            fields={[{ name: "name", label: "Subject name", placeholder: "Data Structures" }]}
            onSubmit={(v, icon) => createSubject(v.name.trim(), icon)}
          />
        ) : (
          <SheetDialog
            open={open}
            onClose={() => setOpen(false)}
            title="New Study Session"
            submitLabel="Add Session"
            addAnotherLabel="Save & add another"
            fields={[
              {
                name: "subject_id",
                label: "Subject",
                type: "select",
                required: false,
                sticky: true,
                placeholder: subjects.length ? "Choose a subject" : "No subjects yet",
                options: [
                  ...subjects.map((s) => ({ value: s.name, label: s.name })),
                  { value: "__other", label: "Other (type below)" },
                ],
              },
              {
                name: "subject",
                label: "Other subject",
                placeholder: "Data Structures",
                required: false,
                sticky: true,
              },
              { name: "topic", label: "Topic", placeholder: "Linked lists", required: false },
              {
                name: "date",
                label: "Date",
                type: "date",
                defaultValue: selectedDate,
                sticky: true,
              },
              { name: "time", label: "Start time", type: "time", required: false, sticky: true },
              {
                name: "duration_min",
                label: "Planned minutes",
                type: "number",
                placeholder: "60",
                required: false,
              },
            ]}
            onSubmit={async (v) => {
              const picked = v.subject_id && v.subject_id !== "__other" ? v.subject_id : "";
              const subject = (picked || v.subject || "").trim();
              if (!subject) throw new Error("Pick a subject or type one.");
              const day = v.date || selectedDate;
              // Sessions added for another day with no time would otherwise all land on
              // midnight; nudge each one a minute later so they list in the order added.
              const onThatDay = sessions.filter(
                (s) => todayISO(new Date(s.started_at)) === day,
              ).length;
              const plain = localDay(day);
              plain.setMinutes(plain.getMinutes() + onThatDay);
              const started = v.time
                ? new Date(`${day}T${v.time}:00`).toISOString()
                : day === todayISO()
                  ? new Date().toISOString()
                  : plain.toISOString();
              setSelectedDate(day);
              await createSession({
                subject,
                topic: v.topic?.trim() || undefined,
                duration_min: v.duration_min ? Number(v.duration_min) : undefined,
                started_at: started,
                completed: false,
              });
            }}
          />
        )}

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
