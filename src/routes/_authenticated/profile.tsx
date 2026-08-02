import { createFileRoute, Link } from "@tanstack/react-router";
import { User, ChevronRight, UserPen, Bell, Palette, Settings as SettingsIcon, LifeBuoy } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — ASCEND" }, { name: "description", content: "Your profile and stats." }] }),
  component: ProfilePage,
});

const items: { icon: typeof UserPen; label: string; to?: string }[] = [
  { icon: UserPen, label: "Edit Profile" },
  { icon: Bell, label: "Reminders" },
  { icon: Palette, label: "Theme" },
  { icon: SettingsIcon, label: "Settings", to: "/settings" },
  { icon: LifeBuoy, label: "Help & Support" },
];

function ProfilePage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] p-[3px] shadow-lg">
              <div className="h-full w-full rounded-full bg-white grid place-items-center overflow-hidden">
                <User className="h-9 w-9 text-slate-400" />
              </div>
            </div>
            <h2 className="mt-3 text-[20px] font-extrabold text-slate-900 font-display">Pranav Gharge</h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">Keep improving every day.</p>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: "Days Active", value: "48" },
                { label: "Total Workouts", value: "24" },
                { label: "Study Hours", value: "120" },
              ].map((s) => (
                <div key={s.label} className="px-2 text-center">
                  <p className="text-[20px] font-extrabold text-slate-900 font-display tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden">
            {items.map((item, i) => {
              const content = (
                <div className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50">
                    <item.icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <p className="flex-1 text-[14.5px] font-medium text-slate-800">{item.label}</p>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              );
              return item.to ? <Link key={item.label} to={item.to}>{content}</Link> : <div key={item.label}>{content}</div>;
            })}
          </div>
        </div>
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
