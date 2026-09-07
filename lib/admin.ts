import { bdd, CATEGORIES } from "@/lib/bdd";

/**
 * Opérations du back-office — § 1.4-9 : produits, pointures, coloris, prix et
 * photos, pour que le client saisisse lui-même ses dix nouveautés mensuelles.
 *
 * ⚠️ C'est le SEUL endroit du code où `prix_interne_fcfa` est lu et écrit. La
 * couche publique (`lib/bdd.ts`) ne le sélectionne même pas — § 3.3.
 */

export type ProduitAdmin = {
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
  prix_interne_fcfa: number | null;
  image: string | null;
  actif: number;
  modifie_le: string;
};

export function listerTout(recherche?: string): ProduitAdmin[] {
  const q = recherche?.trim();
  if (!q) {
    return bdd().prepare("SELECT * FROM produits ORDER BY reference").all() as ProduitAdmin[];
  }
  return bdd()
    .prepare("SELECT * FROM produits WHERE nom LIKE ? OR reference LIKE ? ORDER BY reference")
    .all(`%${q}%`, `%${q}%`) as ProduitAdmin[];
}

export function unProduit(id: number): ProduitAdmin | undefined {
  return bdd().prepare("SELECT * FROM produits WHERE id = ?").get(id) as ProduitAdmin | undefined;
}

export function colorisDuProduit(id: number) {
  return bdd()
    .prepare("SELECT id, libelle, stock FROM coloris WHERE produit_id = ? ORDER BY id")
    .all(id) as { id: number; libelle: string; stock: number }[];
}

