import {
  Sunrise,
  Droplet,
  Sparkles,
  BookOpen,
  Ban,
  Moon,
  Target,
  Dumbbell,
  Cpu,
  Database,
  Flame,
  Timer,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

/** Icon + colour palette used across the app. Keys are stored in Supabase. */
export const ICONS: Record<string, { icon: LucideIcon; tint: string; fg: string }> = {
  sunrise: { icon: Sunrise, tint: "bg-amber-50", fg: "text-amber-500" },
  droplet: { icon: Droplet, tint: "bg-sky-50", fg: "text-sky-500" },
  sparkles: { icon: Sparkles, tint: "bg-emerald-50", fg: "text-emerald-500" },
  book: { icon: BookOpen, tint: "bg-orange-50", fg: "text-orange-500" },
  ban: { icon: Ban, tint: "bg-rose-50", fg: "text-rose-500" },
  moon: { icon: Moon, tint: "bg-indigo-50", fg: "text-indigo-500" },
  target: { icon: Target, tint: "bg-rose-50", fg: "text-rose-500" },
  dumbbell: { icon: Dumbbell, tint: "bg-violet-50", fg: "text-violet-500" },
  cpu: { icon: Cpu, tint: "bg-violet-50", fg: "text-violet-500" },
  database: { icon: Database, tint: "bg-emerald-50", fg: "text-emerald-500" },
  flame: { icon: Flame, tint: "bg-orange-50", fg: "text-orange-500" },
  timer: { icon: Timer, tint: "bg-emerald-50", fg: "text-emerald-500" },
  check: { icon: CheckCircle2, tint: "bg-sky-50", fg: "text-sky-500" },
};

export const ICON_KEYS = Object.keys(ICONS);

export function iconFor(key?: string | null, fallback = "target") {
  return ICONS[key ?? ""] ?? ICONS[fallback];
}

/** Deterministic palette so items without an icon still look varied. */
export function paletteFor(seed: string) {
  const keys = ICON_KEYS;
  let n = 0;
  for (const ch of seed) n = (n + ch.charCodeAt(0)) % keys.length;
  return ICONS[keys[n]];
}
