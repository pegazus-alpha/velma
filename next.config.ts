import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* `lib/schema.sql` est lu à l'exécution : sans cette ligne il n'est pas
     copié dans un déploiement autonome, et la base ne se crée pas (§ 4.6). */
  outputFileTracingIncludes: {
    "/**": ["./lib/schema.sql"],
    /* La vignette de partage lit les logos sur le disque, pas via une URL :
       sans cette ligne, `opengraph-image` échoue en déploiement autonome. */
    "/opengraph-image": ["./public/logo-marque.png", "./public/logo-mot.png"],
  },
};

export default nextConfig;
