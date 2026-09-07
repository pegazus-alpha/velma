import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* `lib/schema.sql` est lu à l'exécution : sans cette ligne il n'est pas
     copié dans un déploiement autonome, et la base ne se crée pas (§ 4.6). */
  outputFileTracingIncludes: { "/**": ["./lib/schema.sql"] },
  /* config options here */
  
};

export default nextConfig;
