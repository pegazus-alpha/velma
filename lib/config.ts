/**
 * Configuration du site — § 4.7.
 *
 * Aucune de ces valeurs n'est écrite en dur dans les pages. L'adresse, les
 * horaires et surtout le numéro WhatsApp sont des variables d'environnement
 * et NON des champs du back-office : le périmètre gelé limite celui-ci aux
 * produits. Les changer après la livraison demande une intervention.
 */

function requis(nom: string, valeur: string | undefined): string {
  if (!valeur) {
    const message = `Variable d'environnement manquante : ${nom}. Voir § 4.7 du dossier de projet.`;
    if (process.env.NODE_ENV === "production") throw new Error(message);
    // En développement on ne bloque pas, mais l'absence doit se voir : sinon le
    // lien WhatsApp part cassé et l'adresse s'affiche vide, sans rien signaler.
    console.warn(`[config] ${message}`);
    return "";
  }
  return valeur;
}

export const config = {
  nom: process.env.SITE_NAME ?? "VELMA",
  url: process.env.SITE_URL ?? "http://localhost:3000",

  whatsapp: {
    numero: requis("WHATSAPP_NUMERO", process.env.WHATSAPP_NUMERO),
    /** Gabarit du message pré-rempli — § 1.4-8 et § 4.7. */
    modele:
      process.env.WHATSAPP_MESSAGE_MODELE ??
      "Bonjour, je veux la {produit} (réf. {reference}).",
  },

  boutique: {
    adresse: requis("BOUTIQUE_ADRESSE", process.env.BOUTIQUE_ADRESSE),
    /** ⚠️ « Akwa centre » est un quartier, pas un point où l'on se rend.
     *  Le repère reste à obtenir du client — bloquant pour la mise en ligne. */
    repere: process.env.BOUTIQUE_REPERE ?? "",
    horaires: requis("BOUTIQUE_HORAIRES", process.env.BOUTIQUE_HORAIRES),
  },

  /** ⚠️ Sans chemin explicite, la base atterrit dans le dossier de déploiement
   *  et se fait écraser à chaque mise à jour — le point critique du § 4.6. */
  baseDeDonnees: requis("DATABASE_PATH", process.env.DATABASE_PATH) || "./data.sqlite",
} as const;

/** Lien WhatsApp — un simple `https://wa.me/…`, aucun JavaScript (§ 4.2). */
export function lienWhatsApp(message?: string): string {
  const base = `https://wa.me/${config.whatsapp.numero}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
