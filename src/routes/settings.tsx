import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Palette, Ruler, Bell, KeyRound, ShieldCheck, FileText, LogOut } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — ASCEND" }, { name: "description", content: "App preferences and account settings." }] }),
  component: SettingsPage,
});

const prefs = [
  { icon: Palette, label: "Theme", value: "Light" },
  { icon: Ruler, label: "Units", value: "Metric" },
  { icon: Bell, label: "Notifications", value: "" },
];
const account = [
  { icon: KeyRound, label: "Change Password" },
  { icon: ShieldCheck, label: "Privacy Policy" },
  { icon: FileText, label: "Terms of Service" },
];

function SettingsPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Settings" back="/profile" />

          <div>
            <p className="text-[12.5px] font-semibold text-slate-500 mb-2 px-1">Preferences</p>
            <div className="rounded-[20px] bg-white border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden">
              {prefs.map((item, i) => (
                <div key={item.label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50"><item.icon className="h-4 w-4 text-slate-600" /></div>
                  <p className="flex-1 text-[14.5px] font-medium text-slate-800">{item.label}</p>
                  {item.value && <span className="text-[13px] text-slate-500">{item.value}</span>}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12.5px] font-semibold text-slate-500 mb-2 px-1">Account</p>
            <div className="rounded-[20px] bg-white border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden">
              {account.map((item, i) => (
                <div key={item.label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50"><item.icon className="h-4 w-4 text-slate-600" /></div>
                  <p className="flex-1 text-[14.5px] font-medium text-slate-800">{item.label}</p>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
              <div className="flex items-center gap-3 px-4 py-3.5 border-t border-slate-50">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50"><LogOut className="h-4 w-4 text-rose-500" /></div>
                <p className="flex-1 text-[14.5px] font-semibold text-rose-500">Logout</p>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
