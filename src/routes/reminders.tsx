import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellRing, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { useSettings } from "@/hooks/use-ascend";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — ASCEND" },
      { name: "description", content: "Adjust reminder settings and notification permission." },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { settings, save } = useSettings();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const statusLabel =
    permission === "granted"
      ? "Enabled"
      : permission === "denied"
        ? "Blocked"
        : permission === "unsupported"
          ? "Unavailable"
          : "Not set";

  const handleToggle = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotice("Browser notifications are unavailable on this device.");
      await save({ notifications_enabled: false });
      setPermission("unsupported");
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      if (Notification.permission === "default") {
        const next = await Notification.requestPermission();
        setPermission(next);
        if (next === "granted") {
          await save({ notifications_enabled: true });
          setNotice("Notifications enabled. Your reminder preference is now saved.");
          return;
        }
        await save({ notifications_enabled: false });
        setNotice(
          "Notifications were not granted. You can enable them later in your browser settings.",
        );
        return;
      }

      if (Notification.permission === "denied") {
        await save({ notifications_enabled: false });
        setPermission("denied");
        setNotice(
          "Notifications are blocked in this browser. Turn them on in site settings to enable reminders.",
        );
        return;
      }

      await save({ notifications_enabled: !settings.notifications_enabled });
      setNotice(
        settings.notifications_enabled
          ? "Reminders are now off."
          : "Reminders are now on. Your preference has been saved.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Reminders" back="/settings" />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#1976D2]">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">Reminder notifications</p>
                  <p className="text-[12.5px] text-slate-500">
                    Save your preference and check browser permission.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleToggle()}
                disabled={busy}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  settings.notifications_enabled
                    ? "bg-[#EAF2FF] text-[#0D47A1]"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {settings.notifications_enabled ? "On" : "Off"}
              </button>
            </div>

            <div className="mt-5 rounded-[18px] bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-slate-700">
                {permission === "granted" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                )}
                <p className="text-[13px] font-semibold">Browser status: {statusLabel}</p>
              </div>
              <p className="mt-2 text-[12.5px] leading-5 text-slate-600">
                {permission === "granted"
                  ? "This browser can show notifications when ASCEND sends them."
                  : permission === "denied"
                    ? "Your browser has blocked notifications. Enable them in site settings and turn reminders back on."
                    : permission === "unsupported"
                      ? "This browser does not support the Notification API, so reminder pop-ups are unavailable here."
                      : "Notifications are not requested yet. Turn them on to allow reminder prompts."}
              </p>
            </div>

            {notice && <p className="mt-4 text-[12.5px] text-slate-600">{notice}</p>}

            <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-4 w-4 text-slate-500" />
                <p className="text-[12.5px] leading-5 text-slate-600">
                  Scheduled browser notifications are not guaranteed across every device and
                  browser. The app stores your reminder preference and requests permission when
                  supported, but some environments still block or limit native notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
