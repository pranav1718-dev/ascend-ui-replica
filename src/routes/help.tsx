import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Mail, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "@/components/auth/PhoneFrame";
import { ScreenHeader } from "@/components/nav/ScreenHeader";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — ASCEND" },
      { name: "description", content: "Get help and contact support in ASCEND." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-[#F7F8FC] pb-28">
        <div className="px-6 pt-4 space-y-5">
          <ScreenHeader title="Help & Support" back="/settings" />

          <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_30px_rgba(13,71,161,0.06)] border border-black/[0.03]">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#1976D2]">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-900">How can we help?</p>
                <p className="text-[12.5px] text-slate-500">Find the support option that fits your issue.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href="mailto:support@ascend.app?subject=ASCEND%20Support%20Request"
                className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 text-left"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1976D2]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">Email support</p>
                  <p className="text-[12.5px] text-slate-500">support@ascend.app</p>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1976D2]">
                  <MessageCircleQuestion className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">Common issues</p>
                  <p className="text-[12.5px] text-slate-500">Check your connection, refresh the app, and confirm your browser allows notifications.</p>
                </div>
              </div>

              <Link
                to="/settings"
                className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 text-left"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1976D2]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">Open settings</p>
                  <p className="text-[12.5px] text-slate-500">Review privacy, theme and reminder controls.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
