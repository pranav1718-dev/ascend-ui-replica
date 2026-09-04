import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Check, Flame, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { SheetDialog } from "@/components/common/SheetDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useHabits } from "@/hooks/use-ascend";
import type { Habit } from "@/types/models";
import { iconFor } from "@/lib/icon-map";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "Habits — ASCEND" },
      { name: "description", content: "Track your daily habits." },
    ],
  }),
  component: HabitsPage,
});

function useWeek() {
  return useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        n: d.getDate(),
        active: d.toDateString() === today.toDateString(),
      };
    });
  }, []);
}

function HabitsPage() {
  const days = useWeek();
  const { habits, loading, toggle, create, remove, doneCount, total } = useHabits();
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const visible = habits.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader
            title="Habits"
            right={
              <button
                aria-label="Search"
                onClick={() => setSearching((s) => !s)}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-black/[0.04] shadow-sm"
              >
                <Search className="h-4 w-4 text-slate-600" />
              </button>
            }
          />

          {searching && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search habits"
              className="w-full h-11 rounded-2xl bg-white border border-black/[0.04] shadow-sm px-4 text-[14px] text-slate-900 outline-none"
            />
          )}

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center justify-between px-1">
              {days.map((day) => (
                <div key={day.d} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">{day.d}</span>
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full text-[13px] font-bold ${day.active ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-700"}`}
                  >
                    {day.n}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900">Daily Habits</h3>
            <span className="text-[13px] font-semibold text-emerald-500">
              Completed {doneCount}/{total}
            </span>
          </div>

          <div className="space-y-2.5">
            {loading && <p className="text-[13px] text-slate-400">Loading habits…</p>}
            {!loading && visible.length === 0 && (
              <p className="text-[13px] text-slate-400">
                No habits yet — tap + to add your first one.
              </p>
            )}
            {visible.map((h, i) => {
              const look = iconFor(h.icon, "sparkles");
              const Icon = look.icon;
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full text-left flex items-center gap-3 rounded-[20px] bg-white p-3.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] border border-black/[0.03]"
                >
                  <button
                    type="button"
                    onClick={() => void toggle(h)}
                    className="flex flex-1 min-w-0 items-center gap-3 text-left"
                  >
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${look.tint}`}
                    >
                      <Icon className={`h-5 w-5 ${look.fg}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-slate-900 truncate">{h.name}</p>
                      <p className="text-[12.5px] text-slate-500 truncate inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        {h.streak} day streak
                      </p>
                    </div>
                    {h.completed_today ? (
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1976D2] text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full border-2 border-slate-200" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${h.name}`}
                    onClick={() => setPendingDelete(h)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-50 active:scale-95 transition"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white shadow-[0_10px_30px_-6px_rgba(25,118,210,0.6)] active:scale-95 transition"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <SheetDialog
          open={open}
          onClose={() => setOpen(false)}
          title="New Habit"
          submitLabel="Add Habit"
          withIconPicker
          fields={[{ name: "name", label: "Habit name", placeholder: "Drink 3L water" }]}
          onSubmit={(v, icon) => create(v.name.trim(), icon)}
        />

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Delete habit?"
          message={
            pendingDelete
              ? `"${pendingDelete.name}" and its streak will be permanently removed.`
              : undefined
          }
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (pendingDelete) await remove(pendingDelete.id);
          }}
        />
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
