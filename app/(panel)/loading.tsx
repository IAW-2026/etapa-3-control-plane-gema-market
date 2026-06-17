import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 lgx:px-7 lgx:py-6">
      <Skeleton rounded="r2" className="h-8 w-48 mb-6" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} rounded="r3" className="h-[200px]" />
        ))}
      </div>
    </div>
  );
}
