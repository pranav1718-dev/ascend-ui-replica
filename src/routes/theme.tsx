import { createFileRoute } from "@tanstack/react-router";
import { Check, MoonStar, Palette, SunMedium, MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { ScreenHeader } from "@/components/nav/ScreenHeader";
import { useSettings } from "@/hooks/use-ascend";

export const Route = createFileRoute("/theme")({
  head: () => ({
    meta: [
      { title: "Theme — ASCEND" },
      { name: "description", content: "Choose your preferred app theme." },
    ],
  }),
  component: ThemePage,
});

type ThemeOption = "light" | "dark" | "system";

const options: { value: ThemeOption; label: string; icon: typeof SunMedium; description: string }[] = [
  { value: "light", label: "Light", icon: SunMedium, description: "Bright and crisp" },
  { value: "dark", label: "Dark", icon: MoonStar, description: "Low-light friendly" },
  { value: "system", label: "System", icon: MonitorSmartphone, description: "Match your device" },
];

function ThemePage() {
  const { settings, save } = useSettings();
  const [selected, setSelected] = useState<ThemeOption>(settings.theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = selected === "dark" || (selected === "system" && media.matches);
    root.classList.toggle("dark", isDark);
    root.dataset.theme = selected;
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [selected]);

  const handleSelect = async (value: ThemeOption) => {
    setSelected(value);
    setSaving(true);
    try {
      await save({ theme: value });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Theme" back="/settings" />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF2FF] text-[#1976D2]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">Appearance</p>
                <p className="text-[12.5px] text-slate-500">Choose the look that fits your day.</p>
              </div>
            </div>

            <div className="space-y-3">
              {options.map(({ value, label, icon: Icon, description }) => {
                const active = selected === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void handleSelect(value)}
                    disabled={saving}
                    className={`flex w-full items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition ${
                      active
                        ? "border-[#0D47A1] bg-[#EAF2FF]"
                        : "border-slate-200 bg-slate-50/70 hover:bg-slate-100"
                    }`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-slate-800">{label}</p>
                      <p className="text-[12.5px] text-slate-500">{description}</p>
                    </div>
                    {active && <Check className="h-5 w-5 text-[#0D47A1]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
