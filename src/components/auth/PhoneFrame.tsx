import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen w-full bg-muted flex items-center justify-center md:p-6">
      <div
        className="relative w-full max-w-[420px] min-h-screen md:min-h-0 md:h-[860px] bg-background md:rounded-[2.25rem] md:shadow-2xl overflow-hidden flex flex-col"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
