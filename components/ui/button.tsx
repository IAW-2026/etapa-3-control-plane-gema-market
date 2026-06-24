import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import type { IconName } from "@/types/ui";
import { Icon } from "./icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "accent"
  | "soft"
  | "success";

export type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
};

type ButtonAsButtonProps = ButtonBaseProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type ButtonAsLinkProps = ButtonBaseProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href">;

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "h-[34px] px-3.5 text-[13px] gap-1.5",
  md: "h-[42px] px-[18px] text-sm gap-2",
  lg: "h-[52px] px-6 text-[15px] gap-2.5",
};

const ICON_SIZES: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary: "bg-forest text-paper border border-forest",
  secondary: "bg-paper text-ink border border-line-2",
  ghost: "bg-transparent text-ink border border-transparent",
  danger: "bg-danger text-paper border border-danger",
  accent: "bg-clay text-paper border border-clay",
  soft: "bg-bone text-olive border border-transparent",
  success: "bg-success text-paper border border-success",
};

function buildClassName({
  variant = "primary",
  size = "md",
  full,
  disabled,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  disabled?: boolean;
  className?: string;
}): string {
  const widthCls = full ? "w-full" : "w-auto";
  const stateCls = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer active:scale-[0.98]";
  return `inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] max-w-full min-w-0 whitespace-nowrap transition-[transform,opacity] duration-100 ${SIZE_MAP[size]} ${VARIANT_MAP[variant]} ${widthCls} ${stateCls} ${className}`;
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    full,
    className = "",
    ...rest
  } = props;

  const inner = (
    <>
      {icon && <Icon name={icon} size={ICON_SIZES[size]} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ICON_SIZES[size]} />}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as { href: string } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "href" | "children"
    >;
    return (
      <Link
        href={href}
        className={buildClassName({ variant, size, full, className })}
        {...anchorRest}
      >
        {inner}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonRest } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={type}
      disabled={disabled}
      className={buildClassName({ variant, size, full, disabled, className })}
      {...buttonRest}
    >
      {inner}
    </button>
  );
}
