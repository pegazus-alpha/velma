import { config, lienWhatsApp } from "@/lib/config";
import { imageDe, type Produit } from "@/lib/bdd";

/**
 * Les données structurées du site — § 4.3.
 *
 * Regroupées ici plutôt que dispersées dans les pages : c'est ce qu'on relit
 * quand on audite le référencement, et une incohérence entre deux schémas se
 * voit au premier coup d'œil.
 */

const absolue = (chemin: string) => `${config.url}${chemin}`;

/**
 * Le commerce lui-même — c'est ce qui alimente la fiche locale de Google.
 *
 * ⚠️ Pas de `telephone`. Le § 1.4-8 fait de WhatsApp le canal unique, et un
 * numéro appelable rouvrirait la porte que la revue du lot 3 avait fermée.
 */
export function commerce() {
  return {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    name: config.nom,
    url: config.url,
    image: absolue("/logo.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: config.boutique.adresse,
      addressLocality: "Douala",
      addressCountry: "CM",
    },
    /* Le canal de contact du § 1.4-8, tel qu'il est réellement. */
    sameAs: [lienWhatsApp()],
    /* ⚠️ Omis tant que le client n'a pas fourni des horaires exploitables par
       une machine (§ 4.7) : « Tous les jours, 7h – 22h » se lit très bien, mais
       ne se parse pas de façon fiable, et une horaire fausse dans Google est
       pire que pas d'horaire du tout. */
    ...(config.boutique.horairesIso
      ? { openingHours: config.boutique.horairesIso }
      : {}),
  };
}

/**
 * Une fiche produit.
 *
 * ⚠️ **Aucun `offers`, donc aucun résultat enrichi « produit » chez Google** :
 * celui-ci exige un prix, et le § 3.3 l'interdit sur le site. Le schéma reste
 * utile — il dit à Google de quoi parle la page — mais l'étoile et le prix
 * n'apparaîtront pas. C'est le prix assumé de la règle « pas de prix affiché ».
 */
export function produitSchema(p: Produit) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nom,
    url: absolue(`/boutique/${p.slug}`),
    image: absolue(imageDe(p)),
    sku: p.reference,
    category: p.categorie,
    brand: { "@type": "Brand", name: p.marque },
    ...(p.description ? { description: p.description } : {}),
    ...(p.matiere ? { material: p.matiere } : {}),
  };
}

/** Le fil d'ariane, dans l'ordre où il s'affiche sur la page. */
export function filDAriane(etapes: { nom: string; chemin: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: etapes.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.nom,
      item: absolue(e.chemin),
    })),
  };
}
