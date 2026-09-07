import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { fichesPubliees } from "@/lib/bdd";

/**
 * `/sitemap.xml` — § 4.3.
 *
 * Les sept écrans publics, plus une entrée par fiche **en ligne**. Le
 * back-office n'y figure pas : il est exclu dans `robots.ts`.
 *
 * ⚠️ Le plan est construit à la demande, pas au build : un produit ajouté par
 * le back-office doit y apparaître sans redéploiement.
 */
export const dynamic = "force-dynamic";

/** Les écrans fixes, dans l'ordre où ils comptent pour le référencement. */
const PAGES: { chemin: string; priorite: number; frequence: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { chemin: "/", priorite: 1, frequence: "weekly" },
  { chemin: "/boutique", priorite: 0.9, frequence: "daily" },
  { chemin: "/faq", priorite: 0.7, frequence: "monthly" },
  { chemin: "/contact", priorite: 0.7, frequence: "monthly" },
  { chemin: "/a-propos", priorite: 0.5, frequence: "yearly" },
  { chemin: "/mentions-legales", priorite: 0.2, frequence: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();

  const fixes = PAGES.map((p) => ({
    url: `${config.url}${p.chemin}`,
    lastModified: maintenant,
    changeFrequency: p.frequence,
    priority: p.priorite,
  }));

  /* Le catalogue change au rythme des dix nouveautés mensuelles (§ 1.4-9) :
     `modifie_le` est la date qu'écrit le back-office à l'enregistrement. */
  const fiches = fichesPubliees().map((f) => ({
    url: `${config.url}/boutique/${f.slug}`,
    lastModified: new Date(f.modifie_le),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...fixes, ...fiches];
}
