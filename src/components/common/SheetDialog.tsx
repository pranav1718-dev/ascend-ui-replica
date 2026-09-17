import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ICONS, ICON_KEYS } from "@/lib/icon-map";

export interface SheetField {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "date" | "time" | "select";
  required?: boolean;
  defaultValue?: string;
  /** Options for `type: "select"`. */
  options?: { value: string; label: string }[];
  /** Keeps its value after "save and add another" instead of clearing. */
  sticky?: boolean;
}

/**
 * Bottom sheet used for creating records. Styled with the same tokens as the
 * rest of the app (white card, 24px radius, navy CTA) so nothing looks new.
 */
export function SheetDialog({
  open,
  onClose,
  title,
  fields,
  submitLabel = "Save",
  withIconPicker = false,
  addAnotherLabel,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: SheetField[];
  submitLabel?: string;
  withIconPicker?: boolean;
  /** When set, shows a secondary action that saves and keeps the sheet open. */
  addAnotherLabel?: string;
  onSubmit: (values: Record<string, string>, icon: string) => Promise<void> | void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [icon, setIcon] = useState(ICON_KEYS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const initial = () => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]));

  useEffect(() => {
    if (open) {
      setValues(initial());
      setError(null);
      setSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function run(keepOpen: boolean) {
    const missing = fields.find((f) => f.required !== false && !values[f.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values, icon);
      if (keepOpen) {
        // Keep sticky fields (subject, date, time) so the next entry only needs
        // the details that actually change.
        setValues((prev) =>
          Object.fromEntries(
            fields.map((f) => [f.name, f.sticky ? (prev[f.name] ?? "") : (f.defaultValue ?? "")]),
          ),
        );
        setSaved(true);
      } else {
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await run(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
          />
          <motion.form
            onSubmit={submit}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-[420px] rounded-t-[28px] bg-white p-6 pb-8 shadow-[0_-8px_40px_rgba(15,23,42,0.18)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-900 font-display">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-50"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {fields.map((f) => (
                <label key={f.name} className="block">
                  <span className="text-[12.5px] font-semibold text-slate-500">{f.label}</span>
                  {f.type === "select" ? (
                    <select
                      value={values[f.name] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="mt-1.5 w-full h-12 rounded-2xl bg-[#F7F8FC] border border-black/[0.04] px-4 text-[15px] text-slate-900 outline-none focus:border-[#1976D2]/40"
                    >
                      <option value="">{f.placeholder ?? "Select…"}</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      value={values[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                      className="mt-1.5 w-full h-12 rounded-2xl bg-[#F7F8FC] border border-black/[0.04] px-4 text-[15px] text-slate-900 outline-none focus:border-[#1976D2]/40"
                    />
                  )}
                </label>
              ))}

              {withIconPicker && (
                <div>
                  <span className="text-[12.5px] font-semibold text-slate-500">Icon</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ICON_KEYS.map((k) => {
                      const I = ICONS[k].icon;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setIcon(k)}
                          className={`grid h-10 w-10 place-items-center rounded-2xl ${ICONS[k].tint} ${icon === k ? "ring-2 ring-[#0D47A1]" : ""}`}
                        >
                          <I className={`h-4 w-4 ${ICONS[k].fg}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && <p className="text-[12.5px] font-medium text-rose-500">{error}</p>}
              {!error && saved && (
                <p className="text-[12.5px] font-medium text-emerald-600">Saved — add another.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white text-[14px] font-semibold shadow-[0_8px_20px_-6px_rgba(25,118,210,0.55)] active:scale-[0.98] transition disabled:opacity-60"
            >
              {busy ? "Saving…" : submitLabel}
            </button>
            {addAnotherLabel && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(true)}
                className="mt-3 w-full h-12 rounded-full bg-[#0D47A1]/[0.06] text-[#0D47A1] text-[14px] font-semibold active:scale-[0.98] transition disabled:opacity-60"
              >
                {addAnotherLabel}
              </button>
            )}
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
