import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

type CardBaseProps = {
  children: ReactNode;
  padding?: number;
  style?: CSSProperties;
  className?: string;
};

type CardStaticProps = CardBaseProps & {
  hover?: boolean;
  onClick?: undefined;
};

type CardClickableProps = CardBaseProps & {
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

export type CardProps = CardStaticProps | CardClickableProps;

const BASE_CLS =
  "bg-paper border border-line rounded-r3 max-w-full transition-[box-shadow,transform,border-color] duration-200";

export function Card(props: CardProps) {
  const { children, padding = 20, style = {}, className = "" } = props;

  if ("onClick" in props && props.onClick) {
    const hoverCls = "hover:shadow-sh-2 hover:border-line-2 cursor-pointer";
    return (
      <button
        type="button"
        onClick={props.onClick}
        aria-label={props.ariaLabel}
        className={`${BASE_CLS} ${hoverCls} text-left ${className}`}
        style={{ padding, ...style }}
      >
        {children}
      </button>
    );
  }

  const hoverCls = props.hover ? "hover:shadow-sh-2 hover:border-line-2" : "";
  return (
    <div
      className={`${BASE_CLS} ${hoverCls} ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
