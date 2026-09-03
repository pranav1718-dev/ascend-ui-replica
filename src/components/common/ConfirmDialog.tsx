import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Small confirmation sheet used before destructive actions.
 * Uses the same visual tokens as SheetDialog so nothing looks new.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onCancel();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onCancel()}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-[420px] rounded-t-[28px] bg-white p-6 shadow-[0_-8px_40px_rgba(15,23,42,0.18)]"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
          >
            <h3 className="text-[17px] font-bold text-slate-900 font-display">{title}</h3>
            {message && <p className="mt-2 text-[13px] text-slate-500">{message}</p>}
            {error && <p className="mt-3 text-[12.5px] font-medium text-rose-500">{error}</p>}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="flex-1 h-12 rounded-full bg-slate-100 text-slate-700 text-[14px] font-semibold active:scale-[0.98] transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirm()}
                disabled={busy}
                className="flex-1 h-12 rounded-full bg-rose-500 text-white text-[14px] font-semibold shadow-[0_8px_20px_-6px_rgba(244,63,94,0.55)] active:scale-[0.98] transition disabled:opacity-60"
              >
                {busy ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
