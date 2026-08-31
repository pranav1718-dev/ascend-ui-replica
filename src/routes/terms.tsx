import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — ASCEND" },
      { name: "description", content: "Review the ASCEND terms and conditions." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4">
          <ScreenHeader title="Terms & Conditions" back="/settings" />

          <div className="mt-5 rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="space-y-4 text-[13.5px] leading-6 text-slate-600">
              <p>
                By using ASCEND, you agree to use the app responsibly and for lawful personal
                productivity tracking.
              </p>
              <p>
                ASCEND is provided as a personal progress and habit-tracking tool. You are
                responsible for the accuracy of the data you enter, including workout, study, and
                habit information.
              </p>
              <p>
                We may update features, content, and settings to improve the product. Continued use
                after changes constitutes acceptance of the updated terms.
              </p>
              <p>
                We strive to keep the service secure and available, but no internet-connected system
                can guarantee uninterrupted availability. Please keep your account credentials secure
                and contact support if you notice unusual account activity.
              </p>
              <p>
                These terms do not override any applicable local law or platform policies for your
                device or account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
