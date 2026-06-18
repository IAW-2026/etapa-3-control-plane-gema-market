import type { CSSProperties } from "react";

type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full" | "r1" | "r2" | "r3";

const ROUNDED_MAP: Record<SkeletonRounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
  r1: "rounded-r1",
  r2: "rounded-r2",
  r3: "rounded-r3",
};

const SHIMMER_BASE =
  "bg-gradient-to-r from-line via-line-2 to-line bg-[length:200%_100%] animate-shimmer";

export type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
  rounded?: SkeletonRounded;
};

export function Skeleton({
  className = "",
  style,
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={`${SHIMMER_BASE} ${ROUNDED_MAP[rounded]} ${className}`}
    />
  );
}

export type SkeletonTextProps = {
  width?: string | number;
  height?: number;
  className?: string;
};

export function SkeletonText({
  width = "100%",
  height = 12,
  className = "",
}: SkeletonTextProps) {
  return (
    <Skeleton rounded="full" className={className} style={{ width, height }} />
  );
}

export type SkeletonRegionProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
};

export function SkeletonRegion({
  label = "Cargando",
  children,
  className = "",
}: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}
