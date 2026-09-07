import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Dumbbell, Flame, Plus, Timer } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { SheetDialog } from "@/components/common/SheetDialog";
import { localDay, useWorkoutExercises, useWorkouts } from "@/hooks/use-ascend";
import workoutArt from "@/assets/workout-illustration.png";

export const Route = createFileRoute("/_authenticated/workout")({
  head: () => ({
    meta: [
      { title: "Workout — ASCEND" },
      { name: "description", content: "Today's workout plan." },
    ],
  }),
  component: WorkoutPage,
});

const tabs = ["Plan", "Exercises", "Progress"] as const;

function WorkoutPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Plan");
  const [openWorkout, setOpenWorkout] = useState(false);
  const [openExercise, setOpenExercise] = useState(false);
  const { workouts, loading, create, complete } = useWorkouts();

  const next = useMemo(() => workouts.find((w) => !w.completed) ?? workouts[0], [workouts]);
  const { exercises, create: addExercise, toggle } = useWorkoutExercises(next?.id);

  const stats = useMemo(() => {
    const done = workouts.filter((w) => w.completed);
    const minutes = done.reduce((a, w) => a + (w.duration_min ?? 0), 0);
    return {
      workouts: done.length,
      minutes,
      calories: Math.round(minutes * 7.5),
    };
  }, [workouts]);

  const muscles = useMemo(() => {
    const set = new Map<string, number>();
    exercises.forEach((e) => {
      if (e.muscle) set.set(e.muscle, (set.get(e.muscle) ?? 0) + 1);
    });
    return [...set.keys()].slice(0, 3);
  }, [exercises]);

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Workout" />

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
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-2">Today's Workout</p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#E3F0FF] to-[#F5F9FF] p-5 border border-black/[0.03] shadow-[0_8px_30px_rgba(13,71,161,0.08)]"
              >
                <div className="relative z-10 max-w-[60%]">
                  <h3 className="text-[22px] font-extrabold text-slate-900 font-display">
                    {loading ? "Loading…" : (next?.name ?? "No workout yet")}
                  </h3>
                  <p className="text-[13px] text-slate-500 mt-1">
                    {next
                      ? `${exercises.length} Exercises • ${next.duration_min ?? 45} min`
                      : "Add your first session"}
                  </p>
                  <button
                    onClick={() =>
                      next ? void complete(next, !next.completed) : setOpenWorkout(true)
                    }
                    className="mt-4 rounded-full bg-[#0D47A1] text-white text-[13px] font-semibold px-5 py-2.5 shadow-md active:scale-95 transition"
                  >
                    {!next ? "Add Workout" : next.completed ? "Completed ✓" : "Start Workout"}
                  </button>
                </div>
                <div className="absolute -right-2 bottom-0 top-0 w-[45%] grid place-items-center">
                  <img
                    src={workoutArt}
                    alt="Dumbbell illustration"
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-28 w-28 object-contain drop-shadow-md"
                  />
                </div>
              </motion.div>

              <p className="text-[13px] font-semibold text-slate-500 mb-3 mt-5">Muscle Focus</p>
              <div className="rounded-[20px] bg-white p-4 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                <div className="grid grid-cols-3 gap-3">
                  {(muscles.length ? muscles : ["Quads", "Glutes", "Calves"]).map((m) => (
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
          )}

          {tab === "Exercises" && (
            <div className="space-y-2.5">
              {!next && (
                <p className="text-[13px] text-slate-400">
                  Create a workout first to add exercises.
                </p>
              )}
              {next && exercises.length === 0 && (
                <p className="text-[13px] text-slate-400">No exercises in {next.name} yet.</p>
              )}
              {exercises.map((e) => (
                <button
                  key={e.id}
                  onClick={() => void toggle(e)}
                  className="w-full text-left flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50">
                    <Dumbbell className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{e.name}</p>
                    <p className="text-[12.5px] text-slate-500">
                      {e.sets ?? 3} × {e.reps ?? 12}
                      {e.muscle ? ` • ${e.muscle}` : ""}
                    </p>
                  </div>
                  {e.completed ? (
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1976D2] text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-slate-200" />
                  )}
                </button>
              ))}
              {next && (
                <button
                  onClick={() => setOpenExercise(true)}
                  className="w-full h-12 rounded-full border border-dashed border-[#0D47A1]/30 text-[#0D47A1] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Exercise
                </button>
              )}
            </div>
          )}

          {tab === "Progress" && (
            <div className="space-y-2.5">
              {workouts.length === 0 && (
                <p className="text-[13px] text-slate-400">No sessions logged yet.</p>
              )}
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50">
                    <Timer className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-slate-900 truncate">{w.name}</p>
                    <p className="text-[12.5px] text-slate-500">
                      {w.scheduled_at
                        ? new Date(w.scheduled_at).toLocaleDateString()
                        : "Unscheduled"}
                      {w.duration_min ? ` • ${w.duration_min} min` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[12px] font-semibold ${w.completed ? "text-emerald-500" : "text-slate-400"}`}
                  >
                    {w.completed ? "Done" : "Planned"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-3">Workout Stats</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  icon: Dumbbell,
                  label: "Workouts",
                  value: stats.workouts.toLocaleString(),
                  tint: "bg-violet-50",
                  fg: "text-violet-500",
                },
                {
                  icon: Flame,
                  label: "Calories",
                  value: stats.calories.toLocaleString(),
                  tint: "bg-orange-50",
                  fg: "text-orange-500",
                },
                {
                  icon: Timer,
                  label: "Minutes",
                  value: stats.minutes.toLocaleString(),
                  tint: "bg-emerald-50",
                  fg: "text-emerald-500",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] flex flex-col items-center text-center"
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${s.tint}`}>
                    <s.icon className={`h-4 w-4 ${s.fg}`} />
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-500">{s.label}</p>
                  <p className="mt-1 text-[17px] font-extrabold text-slate-900 font-display tabular-nums">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpenWorkout(true)}
          className="fixed bottom-24 right-6 z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white shadow-[0_10px_30px_-6px_rgba(25,118,210,0.6)] active:scale-95 transition"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <SheetDialog
          open={openWorkout}
          onClose={() => setOpenWorkout(false)}
          title="New Workout"
          submitLabel="Add Workout"
          fields={[
            { name: "name", label: "Workout name", placeholder: "Leg Day" },
            { name: "category", label: "Category", placeholder: "Strength", required: false },
            { name: "duration_min", label: "Duration (min)", type: "number", required: false },
            { name: "scheduled_at", label: "Date", type: "date", required: false },
          ]}
          onSubmit={async (v) => {
            await create({
              name: v.name.trim(),
              category: v.category || undefined,
              duration_min: v.duration_min ? Number(v.duration_min) : undefined,
              scheduled_at: v.scheduled_at ? localDay(v.scheduled_at).toISOString() : null,
            });
          }}
        />

        <SheetDialog
          open={openExercise}
          onClose={() => setOpenExercise(false)}
          title="New Exercise"
          submitLabel="Add Exercise"
          fields={[
            { name: "name", label: "Exercise", placeholder: "Back Squat" },
            { name: "muscle", label: "Muscle", placeholder: "Quads", required: false },
            { name: "sets", label: "Sets", type: "number", required: false },
            { name: "reps", label: "Reps", type: "number", required: false },
          ]}
          onSubmit={(v) =>
            addExercise({
              name: v.name.trim(),
              muscle: v.muscle || undefined,
              sets: v.sets ? Number(v.sets) : undefined,
              reps: v.reps ? Number(v.reps) : undefined,
            })
          }
        />
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
