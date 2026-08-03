/**
 * Domain models — mirrors the tables that will exist in Supabase.
 *
 * Tables to be created (SQL will be added later, manually):
 *   profiles, goals, habits, tasks, workouts,
 *   study_sessions, journal_entries, moods, calendar_events,
 *   notifications, settings
 */

export interface Profile {
  id: string; // = auth.users.id
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  progress: number; // 0-100
  target_date: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  frequency: "daily" | "weekly";
  streak: number;
  completed_today: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_at: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  duration_min: number | null;
  scheduled_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  topic: string | null;
  duration_min: number;
  started_at: string;
  completed: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface Mood {
  id: string;
  user_id: string;
  mood: "great" | "good" | "okay" | "low" | "bad";
  note: string | null;
  logged_at: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  kind: string | null;
  created_at: string;
}

export interface Settings {
  user_id: string;
  theme: "light" | "dark" | "system";
  units: "metric" | "imperial";
  notifications_enabled: boolean;
  reminder_time: string | null;
  updated_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  study_session_id: string | null;
  label: string | null;
  focus_min: number;
  break_min: number;
  rounds: number;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaterTracking {
  id: string;
  user_id: string;
  log_date: string;
  glasses: number;
  goal_glasses: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDay {
  id: string;
  user_id: string;
  day: string;
  habits_done: number;
  workouts_done: number;
  study_minutes: number;
  focus_minutes: number;
  water_glasses: number;
  score: number;
  created_at: string;
  updated_at: string;
}

/** Tables that exist in Supabase (see db/schema.sql). */
export type TableName =
  | "profiles"
  | "goals"
  | "habits"
  | "workouts"
  | "study_sessions"
  | "pomodoro_sessions"
  | "water_tracking"
  | "analytics";
