import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { CategoriesManager } from "@/components/panels/categories-manager";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriasPage() {
  return (
    <>
      <PageHeader subtitle="ABM · Seller" title="Categorías" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<ManagerSkeleton />}>
          <Loader />
        </Suspense>
      </div>
    </>
  );
}

async function Loader() {
  const res = await settle(cached.categorias());
  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState title="Seller App no disponible" body={res.error} />
      </Card>
    );
  }
  return <CategoriesManager categories={res.data} />;
}

function ManagerSkeleton() {
  return (
    <>
      <Skeleton rounded="r3" className="h-[86px] mb-4" />
      <Card padding={0}>
        <div className="p-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} rounded="r2" className="h-10" />
          ))}
        </div>
      </Card>
    </>
  );
}
