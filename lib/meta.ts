import type { Metadata } from "next";
import { config } from "@/lib/config";

/**
 * Les champs Open Graph communs à toutes les pages — § 4.3.
 *
 * ⚠️ Next fusionne les métadonnées **à plat** : dès qu'une page déclare son
 * propre `openGraph`, celui du layout racine est écrasé en entier, pas
 * complété. Sans ce point unique, chaque page perdrait silencieusement le nom
 * du site et la locale.
 *
 * `fr_CM` et non `fr_FR` : le site s'adresse à Douala (§ 1.1).
 */
export function partage(o: {
  /** Omis, Next reprend le `title` et la `description` de la page. */
  title?: string;
  description?: string;
  url: string;
}): Metadata["openGraph"] {
  return {
    ...o,
    siteName: config.nom,
    locale: "fr_CM",
    type: "website",
    /* ⚠️ La vignette est produite par `app/opengraph-image.tsx`. Next ne la
       rattache automatiquement qu'aux pages qui ne déclarent PAS leur propre
       `openGraph` : sans cette ligne, toute page personnalisant son partage
       perdait silencieusement son image — vérifié sur `/boutique` et `/faq`. */
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  };
}
