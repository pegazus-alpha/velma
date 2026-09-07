import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { config } from "@/lib/config";

/**
 * Accès à la base — schéma du § 4.4. Trois tables, rien de plus.
 *
 * SQLite parce que 20 références au lancement, ~140 après un an, et un seul
 * rédacteur (§ 4.2). La sauvegarde consiste à copier un fichier.
 *
 * ⚠️ Impose un disque persistant en écriture : cela exclut tout hébergement
 * sans stockage. `DATABASE_PATH` doit pointer HORS du dossier de déploiement,
 * sinon la base est écrasée à chaque mise à jour (§ 4.6).
 */

let base: Database.Database | null = null;

export function bdd(): Database.Database {
  if (base) return base;
  base = new Database(config.baseDeDonnees);
  base.pragma("journal_mode = WAL");
  base.pragma("foreign_keys = ON");
  creerSchema(base);
  return base;
}

/** Le schéma vit dans `lib/schema.sql` : une seule source, lue ici comme par
 *  le script d'import. Dupliquer le SQL, c'est le laisser diverger. */
function creerSchema(d: Database.Database) {
  d.exec(readFileSync(join(process.cwd(), "lib", "schema.sql"), "utf8"));
}

export type Produit = {
  id: number;
  reference: string;
  slug: string;
  nom: string;
  marque: string;
  categorie: string;
  matiere: string | null;
  pointure_min: number;
  pointure_max: number;
  description: string | null;
  image: string | null;
};

export type ColorisLigne = { libelle: string; stock: number };

/** Les filtres, tels que le § 4.3 les a arrêtés : trois, plus celui du prix. */
export type Filtres = { categorie?: string; pointure?: number; coloris?: string };

/**
 * ⚠️ La pointure est une GAMME, pas une liste (§ 4.4). Le filtre « 43 »
 * interroge `pointure_min <= 43 AND pointure_max >= 43` — c'est ainsi que le
 * métier annonce son stock à Douala, et c'est plus simple qu'une table de
 * stock par taille que personne ne tiendrait à jour.
 */
export function listerProduits(f: Filtres = {}): Produit[] {
  const où: string[] = ["p.actif = 1"];
  const args: (string | number)[] = [];

  if (f.categorie) { où.push("p.categorie = ?"); args.push(f.categorie); }
  if (f.pointure) { où.push("p.pointure_min <= ? AND p.pointure_max >= ?"); args.push(f.pointure, f.pointure); }
  if (f.coloris) {
    où.push("EXISTS (SELECT 1 FROM coloris c WHERE c.produit_id = p.id AND c.libelle LIKE ?)");
    args.push(`%${f.coloris}%`);
  }

  return bdd()
    .prepare(`SELECT p.* FROM produits p WHERE ${où.join(" AND ")} ORDER BY p.reference`)
    .all(...args) as Produit[];
}

export function produitParSlug(slug: string): Produit | undefined {
  return bdd()
    .prepare("SELECT * FROM produits WHERE slug = ? AND actif = 1")
    .get(slug) as Produit | undefined;
}

export function colorisDe(produitId: number): ColorisLigne[] {
  return bdd()
    .prepare("SELECT libelle, stock FROM coloris WHERE produit_id = ? ORDER BY id")
    .all(produitId) as ColorisLigne[];
}

export function tousLesSlugs(): string[] {
  return (bdd().prepare("SELECT slug FROM produits WHERE actif = 1").all() as { slug: string }[])
    .map((r) => r.slug);
}

/** Les quatre familles sont une constante, pas une table (§ 4.4). */
export const CATEGORIES = ["Lifestyle", "Running", "Basket", "Skate"] as const;
export const POINTURES = [38, 39, 40, 41, 42, 43, 44, 45, 46] as const;
export const COLORIS_FILTRE = ["Noir", "Blanc", "Gris", "Rouge", "Bleu", "Vert", "Beige", "Argent"] as const;
