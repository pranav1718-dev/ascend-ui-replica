import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  id?: string;
}

export function Checkbox({ checked, onChange, children, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-[18px] h-[18px] rounded-md border flex items-center justify-center transition shrink-0",
          checked
            ? "bg-[var(--brand-blue)] border-[var(--brand-blue)]"
            : "bg-background border-border",
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>
      <span className="text-[13px] text-muted-foreground">{children}</span>
    </label>
  );
}
