import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { SearchBar } from "@/components/shell/search-bar";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { UserActions } from "@/components/panels/user-actions";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import type { ConsolidatedUser } from "@/lib/services/users";
import { DEFAULT_PAGE_SIZE } from "@/types/domain";

export const metadata: Metadata = { title: "Usuarios" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default function UsuariosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader subtitle="Consolidado · Clerk + apps" title="Usuarios" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<div className="mb-4 h-[46px]" />}>
          <Filters searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return (
    <SearchBar
      initialQuery={p.q ?? ""}
      placeholder="Buscar por email o nombre…"
      ariaLabel="Buscar usuarios"
    />
  );
}

async function UsersTable({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(
    cached.consolidatedUsers({ query: p.q, page, pageSize }),
  );

  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState title="No se pudo cargar usuarios" body={res.error} />
      </Card>
    );
  }

  const { items, total, degraded } = res.data;

  return (
    <>
      {degraded.length > 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-r2 bg-warn/10 text-warn text-[13px] flex items-center gap-2">
          Vista parcial: {degraded.join(", ")} no respondió. El estado por esas apps
          puede faltar.
        </div>
      )}
      <Card padding={0}>
        <div className="overflow-x-auto hidden lgx:block">
          <table className="w-full border-collapse text-[13px] min-w-[760px]">
            <thead className="bg-cream">
              <tr className="text-left text-ink-3 font-mono text-[11px] uppercase tracking-[0.06em]">
                <th className="py-2.5 px-5">Usuario</th>
                <th className="py-2.5 px-3 w-40">Apps</th>
                <th className="py-2.5 px-3 w-28">Rol</th>
                <th className="py-2.5 px-3 w-28">Estado</th>
                <th className="py-2.5 px-5 min-w-72 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-line">
                  <td className="py-3.5 px-5">
                    <div className="font-medium truncate">{u.full_name}</div>
                    <div className="text-[11px] text-ink-3 truncate">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <AppPills user={u} />
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-[12px] text-ink-2">{u.role ?? "—"}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <StatePills user={u} />
                  </td>
                  <td className="py-3.5 px-5">
                    <UserActions user={u} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState icon="user" title="Sin usuarios" body="No hay usuarios para esta búsqueda." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lgx:hidden">
          {items.map((u) => (
            <div key={u.id} className="bg-paper border border-line rounded-2xl p-3">
              <div className="flex justify-between gap-2.5 items-start mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{u.full_name}</div>
                  <div className="text-[11px] text-ink-3 truncate">{u.email}</div>
                </div>
                <StatePills user={u} />
              </div>
              <div className="mb-3">
                <AppPills user={u} />
              </div>
              <UserActions user={u} />
            </div>
          ))}
          {items.length === 0 && (
            <EmptyState icon="user" title="Sin usuarios" body="No hay usuarios para esta búsqueda." />
          )}
        </div>

        <Pager page={page} pageSize={pageSize} total={total} basePath="/usuarios" />
      </Card>
    </>
  );
}

function AppPills({ user }: { user: ConsolidatedUser }) {
  const apps: string[] = [];
  if (user.seller) apps.push("Seller");
  if (user.buyer) apps.push("Buyer");
  if (user.shipping) apps.push("Shipping");
  if (user.payments) apps.push("Payments");
  if (apps.length === 0) return <span className="text-ink-3">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {apps.map((a) => (
        <Pill key={a} tone="sage" size="sm">{a}</Pill>
      ))}
    </div>
  );
}

function StatePills({ user }: { user: ConsolidatedUser }) {
  if (user.banned) return <Pill tone="danger" size="sm">Inactivo</Pill>;
  if (user.seller?.suspended) return <Pill tone="warn" size="sm">Suspendido</Pill>;
  if (user.shipping?.banned) return <Pill tone="warn" size="sm">Courier baneado</Pill>;
  return <Pill tone="success" size="sm">Activo</Pill>;
}

function TableSkeleton() {
  return (
    <Card padding={0}>
      <div className="p-4 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} rounded="r2" className="h-12" />
        ))}
      </div>
    </Card>
  );
}
