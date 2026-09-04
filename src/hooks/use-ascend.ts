import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/services/db";
import { authService } from "@/services/auth";
import type {
  AnalyticsDay,
  Goal,
  Habit,
  PomodoroSession,
  Profile,
  StudySession,
  StudySubject,
  UserSettings,
  WaterTracking,
  Workout,
  WorkoutExercise,
} from "@/types/models";

/* ---------------- helpers ---------------- */

export function todayISO(d = new Date()) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(todayISO(d));
  }
  return out;
}

/**
 * Guards against duplicate concurrent mutations (rapid double taps).
 * Calls with a key already in flight are ignored.
 */
function useInFlight() {
  const ref = useRef<Set<string>>(new Set());
  return useCallback(async <T>(key: string, fn: () => Promise<T>): Promise<T | undefined> => {
    if (ref.current.has(key)) return undefined;
    ref.current.add(key);
    try {
      return await fn();
    } finally {
      ref.current.delete(key);
    }
  }, []);
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Guards against out-of-order responses: only the newest run may write state.
  const seq = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const result = await fn();
      if (id !== seq.current || !alive.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== seq.current || !alive.current) return;
      setError(e as Error);
    } finally {
      if (id === seq.current && alive.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, refresh: run, setData };
}

/* ---------------- profile ---------------- */

export function useProfile() {
  const { data, loading, refresh, setData } = useAsync<Profile | null>(async () => {
    const id = await db.userId();
    const { data, error } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? null;
  }, []);

  const save = useCallback(
    async (patch: Partial<Profile>) => {
      const id = await db.userId();
      const row = await db.upsert<Profile>("profiles", { id, ...patch }, "id");
      setData(row);
      return row;
    },
    [setData],
  );

  return { profile: data, loading, refresh, save };
}

export function useAuthEmail() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    void authService.getUser().then((u) => setEmail(u?.email ?? null));
  }, []);
  return email;
}

/* ---------------- habits ---------------- */

export function useHabits() {
  const { data, loading, refresh, setData } = useAsync<Habit[]>(async () => {
    const { data, error } = await db
      .from("habits")
      .select("*")
      .eq("user_id", await db.userId())
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as Habit[]) ?? [];
  }, []);

  const habits = useMemo(() => {
    const today = todayISO();
    return (data ?? []).map((h) => ({
      ...h,
      completed_today: h.last_completed_on === today,
    }));
  }, [data]);

  const guard = useInFlight();

  const toggle = useCallback(
    async (habit: Habit) =>
      guard(`toggle:${habit.id}`, async () => {
        const today = todayISO();
        const done = habit.last_completed_on === today;
        const yesterday = todayISO(new Date(Date.now() - 86400000));
        const streak = done
          ? Math.max(0, habit.streak - 1)
          : habit.last_completed_on === yesterday
            ? habit.streak + 1
            : 1;
        const patch = {
          last_completed_on: done ? null : today,
          completed_today: !done,
          streak,
        };
        setData((prev) =>
          (prev ?? []).map((h) => (h.id === habit.id ? ({ ...h, ...patch } as Habit) : h)),
        );
        const { error } = await db
          .from("habits")
          .update(patch as never)
          .eq("id", habit.id);
        if (error) {
          // roll back the optimistic update so the UI reflects the database
          setData((prev) => (prev ?? []).map((h) => (h.id === habit.id ? habit : h)));
          throw error;
        }
      }),
    [guard, setData],
  );

  const create = useCallback(
    async (name: string, icon: string) =>
      guard(`create:${name}`, async () => {
        const user_id = await db.userId();
        const { data, error } = await db
          .from("habits")
          .insert({ user_id, name, icon } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [...(prev ?? []), data as Habit]);
      }),
    [guard, setData],
  );

  const remove = useCallback(
    async (id: string) =>
      guard(`remove:${id}`, async () => {
        const userId = await db.userId();
        const { error } = await db.from("habits").delete().eq("id", id).eq("user_id", userId);
        if (error) throw error;
        setData((prev) => (prev ?? []).filter((h) => h.id !== id));
      }),
    [guard, setData],
  );

  const doneCount = habits.filter((h) => h.completed_today).length;
  return { habits, loading, refresh, toggle, create, remove, doneCount, total: habits.length };
}

/* ---------------- goals ---------------- */

