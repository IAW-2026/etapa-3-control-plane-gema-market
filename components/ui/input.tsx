import type { InputHTMLAttributes } from "react";
import type { IconName } from "@/types/ui";
import { Icon } from "./icon";

export type InputProps = {
  icon?: IconName;
  suffix?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export function Input({ icon, suffix, className = "", ...rest }: InputProps) {
  return (
    <div className="flex items-center gap-2 w-full bg-paper border border-line-2 rounded-r2 px-3.5 h-[46px] transition-[border-color,box-shadow] duration-150 focus-within:border-olive">
      {icon && <Icon name={icon} size={18} className="text-ink-3" />}
      <input
        {...rest}
        className={`flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-ink h-full ${className}`}
      />
      {suffix && <span className="text-[13px] text-ink-3">{suffix}</span>}
    </div>
  );
}
