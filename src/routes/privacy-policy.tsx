import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ASCEND" },
      { name: "description", content: "Review the ASCEND privacy policy." },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4">
          <ScreenHeader title="Privacy Policy" back="/settings" />

          <div className="mt-5 rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="space-y-4 text-[13.5px] leading-6 text-slate-600">
              <p>
                ASCEND collects only the information needed to operate your account, track your
                progress, and keep your data private and secure.
              </p>
              <p>
                We store your profile details, habits, workouts, study activity, water tracking, and
                app preferences in Supabase using your authenticated user account. These records are
                only used to provide the ASCEND experience for your account.
              </p>
              <p>
                We do not sell personal data. We only use it to personalize your dashboard,
                maintain your progress history, and support secure sign-in and data persistence.
              </p>
              <p>
                You can update your profile, theme, and reminder settings at any time from the
                settings area. If you delete your account in the future, your personal data will be
                removed according to your app and platform policies.
              </p>
              <p>
                This app may use browser storage and notification permissions to remember your
                theme preference and support reminders when your device allows them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
