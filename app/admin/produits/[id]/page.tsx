import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sessionActive } from "@/lib/session";
import { unProduit, colorisDuProduit, conflits, enregistrer, valider, versSlug, type Saisie } from "@/lib/admin";
import { CATEGORIES } from "@/lib/bdd";

/**
 * Créer ou modifier un produit — `/admin/produits/[id]`, § 4.3.
 * `nouveau` crée, un identifiant numérique modifie.
 *
 * Conçu pour que le client saisisse lui-même ses dix nouveautés mensuelles
 * (§ 1.4-9) : un seul écran, tout y est, aucun JavaScript client.
 */

const CHAMP =
  "mt-2 w-full rounded-bloc border border-liseret bg-white px-4 py-3 text-[15px] outline-none focus:border-accent";
const ETIQUETTE = "text-[12px] tracking-[.16em] text-neutre uppercase";

/** Quatre lignes de coloris : assez pour la plupart des modèles, et une ligne
 *  vide est simplement ignorée à l'enregistrement. */
const LIGNES_COLORIS = 4;

/** Au-delà, l'URL devient hasardeuse selon les serveurs : mieux vaut perdre la
 *  reprise de saisie que la redirection elle-même. */
const REPRISE_MAX = 1500;

/** Relit la saisie renvoyée par une redirection d'erreur.
 *
 *  ⚠️ Le contenu vient de l'URL, donc du visiteur : il n'alimente que des
 *  `defaultValue` (React échappe) et ne touche jamais la base. On refuse
 *  malgré tout une forme inattendue plutôt que de la laisser casser le rendu. */
function lireReprise(code?: string): Saisie | null {
  if (!code) return null;
  try {
    const r = JSON.parse(Buffer.from(code, "base64url").toString());
    return r && typeof r === "object" && Array.isArray(r.coloris) ? (r as Saisie) : null;
  } catch {
    return null;
  }
}