export function useGoals() {
  const { data, loading, refresh, setData } = useAsync<Goal[]>(async () => {
    const { data, error } = await db
      .from("goals")
      .select("*")
      .eq("user_id", await db.userId())
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Goal[]) ?? [];
  }, []);

  const guard = useInFlight();

  const create = useCallback(
    async (input: { title: string; description?: string; target_date?: string | null }) =>
      guard(`create:${input.title}`, async () => {
        const user_id = await db.userId();
        const { data, error } = await db
          .from("goals")
          .insert({ user_id, ...input } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [data as Goal, ...(prev ?? [])]);
      }),
    [guard, setData],
  );

  const setProgress = useCallback(
    async (goal: Goal, progress: number) => {
      const p = Math.max(0, Math.min(100, Math.round(progress)));
      const patch = { progress: p, status: p >= 100 ? "completed" : "active" } as const;
      setData((prev) => (prev ?? []).map((g) => (g.id === goal.id ? { ...g, ...patch } : g)));
      const userId = await db.userId();
      const { error } = await db
        .from("goals")
        .update(patch as never)
        .eq("id", goal.id)
        .eq("user_id", userId);
      if (error) {
        setData((prev) => (prev ?? []).map((g) => (g.id === goal.id ? goal : g)));
        throw error;
      }
    },
    [setData],
  );

  const remove = useCallback(
    async (id: string) =>
      guard(`remove:${id}`, async () => {
        const userId = await db.userId();
        const { error } = await db.from("goals").delete().eq("id", id).eq("user_id", userId);
        if (error) throw error;
        setData((prev) => (prev ?? []).filter((g) => g.id !== id));
      }),
    [guard, setData],
  );

  return { goals: data ?? [], loading, refresh, create, setProgress, remove };
}

/* ---------------- workouts ---------------- */

export function useWorkouts() {
  const { data, loading, refresh, setData } = useAsync<Workout[]>(async () => {
    const { data, error } = await db
      .from("workouts")
      .select("*")
      .eq("user_id", await db.userId())
      .order("scheduled_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data as Workout[]) ?? [];
  }, []);

  const guard = useInFlight();

  const create = useCallback(
    async (input: {
      name: string;
      category?: string;
      duration_min?: number;
      scheduled_at?: string | null;
    }) =>
      guard(`create:${input.name}`, async () => {
        const user_id = await db.userId();
        const { data, error } = await db
          .from("workouts")
          .insert({ user_id, ...input } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [...(prev ?? []), data as Workout]);
        return data as Workout;
      }),
    [guard, setData],
  );

  const complete = useCallback(
    async (workout: Workout, completed = true) =>
      guard(`complete:${workout.id}`, async () => {
        setData((prev) => (prev ?? []).map((w) => (w.id === workout.id ? { ...w, completed } : w)));
        const { error } = await db
          .from("workouts")
          .update({ completed } as never)
          .eq("id", workout.id);
        if (error) {
          setData((prev) => (prev ?? []).map((w) => (w.id === workout.id ? workout : w)));
          throw error;
        }
      }),
    [guard, setData],
  );

  const remove = useCallback(
    async (id: string) =>
      guard(`remove:${id}`, async () => {
        const userId = await db.userId();
        const { error } = await db.from("workouts").delete().eq("id", id).eq("user_id", userId);
        if (error) throw error;
        setData((prev) => (prev ?? []).filter((w) => w.id !== id));
      }),
    [guard, setData],
  );

  return { workouts: data ?? [], loading, refresh, create, complete, remove };
}

export function useWorkoutExercises(workoutId?: string) {
  const { data, loading, refresh, setData } = useAsync<WorkoutExercise[]>(async () => {
    if (!workoutId) return [];
    const { data, error } = await db
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("position", { ascending: true });
    if (error) throw error;
    return (data as WorkoutExercise[]) ?? [];
  }, [workoutId]);

  const guard = useInFlight();

  const create = useCallback(
    async (input: { name: string; sets?: number; reps?: number; muscle?: string }) =>
      guard(`create:${input.name}`, async () => {
        if (!workoutId) return;
        const user_id = await db.userId();
        const { data: row, error } = await db
          .from("workout_exercises")
          .insert({
            user_id,
            workout_id: workoutId,
            position: (data?.length ?? 0) + 1,
            ...input,
          } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [...(prev ?? []), row as WorkoutExercise]);
      }),
    [guard, workoutId, data, setData],
  );

  const toggle = useCallback(
    async (ex: WorkoutExercise) =>
      guard(`toggle:${ex.id}`, async () => {
        const completed = !ex.completed;
        setData((prev) => (prev ?? []).map((e) => (e.id === ex.id ? { ...e, completed } : e)));
        const { error } = await db
          .from("workout_exercises")
          .update({ completed } as never)
          .eq("id", ex.id);
        if (error) {
          setData((prev) => (prev ?? []).map((e) => (e.id === ex.id ? ex : e)));
          throw error;
        }
      }),
    [guard, setData],
  );

  return { exercises: data ?? [], loading, refresh, create, toggle };
}

/* ---------------- study ---------------- */

export function useStudySubjects() {
  const { data, loading, error, refresh, setData } = useAsync<StudySubject[]>(async () => {
    const { data, error } = await db
      .from("study_subjects")
      .select("*")
      .eq("user_id", await db.userId())
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as StudySubject[]) ?? [];
  }, []);

  const guard = useInFlight();

  const create = useCallback(
    async (name: string, icon: string) =>
      guard(`create:${name}`, async () => {
        const user_id = await db.userId();
        const { data: row, error } = await db
          .from("study_subjects")
          .insert({ user_id, name, icon } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [...(prev ?? []), row as StudySubject]);
      }),
    [guard, setData],
  );

  const setProgress = useCallback(
    async (subject: StudySubject, progress: number) => {
      const p = Math.max(0, Math.min(100, Math.round(progress)));
      setData((prev) => (prev ?? []).map((s) => (s.id === subject.id ? { ...s, progress: p } : s)));
      const { error } = await db
        .from("study_subjects")
        .update({ progress: p } as never)
        .eq("id", subject.id);
      if (error) throw error;
    },
    [setData],
  );

  return { subjects: data ?? [], loading, error, refresh, create, setProgress };
}

