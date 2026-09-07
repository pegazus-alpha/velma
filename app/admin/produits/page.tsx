import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sessionActive, fermerSession } from "@/lib/session";
import { listerTout, basculerActif } from "@/lib/admin";

/**
 * Liste des produits — `/admin/produits`, § 4.3.
 *
 * ⚠️ La vérification de session est ici, **côté serveur**. `noindex` empêche
 * l'indexation, pas l'accès : sans ce contrôle, la liste et les prix internes
 * seraient publics pour qui connaît l'URL.
 */

export default async function ListeProduits({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const email = await sessionActive();
  if (!email) redirect("/admin");

  const sp = await searchParams;
  const recherche = typeof sp.q === "string" ? sp.q : "";
  const produits = listerTout(recherche);
  const enLigne = produits.filter((p) => p.actif).length;

  async function basculer(donnees: FormData) {
    "use server";
    if (!(await sessionActive())) redirect("/admin");
    basculerActif(Number(donnees.get("id")));
    revalidatePath("/admin/produits");
    revalidatePath("/boutique");
  }

  async function deconnecter() {
    "use server";
    await fermerSession();
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-liseret pb-6">
        <div>
          <p className="text-[11px] tracking-[.22em] text-accent uppercase">Administration</p>
          <h1 className="titre mt-3 text-[2rem] sm:text-4xl">Les produits</h1>
          <p className="mt-2 text-[14px] text-neutre">
            {produits.length} référence{produits.length > 1 ? "s" : ""} · {enLigne} en ligne · connecté en tant que {email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produits/nouveau"
            className="rounded-full bg-accent px-6 py-3 text-[12px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
          >
            Ajouter un produit
          </Link>
          <form action={deconnecter}>
            <button className="lien-sous text-[13px] font-semibold text-neutre">Se déconnecter</button>
          </form>
        </div>
      </header>

      <form className="mt-6" role="search">
        <label htmlFor="q" className="sr-only">Chercher un produit</label>
        <input
          id="q" name="q" type="search" defaultValue={recherche}
          placeholder="Chercher par nom ou par référence"
          className="w-full max-w-sm rounded-full border border-liseret bg-white px-5 py-3 text-[15px] outline-none focus:border-accent"
        />
      </form>

      {produits.length === 0 ? (
        <p className="mt-10 text-[16px] text-neutre">Aucun produit ne correspond.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[14px]">
            <caption className="sr-only">Liste des produits, avec leur état de publication</caption>
            <thead>
              <tr className="border-b border-liseret text-left text-[11px] tracking-[.16em] text-neutre uppercase">
                <th scope="col" className="py-3 pr-4 font-semibold">Référence</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Nom</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Catégorie</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Pointures</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Prix interne</th>
                <th scope="col" className="py-3 pr-4 font-semibold">État</th>
                <th scope="col" className="py-3 font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-b border-liseret/60">
                  <td className="py-3 pr-4 font-semibold tabular-nums">{p.reference}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/produits/${p.id}`} className="lien-sous font-semibold text-surClair">
                      {p.nom}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-neutre">{p.categorie}</td>
                  <td className="py-3 pr-4 tabular-nums text-neutre">
                    {p.pointure_min}–{p.pointure_max}
                  </td>
                  {/* Le prix n'existe QUE dans ce back-office (§ 3.3). */}
                  <td className="py-3 pr-4 tabular-nums text-neutre">
                    {p.prix_interne_fcfa ? `${p.prix_interne_fcfa.toLocaleString("fr-FR")} FCFA` : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                      p.actif ? "bg-surClair text-papier" : "bg-liseret text-neutre"}`}>
                      {p.actif ? "En ligne" : "Retiré"}
                    </span>
                  </td>
                  <td className="py-3">
                    <form action={basculer}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="lien-sous text-[13px] font-semibold text-accent">
                        {p.actif ? "Retirer" : "Remettre"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-10 max-w-2xl rounded-bloc border border-dashed border-accent/50 bg-accent/[.04] p-4 text-[13px] leading-relaxed text-surClair">
        <strong className="font-semibold">Retirer plutôt que supprimer.</strong> Un produit
        retiré disparaît de la boutique mais reste ici — le § 4.4 prévoit le champ pour ça,
        et une suppression emporterait ses coloris.
      </p>
    </main>
  );
}