export default async function FormulaireProduit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  if (!(await sessionActive())) redirect("/admin");

  const { id: idBrut } = await params;
  const creation = idBrut === "nouveau";
  const id = creation ? null : Number(idBrut);
  const produit = id ? unProduit(id) : undefined;
  if (!creation && !produit) redirect("/admin/produits");

  const coloris = produit ? colorisDuProduit(produit.id) : [];
  const sp = await searchParams;
  const erreurs = typeof sp.erreurs === "string" ? sp.erreurs.split("|") : [];

  /* Ce qui s'affiche dans les champs : la saisie refusée si on revient d'une
     erreur, sinon le produit en base, sinon les valeurs de départ. */
  const defauts: Saisie = lireReprise(typeof sp.saisie === "string" ? sp.saisie : undefined) ?? {
    reference: produit?.reference ?? "",
    nom: produit?.nom ?? "",
    marque: produit?.marque ?? "Nike",
    categorie: produit?.categorie ?? CATEGORIES[0],
    matiere: produit?.matiere ?? "",
    description: produit?.description ?? "",
    pointure_min: produit?.pointure_min ?? 38,
    pointure_max: produit?.pointure_max ?? 46,
    prix_interne_fcfa: produit?.prix_interne_fcfa ?? null,
    image: produit?.image ?? "",
    actif: produit ? produit.actif === 1 : true,
    coloris: coloris.map((c) => ({ libelle: c.libelle, stock: c.stock })),
  };

  async function sauvegarder(donnees: FormData) {
    "use server";
    if (!(await sessionActive())) redirect("/admin");

    const texte = (c: string) => String(donnees.get(c) ?? "").trim();
    const prixBrut = texte("prix_interne_fcfa");

    const saisie: Saisie = {
      reference: texte("reference"),
      nom: texte("nom"),
      marque: texte("marque"),
      categorie: texte("categorie"),
      matiere: texte("matiere"),
      pointure_min: Number(donnees.get("pointure_min")),
      pointure_max: Number(donnees.get("pointure_max")),
      description: texte("description"),
      prix_interne_fcfa: prixBrut === "" ? null : Number(prixBrut),
      image: texte("image"),
      actif: donnees.get("actif") === "on",
      coloris: Array.from({ length: LIGNES_COLORIS }, (_, i) => ({
        libelle: String(donnees.get(`coloris_${i}`) ?? "").trim(),
        stock: Number(donnees.get(`stock_${i}`) ?? 0) || 0,
      })).filter((c) => c.libelle),
    };

    const problemes = [...valider(saisie), ...conflits(id, saisie)];
    if (problemes.length) {
      const cible = creation ? "nouveau" : String(id);
      const params = new URLSearchParams({ erreurs: problemes.join("|") });
      /* On renvoie la saisie avec l'erreur : sans elle, le client retrouvait un
         formulaire vide et devait tout retaper. */
      const reprise = Buffer.from(JSON.stringify(saisie)).toString("base64url");
      if (reprise.length <= REPRISE_MAX) params.set("saisie", reprise);
      redirect(`/admin/produits/${cible}?${params}`);
    }

    const idFinal = enregistrer(id, saisie);
    /* La boutique est en rendu serveur : sans cela, elle continuerait à servir
       l'ancienne version depuis le cache.
       ⚠️ La fiche vit sous `/boutique/[slug]`, pas sous le nom : passer le nom
       brut invalidait un chemin inexistant, donc rien du tout. */
    revalidatePath("/boutique");
    revalidatePath(`/boutique/${versSlug(saisie.nom)}`);
    /* Le nom a pu changer : l'ancienne adresse doit être purgée elle aussi. */
    if (produit && produit.slug !== versSlug(saisie.nom)) revalidatePath(`/boutique/${produit.slug}`);
    revalidatePath("/admin/produits");
    redirect(`/admin/produits/${idFinal}?enregistre=1`);
  }

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-7">
      <nav className="text-[13px] text-neutre" aria-label="Fil d'ariane">
        <Link href="/admin/produits" className="lien-sous">Les produits</Link>
        <span className="mx-2 text-liseret" aria-hidden>/</span>
        <span className="text-surClair">{creation ? "Nouveau produit" : produit!.nom}</span>
      </nav>

      <h1 className="titre mt-5 text-[2rem] sm:text-4xl">
        {creation ? "Ajouter un produit" : "Modifier le produit"}
      </h1>

      {sp.enregistre && (
        <p role="status" className="mt-6 rounded-bloc border border-liseret bg-white px-4 py-3 text-[14px] text-surClair">
          Enregistré. La boutique est à jour.
        </p>
      )}

      {erreurs.length > 0 && (
        <div role="alert" className="mt-6 rounded-bloc border border-accent bg-accent/[.06] px-4 py-3">
          <p className="text-[13px] font-semibold text-surClair">
            {erreurs.length > 1 ? "Corrige ces points :" : "Corrige ce point :"}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-surClair">
            {erreurs.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <form action={sauvegarder} className="mt-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-[12px] font-bold tracking-[.18em] text-neutre uppercase">Le modèle</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reference" className={ETIQUETTE}>Référence</label>
              <input id="reference" name="reference" required defaultValue={defauts.reference}
                     placeholder="VLM-021" className={CHAMP} />
            </div>
            <div>
              <label htmlFor="nom" className={ETIQUETTE}>Nom du modèle</label>
              <input id="nom" name="nom" required defaultValue={defauts.nom}
                     placeholder="Nike Air Max 90" className={CHAMP} />
              <p className="mt-1.5 text-[12px] text-neutre">
                Le nom donne l&apos;adresse de la fiche, et c&apos;est lui qu&apos;on
                cherche sur Google.
              </p>
            </div>
            <div>
              <label htmlFor="marque" className={ETIQUETTE}>Marque</label>
              <input id="marque" name="marque" required defaultValue={defauts.marque} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="categorie" className={ETIQUETTE}>Catégorie</label>
              <select id="categorie" name="categorie" defaultValue={defauts.categorie} className={CHAMP}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="matiere" className={ETIQUETTE}>Matière</label>
              <input id="matiere" name="matiere" defaultValue={defauts.matiere}
                     placeholder="Mesh et cuir synthétique" className={CHAMP} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className={ETIQUETTE}>Description</label>
              <textarea id="description" name="description" rows={3} defaultValue={defauts.description}
                        className={CHAMP} />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-liseret pt-8">
          <h2 className="text-[12px] font-bold tracking-[.18em] text-neutre uppercase">Les pointures</h2>
          {/* ⚠️ Une GAMME, pas une liste (§ 4.4) : c'est ainsi que le métier
              annonce son stock, et personne ne tiendrait à jour une table
              taille par taille. */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pointure_min" className={ETIQUETTE}>De la pointure</label>
              <input id="pointure_min" name="pointure_min" type="number" min={30} max={50} required
                     defaultValue={defauts.pointure_min} className={CHAMP} />
            </div>
            <div>
              <label htmlFor="pointure_max" className={ETIQUETTE}>À la pointure</label>
              <input id="pointure_max" name="pointure_max" type="number" min={30} max={50} required
                     defaultValue={defauts.pointure_max} className={CHAMP} />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-liseret pt-8">
          <h2 className="text-[12px] font-bold tracking-[.18em] text-neutre uppercase">Les coloris</h2>
          <p className="text-[13px] text-neutre">
            Laisse une ligne vide si tu n&apos;en as pas quatre. Un coloris à zéro
            s&apos;affiche barré sur la fiche, sans disparaître.
          </p>
          <div className="space-y-3">
            {Array.from({ length: LIGNES_COLORIS }, (_, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px] gap-3">
                <div>
                  <label htmlFor={`coloris_${i}`} className="sr-only">Coloris {i + 1}</label>
                  <input id={`coloris_${i}`} name={`coloris_${i}`} defaultValue={defauts.coloris[i]?.libelle ?? ""}
                         placeholder={`Coloris ${i + 1}`} className={CHAMP.replace("mt-2 ", "")} />
                </div>
                <div>
                  <label htmlFor={`stock_${i}`} className="sr-only">Stock du coloris {i + 1}</label>
                  <input id={`stock_${i}`} name={`stock_${i}`} type="number" min={0}
                         defaultValue={defauts.coloris[i]?.stock ?? 0} placeholder="Stock"
                         className={CHAMP.replace("mt-2 ", "")} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-liseret pt-8">
          <h2 className="text-[12px] font-bold tracking-[.18em] text-neutre uppercase">Prix et publication</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prix_interne_fcfa" className={ETIQUETTE}>Prix interne, en FCFA</label>
              <input id="prix_interne_fcfa" name="prix_interne_fcfa" type="number" min={0}
                     defaultValue={defauts.prix_interne_fcfa ?? ""} className={CHAMP} />
              {/* Le § 3.3 : aucun prix affiché sur le site. Le dire ici évite que
                  le client croie le publier en le saisissant. */}
              <p className="mt-1.5 text-[12px] font-semibold text-accent">
                Ce prix ne s&apos;affiche nulle part sur le site. Il est pour toi.
              </p>
            </div>
            <div>
              <label htmlFor="image" className={ETIQUETTE}>Photo</label>
              <input id="image" name="image" defaultValue={defauts.image}
                     placeholder="/produits/p1.jpg" className={CHAMP} />
              <p className="mt-1.5 text-[12px] text-neutre">
                Le chemin commence par « / ». Laisse vide pour l&apos;illustration
                générique. Chaque fiche porte la mention « photo d&apos;illustration ».
              </p>
            </div>
          </div>
          <label className="flex items-center gap-3 pt-2">
            <input type="checkbox" name="actif" defaultChecked={defauts.actif}
                   className="h-5 w-5 accent-[#C8102E]" />
            <span className="text-[15px] text-surClair">Visible dans la boutique</span>
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-4 border-t border-liseret pt-8">
          <button type="submit"
                  className="rounded-full bg-accent px-8 py-3.5 text-[13px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110">
            Enregistrer
          </button>
          <Link href="/admin/produits" className="lien-sous text-[14px] font-semibold text-neutre">
            Annuler
          </Link>
          {!creation && (
            <Link href={`/boutique/${produit!.slug}`} className="lien-sous ml-auto text-[14px] font-semibold text-accent">
              Voir la fiche →
            </Link>
          )}
        </div>
      </form>
    </main>
  );
}