export function useStudySessions() {
  const { data, loading, error, refresh, setData } = useAsync<StudySession[]>(async () => {
    const { data, error } = await db
      .from("study_sessions")
      .select("*")
      .eq("user_id", await db.userId())
      .order("started_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data as StudySession[]) ?? [];
  }, []);

  const guard = useInFlight();

  const create = useCallback(
    async (input: {
      subject: string;
      topic?: string;
      duration_min?: number;
      started_at?: string;
      completed?: boolean;
    }) =>
      guard(`create:${input.subject}:${input.topic ?? ""}`, async () => {
        const user_id = await db.userId();
        const { data: row, error } = await db
          .from("study_sessions")
          .insert({ user_id, ...input } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [row as StudySession, ...(prev ?? [])]);
        return row as StudySession;
      }),
    [guard, setData],
  );

  const complete = useCallback(
    async (session: StudySession, duration_min: number) =>
      guard(`complete:${session.id}`, async () => {
        setData((prev) =>
          (prev ?? []).map((s) =>
            s.id === session.id ? { ...s, completed: true, duration_min } : s,
          ),
        );
        const { error } = await db
          .from("study_sessions")
          .update({ completed: true, duration_min } as never)
          .eq("id", session.id);
        if (error) {
          setData((prev) => (prev ?? []).map((s) => (s.id === session.id ? session : s)));
          throw error;
        }
      }),
    [guard, setData],
  );

  return { sessions: data ?? [], loading, error, refresh, create, complete };
}

/* ---------------- water ---------------- */

export function useWater() {
  const { data, loading, refresh, setData } = useAsync<WaterTracking | null>(async () => {
    const userId = await db.userId();
    const day = todayISO();
    const { data, error } = await db
      .from("water_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", day)
      .maybeSingle();
    if (error) throw error;
    return (data as WaterTracking) ?? null;
  }, []);

  const glasses = data?.glasses ?? 0;
  const goal = data?.goal_glasses ?? 8;

  // Writes are serialised so rapid taps cannot race each other; the last
  // value always wins and no duplicate rows are created.
  const chain = useRef<Promise<unknown>>(Promise.resolve());

  const setGlasses = useCallback(
    async (next: number) => {
      const value = Math.max(0, next);
      setData((prev) =>
        prev
          ? { ...prev, glasses: value }
          : ({ glasses: value, goal_glasses: 8, log_date: todayISO() } as WaterTracking),
      );
      chain.current = chain.current
        .catch(() => undefined)
        .then(async () => {
          const row = await db.upsert<WaterTracking>(
            "water_tracking",
            { log_date: todayISO(), glasses: value },
            "user_id,log_date",
          );
          setData(row);
        });
      return chain.current as Promise<void>;
    },
    [setData],
  );

  return { glasses, goal, loading, refresh, setGlasses };
}

/* ---------------- pomodoro ---------------- */

export function usePomodoro() {
  const { data, loading, refresh, setData } = useAsync<PomodoroSession[]>(async () => {
    const start = `${todayISO()}T00:00:00`;
    const { data, error } = await db
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", await db.userId())
      .gte("started_at", start)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data as PomodoroSession[]) ?? [];
  }, []);

  const guard = useInFlight();

  const record = useCallback(
    async (input: { focus_min: number; break_min: number; label?: string }) =>
      guard(`record:${input.focus_min}:${input.label ?? ""}`, async () => {
        const user_id = await db.userId();
        const { data: row, error } = await db
          .from("pomodoro_sessions")
          .insert({
            user_id,
            ...input,
            started_at: new Date(Date.now() - input.focus_min * 60000).toISOString(),
            ended_at: new Date().toISOString(),
            completed: true,
          } as never)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [row as PomodoroSession, ...(prev ?? [])]);
      }),
    [guard, setData],
  );

  const sessions = data ?? [];
  const completedToday = sessions.filter((s) => s.completed).length;
  const focusMinutesToday = sessions.reduce((a, s) => a + (s.completed ? s.focus_min : 0), 0);

  return { sessions, completedToday, focusMinutesToday, loading, refresh, record };
}