/** `Nike Air Max Plus TN` → `nike-air-max-plus-tn`. Le slug porte l'URL (§ 4.4). */
export function versSlug(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // accents combinants
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type Saisie = {
  reference: string;
  nom: string;
  marque: string;
  categorie: string;
  matiere: string;
  pointure_min: number;
  pointure_max: number;
  description: string;
  prix_interne_fcfa: number | null;
  image: string;
  actif: boolean;
  coloris: { libelle: string; stock: number }[];
};

/** Les contrôles que le formulaire ne peut pas garantir à lui seul.
 *
 *  ⚠️ Une action serveur est une URL comme une autre : `required`, `min` et le
 *  `<select>` ne tiennent que dans le navigateur. Tout ce qui compte se
 *  revérifie ici. */
export function valider(s: Saisie): string[] {
  const erreurs: string[] = [];
  if (!s.reference.trim()) erreurs.push("La référence est obligatoire.");
  if (!s.nom.trim()) erreurs.push("Le nom est obligatoire.");
  if (!s.marque.trim()) erreurs.push("La marque est obligatoire.");
  if (!(CATEGORIES as readonly string[]).includes(s.categorie))
    erreurs.push(`La catégorie doit être l'une de : ${CATEGORIES.join(", ")}.`);
  if (!Number.isInteger(s.pointure_min) || !Number.isInteger(s.pointure_max))
    erreurs.push("Les pointures doivent être des nombres entiers.");
  else if (s.pointure_min > s.pointure_max)
    erreurs.push("La pointure minimale ne peut pas dépasser la maximale.");
  else if (s.pointure_min < 30 || s.pointure_max > 50)
    erreurs.push("Les pointures doivent rester entre 30 et 50.");
  /* `Number("abc")` vaut NaN, et `NaN < 0` est faux : sans le test de
     finitude, une saisie non numérique passait la validation. */
  if (s.prix_interne_fcfa !== null && !Number.isFinite(s.prix_interne_fcfa))
    erreurs.push("Le prix doit être un nombre.");
  else if (s.prix_interne_fcfa !== null && s.prix_interne_fcfa < 0)
    erreurs.push("Le prix ne peut pas être négatif.");
  /* Un stock négatif échapperait au « épuisé » de la fiche, qui teste `=== 0`. */
  if (s.coloris.some((c) => !Number.isInteger(c.stock) || c.stock < 0))
    erreurs.push("Les stocks doivent être des nombres entiers positifs ou nuls.");
  /* Un chemin relatif se résoudrait contre l'URL de la fiche : image cassée.
     Mieux vaut le refuser à la saisie que le laisser passer inaperçu. */
  const photo = s.image.trim();
  if (photo && !photo.startsWith("/") && !/^https?:\/\//.test(photo))
    erreurs.push("Le chemin de la photo doit commencer par « / » — par exemple /produits/p1.jpg.");
  if (!s.coloris.length) erreurs.push("Au moins un coloris est nécessaire.");
  /* Un nom sans lettre ni chiffre (« ### ») donnerait un slug vide, donc une
     fiche sans adresse. */
  if (s.nom.trim() && !versSlug(s.nom))
    erreurs.push("Le nom doit contenir des lettres ou des chiffres : c'est lui qui fait l'adresse de la fiche.");
  return erreurs;
}

/** ⚠️ `reference` et `slug` sont UNIQUE en base (§ 4.4). Sans ce contrôle, un
 *  doublon fait remonter une violation SQLite brute — le client tomberait sur
 *  une page d'erreur au lieu d'un message qui lui dit quoi corriger. */
export function conflits(id: number | null, s: Saisie): string[] {
  const erreurs: string[] = [];
  /* `id IS NOT ?` : en création `id` vaut NULL, et la condition est vraie pour
     toutes les lignes — c'est ce qu'on veut. Le nom de colonne est un littéral
     du type, jamais une saisie. */
  const pris = (colonne: "reference" | "slug", valeur: string) =>
    bdd().prepare(`SELECT 1 FROM produits WHERE ${colonne} = ? AND id IS NOT ?`).get(valeur, id) !== undefined;

  const reference = s.reference.trim();
  if (reference && pris("reference", reference))
    erreurs.push(`La référence ${reference} est déjà utilisée par un autre produit.`);

  const slug = versSlug(s.nom);
  if (slug && pris("slug", slug))
    erreurs.push(`Un autre produit porte déjà le nom « ${s.nom.trim()} » : les deux fiches auraient la même adresse.`);

  return erreurs;
}

export function enregistrer(id: number | null, s: Saisie): number {
  const d = bdd();
  const maintenant = new Date().toISOString();
  const slug = versSlug(s.nom);

  const tout = d.transaction(() => {
    let idProduit: number;
    if (id) {
      d.prepare(`UPDATE produits SET reference=?, slug=?, nom=?, marque=?, categorie=?,
                 matiere=?, pointure_min=?, pointure_max=?, description=?,
                 prix_interne_fcfa=?, image=?, actif=?, modifie_le=? WHERE id=?`)
        .run(s.reference, slug, s.nom, s.marque, s.categorie, s.matiere || null,
             s.pointure_min, s.pointure_max, s.description || null,
             s.prix_interne_fcfa, s.image || null, s.actif ? 1 : 0, maintenant, id);
      idProduit = id;
    } else {
      const r = d.prepare(`INSERT INTO produits (reference, slug, nom, marque, categorie,
                           matiere, pointure_min, pointure_max, description,
                           prix_interne_fcfa, image, actif, cree_le, modifie_le)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(s.reference, slug, s.nom, s.marque, s.categorie, s.matiere || null,
             s.pointure_min, s.pointure_max, s.description || null,
             s.prix_interne_fcfa, s.image || null, s.actif ? 1 : 0, maintenant, maintenant);
      idProduit = Number(r.lastInsertRowid);
    }
    /* Les coloris sont remplacés en bloc : le formulaire est la source de
       vérité, et `ON DELETE CASCADE` couvre la suppression du produit. */
    d.prepare("DELETE FROM coloris WHERE produit_id = ?").run(idProduit);
    const ins = d.prepare("INSERT INTO coloris (produit_id, libelle, stock) VALUES (?,?,?)");
    for (const c of s.coloris) if (c.libelle.trim()) ins.run(idProduit, c.libelle.trim(), c.stock);
    return idProduit;
  });

  return tout();
}

/** ⚠️ On désactive plutôt que de supprimer : le champ `actif` existe pour ça
 *  (§ 4.4), et une suppression emporterait les coloris en cascade. */
export function basculerActif(id: number) {
  bdd()
    .prepare("UPDATE produits SET actif = 1 - actif, modifie_le = ? WHERE id = ?")
    .run(new Date().toISOString(), id);
}
