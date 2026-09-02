import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  ChevronRight,
  UserPen,
  Bell,
  Palette,
  Settings as SettingsIcon,
  LifeBuoy,
} from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { BottomNav } from "@/components/nav/BottomNav";
import { SheetDialog } from "@/components/common/SheetDialog";
import {
  useAuthEmail,
  useProfile,
  useStudySessions,
  useWorkouts,
} from "@/hooks/use-ascend";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ASCEND" },
      { name: "description", content: "Your profile and stats." },
    ],
  }),
  component: ProfilePage,
});

const items: { icon: typeof UserPen; label: string; to?: string }[] = [
  { icon: Bell, label: "Reminders", to: "/reminders" },
  { icon: Palette, label: "Theme", to: "/theme" },
  { icon: SettingsIcon, label: "Settings", to: "/settings" },
  { icon: LifeBuoy, label: "Help & Support", to: "/help" },
];

function ProfilePage() {
  const { profile, loading, save } = useProfile();
  const email = useAuthEmail();
  const { workouts } = useWorkouts();
  const { sessions } = useStudySessions();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysActive = profile?.created_at
    ? Math.max(
        1,
        Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / 86400000),
      )
    : 0;
  const totalWorkouts = workouts.filter((w) => w.completed).length;
  const studyHours = Math.round(
    sessions.reduce((a, s) => a + (s.duration_min ?? 0), 0) / 60,
  );

  const displayName = profile?.full_name?.trim() || email?.split("@")[0] || "Your profile";

  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] p-[3px] shadow-lg">
              <div className="h-full w-full rounded-full bg-white grid place-items-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${displayName} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-9 w-9 text-slate-400" />
                )}
              </div>
            </div>
            <h2 className="mt-3 text-[20px] font-extrabold text-slate-900 font-display">
              {loading ? "Loading…" : displayName}
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              {profile?.bio?.trim() || email || "Keep improving every day."}
            </p>
            {error && <p className="mt-2 text-[12.5px] text-rose-500">{error}</p>}
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: "Days Active", value: String(daysActive) },
                { label: "Total Workouts", value: String(totalWorkouts) },
                { label: "Study Hours", value: String(studyHours) },
              ].map((s) => (
                <div key={s.label} className="px-2 text-center">
                  <p className="text-[20px] font-extrabold text-slate-900 font-display tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-black/[0.03] shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50">
                <UserPen className="h-4 w-4 text-slate-600" />
              </div>
              <p className="flex-1 text-[14.5px] font-medium text-slate-800">Edit Profile</p>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3.5 border-t border-slate-50"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                <p className="flex-1 text-[14.5px] font-medium text-slate-800">{item.label}</p>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>

        <SheetDialog
          key={profile?.updated_at ?? "profile"}
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Profile"
          submitLabel="Save Changes"
          fields={[
            {
              name: "full_name",
              label: "Full name",
              placeholder: "Your name",
              defaultValue: profile?.full_name ?? "",
            },
            {
              name: "bio",
              label: "Bio",
              required: false,
              placeholder: "Keep improving every day.",
              defaultValue: profile?.bio ?? "",
            },
          ]}
          onSubmit={async (v) => {
            setError(null);
            try {
              await save({
                full_name: v.full_name.trim(),
                bio: v.bio.trim() || null,
              });
            } catch (e) {
              setError((e as Error).message);
              throw e;
            }
          }}
        />
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
