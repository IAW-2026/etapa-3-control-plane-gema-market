import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 Cache Components: habilita `use cache` + `cacheTag` + `cacheLife` e
  // implementa Partial Prerendering (PPR) por defecto. El shell estático se
  // sirve al instante y el contenido cacheado/dinámico streamea por Suspense.
  cacheComponents: true,
};

export default nextConfig;
