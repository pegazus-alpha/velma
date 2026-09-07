import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

/**
 * `/robots.txt` — § 4.3.
 *
 * ⚠️ Interdire `/admin` ici n'est **pas** une protection : le fichier est
 * public, et il désigne justement le chemin à qui le lit. La protection reste
 * la vérification de session côté serveur (lot 5). On l'exclut uniquement pour
 * qu'un back-office n'apparaisse pas dans les résultats de recherche.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${config.url}/sitemap.xml`,
  };
}
