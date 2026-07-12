import type { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-muted flex items-center justify-center md:p-6">
      <div className="relative w-full max-w-[420px] min-h-screen md:min-h-0 md:h-[860px] bg-background md:rounded-[2.25rem] md:shadow-2xl overflow-hidden flex flex-col">
        <StatusBar />
        <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-foreground text-[13px] font-semibold shrink-0">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
        <BatteryFull className="w-4 h-4" strokeWidth={2.5} />
      </div>
    </div>
  );
}
