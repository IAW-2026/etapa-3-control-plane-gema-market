import type { MouseEventHandler, ReactNode } from "react";
import type { IconName, PillTone } from "@/types/ui";
import { Icon } from "./icon";

export type PillSize = "sm" | "md" | "lg";

type PillBaseProps = {
  children: ReactNode;
  tone?: PillTone;
  size?: PillSize;
  icon?: IconName;
  active?: boolean;
};

export type PillProps = PillBaseProps & {
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const TONE_MAP: Record<PillTone, string> = {
  neutral: "bg-bone text-olive",
  sand: "bg-[#ede4cc] text-cocoa",
  sage: "bg-[#dde2c9] text-forest",
  forest: "bg-forest text-paper",
  success: "bg-[#d8e3c8] text-success",
  warn: "bg-[#f3e4c4] text-warn",
  danger: "bg-[#f0d9d1] text-danger",
  outline: "bg-transparent text-ink-2 border border-line-2",
};

const SIZE_MAP: Record<PillSize, string> = {
  sm: "px-[9px] py-[3px] text-[11px] gap-1",
  md: "px-3 py-[5px] text-xs gap-1.5",
  lg: "px-3.5 py-[7px] text-[13px] gap-1.5",
};

const ICON_SIZE: Record<PillSize, number> = { sm: 13, md: 14, lg: 15 };

export function Pill({
  children,
  tone = "neutral",
  size = "md",
  icon,
  onClick,
  active,
}: PillProps) {
  const toneCls = active ? "bg-forest text-paper" : TONE_MAP[tone];
  const className = `inline-flex items-center font-medium rounded-full whitespace-nowrap tracking-[-0.005em] ${SIZE_MAP[size]} ${toneCls}`;
  const content = (
    <>
      {icon && <Icon name={icon} size={ICON_SIZE[size]} />}
      {children}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${className} cursor-pointer`}
      >
        {content}
      </button>
    );
  }
  return <span className={className}>{content}</span>;
}
