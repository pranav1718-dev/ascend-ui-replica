import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { SheetDialog } from "@/components/common/SheetDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { localDay, useGoals } from "@/hooks/use-ascend";
import { iconFor, paletteFor } from "@/lib/icon-map";
import type { Goal } from "@/types/models";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [{ title: "Goals — ASCEND" }, { name: "description", content: "Your active goals." }],
  }),
  component: GoalsPage,
});

function daysLeft(date: string | null) {
  if (!date) return "";
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((localDay(date).getTime() - start.getTime()) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  return `${diff} days left`;
}

function GoalsPage() {
  const [tab, setTab] = useState<"Active" | "Completed">("Active");
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Goal | null>(null);
  const { goals, loading, create, setProgress, remove } = useGoals();

  const visible = goals.filter((g) =>
    tab === "Active" ? g.status !== "completed" : g.status === "completed",
  );

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-32">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Goals" />

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 border border-black/[0.04] shadow-sm">
            {(["Active", "Completed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition ${tab === t ? "bg-[#0D47A1] text-white shadow-md" : "text-slate-500"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {loading && <p className="text-[13px] text-slate-400">Loading goals…</p>}
            {!loading && visible.length === 0 && (
              <p className="text-[13px] text-slate-400">
                {tab === "Active"
                  ? "No active goals yet — add one below."
                  : "Nothing completed yet."}
              </p>
            )}
            {visible.map((g) => {
              const look = g.description ? iconFor("target") : paletteFor(g.title);
              const Icon = look.icon;
              return (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-[20px] bg-white p-3.5 border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                >
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${look.tint}`}
                  >
                    <Icon className={`h-5 w-5 ${look.fg}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-semibold text-slate-900 truncate">{g.title}</p>
                      <span className="text-[11.5px] font-semibold text-slate-500 ml-2">
                        {daysLeft(g.target_date)}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5">Progress {g.progress}%</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#42A5F5] to-[#0D47A1]"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={g.progress}
                      onChange={(e) => void setProgress(g, Number(e.target.value))}
                      aria-label={`Progress for ${g.title}`}
                      className="mt-2 w-full h-1 accent-[#0D47A1]"
                    />
                  </div>
                  {g.status === "completed" && (
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1976D2] text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingDelete(g)}
                    aria-label={`Delete ${g.title}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-300 hover:text-rose-500 active:scale-95 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white text-[14px] font-semibold shadow-[0_8px_20px_-6px_rgba(25,118,210,0.55)] active:scale-[0.98] transition inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add New Goal
          </button>
        </div>

        <SheetDialog
          open={open}
          onClose={() => setOpen(false)}
          title="New Goal"
          submitLabel="Add Goal"
          fields={[
            { name: "title", label: "Goal", placeholder: "Read 20 books" },
            { name: "description", label: "Notes", required: false },
            { name: "target_date", label: "Target date", type: "date", required: false },
          ]}
          onSubmit={(v) =>
            create({
              title: v.title.trim(),
              description: v.description || undefined,
              target_date: v.target_date || null,
            })
          }
        />
        <ConfirmDialog
          open={!!pendingDelete}
          title="Delete goal?"
          message={pendingDelete ? `“${pendingDelete.title}” will be permanently removed.` : ""}
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