/* ---------------- settings ---------------- */

const SETTINGS_DEFAULTS: Omit<UserSettings, "user_id" | "created_at" | "updated_at"> = {
  theme: "light",
  units: "metric",
  notifications_enabled: true,
  water_goal_glasses: 8,
  focus_min: 25,
  break_min: 5,
};

export function useSettings() {
  const { data, loading, refresh, setData } = useAsync<UserSettings | null>(async () => {
    const userId = await db.userId();
    const { data, error } = await db
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as UserSettings) ?? null;
  }, []);

  const settings = { ...SETTINGS_DEFAULTS, ...(data ?? {}) } as UserSettings;

  const save = useCallback(
    async (patch: Partial<UserSettings>) => {
      setData((prev) => ({ ...(prev ?? ({} as UserSettings)), ...patch }) as UserSettings);
      const row = await db.upsert<UserSettings>(
        "user_settings",
        { ...SETTINGS_DEFAULTS, ...(data ?? {}), ...patch },
        "user_id",
      );
      setData(row);
    },
    [data, setData],
  );

  return { settings, loading, refresh, save };
}

/* ---------------- analytics ---------------- */

export interface DayStat {
  day: string;
  habits: number;
  workouts: number;
  studyMinutes: number;
  focusMinutes: number;
  water: number;
  score: number;
}

export function useAnalytics(days = 7) {
  return useAsync<DayStat[]>(async () => {
    const userId = await db.userId();
    const range = lastNDays(days);
    const from = `${range[0]}T00:00:00`;

    const [workoutsRes, studyRes, pomoRes, waterRes, habitsRes] = await Promise.all([
      db.from("workouts").select("*").eq("user_id", userId).gte("scheduled_at", from),
      db.from("study_sessions").select("*").eq("user_id", userId).gte("started_at", from),
      db.from("pomodoro_sessions").select("*").eq("user_id", userId).gte("started_at", from),
      db.from("water_tracking").select("*").eq("user_id", userId).gte("log_date", range[0]),
      db.from("habits").select("*").eq("user_id", userId),
    ]);

    const workouts = (workoutsRes.data ?? []) as Workout[];
    const study = (studyRes.data ?? []) as StudySession[];
    const pomo = (pomoRes.data ?? []) as PomodoroSession[];
    const water = (waterRes.data ?? []) as WaterTracking[];
    const habits = (habitsRes.data ?? []) as Habit[];

    return range.map((day) => {
      const w = workouts.filter(
        (x) => x.completed && x.scheduled_at && todayISO(new Date(x.scheduled_at)) === day,
      ).length;
      const sMin = study
        .filter((x) => todayISO(new Date(x.started_at)) === day)
        .reduce((a, x) => a + (x.duration_min ?? 0), 0);
      const fMin = pomo
        .filter((x) => x.completed && todayISO(new Date(x.started_at)) === day)
        .reduce((a, x) => a + x.focus_min, 0);
      const glasses = water.find((x) => x.log_date === day)?.glasses ?? 0;
      const habitsDone = habits.filter((h) => h.last_completed_on === day).length;

      const score = Math.min(
        100,
        Math.round(
          (habits.length ? (habitsDone / habits.length) * 40 : 0) +
            Math.min(20, w * 20) +
            Math.min(20, sMin / 6) +
            Math.min(20, (glasses / 8) * 20),
        ),
      );

      return {
        day,
        habits: habitsDone,
        workouts: w,
        studyMinutes: sMin,
        focusMinutes: fMin,
        water: glasses,
        score,
      };
    });
  }, [days]);
}

export type { AnalyticsDay };
