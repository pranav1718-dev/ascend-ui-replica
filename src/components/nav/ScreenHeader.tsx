import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function ScreenHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between h-11">
      {back ? (
        <Link
          to={back}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-black/[0.04] shadow-sm active:scale-95 transition"
        >
          <ChevronLeft className="h-5 w-5 text-slate-700" />
        </Link>
      ) : (
        <span className="w-10" />
      )}
      <h1 className="text-[17px] font-bold text-slate-900 font-display tracking-tight">{title}</h1>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  );
}
