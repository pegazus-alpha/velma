/* Importe les 20 références de `donnees/catalogue-demo.json` dans la base.
   Lancer : npm run importer

   🔴 CES DONNÉES SONT DE DÉMONSTRATION. Le § 3.5 est explicite : elles
   débloquent le build, elles ne peuvent pas être publiées. Le périmètre gelé
   n'autorise des IMAGES génériques qu'à la condition que « prix, pointures,
   coloris et descriptions » soient exacts. Les remplacer par les vraies est un
   préalable de mise en ligne, au même titre que les mentions légales. */

import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

const CHEMIN_BASE = process.env.DATABASE_PATH ?? "./data.sqlite";
const SOURCE = "../donnees/catalogue-demo.json";

/** `Nike Air Max Plus TN` → `nike-air-max-plus-tn`. Le slug porte l'URL et le
 *  mot-clé de la fiche (§ 4.4). */
function versSlug(nom) {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const d = new Database(CHEMIN_BASE);
d.pragma("foreign_keys = ON");
d.exec(readFileSync(new URL("./lib/schema.sql", import.meta.url), "utf8"));

const source = JSON.parse(readFileSync(new URL(SOURCE, import.meta.url), "utf8"));
const maintenant = new Date().toISOString();

const insererProduit = d.prepare(`
  INSERT INTO produits (reference, slug, nom, marque, categorie, matiere,
                        pointure_min, pointure_max, description,
                        prix_interne_fcfa, image, actif, cree_le, modifie_le)
  VALUES (@reference, @slug, @nom, @marque, @categorie, @matiere,
          @pointure_min, @pointure_max, @description,
          @prix_interne_fcfa, @image, 1, @le, @le)
  ON CONFLICT(reference) DO UPDATE SET
    slug=excluded.slug, nom=excluded.nom, marque=excluded.marque,
    categorie=excluded.categorie, matiere=excluded.matiere,
    pointure_min=excluded.pointure_min, pointure_max=excluded.pointure_max,
    prix_interne_fcfa=excluded.prix_interne_fcfa, image=excluded.image,
    modifie_le=excluded.modifie_le
`);
const idParReference = d.prepare("SELECT id FROM produits WHERE reference = ?");
const viderColoris = d.prepare("DELETE FROM coloris WHERE produit_id = ?");
const insererColoris = d.prepare("INSERT INTO coloris (produit_id, libelle, stock) VALUES (?, ?, ?)");

const tout = d.transaction((produits) => {
  for (const p of produits) {
    const [min, max] = String(p.pointures).split("-").map(Number);
    insererProduit.run({
      reference: p.reference,
      slug: versSlug(p.nom),
      nom: p.nom,
      marque: p.marque,
      categorie: p.categorie,
      matiere: p.matiere ?? null,
      pointure_min: min,
      pointure_max: max,
      description: p.description ?? null,
      prix_interne_fcfa: p.prix_interne_fcfa ?? null,
      image: p.image ?? null,
      le: maintenant,
    });
    const { id } = idParReference.get(p.reference);
    viderColoris.run(id);
    /* Le stock du JSON est global au produit ; on le répartit sur les coloris,
       faute de mieux. Les vraies données du client devront le détailler. */
    const parColoris = Math.max(0, Math.floor((p.stock ?? 0) / Math.max(1, p.coloris.length)));
    for (const libelle of p.coloris) insererColoris.run(id, libelle, parColoris);
  }
});

tout(source.produits);

const n = d.prepare("SELECT COUNT(*) n FROM produits").get().n;
const c = d.prepare("SELECT COUNT(*) n FROM coloris").get().n;
console.log("");
console.log("  " + n + " produits et " + c + " coloris importes dans " + CHEMIN_BASE);
console.log("");
console.log("  ATTENTION : donnees de DEMONSTRATION (§ 3.5).");
console.log("  Elles debloquent le build. Elles ne peuvent pas etre publiees.");
console.log("");
