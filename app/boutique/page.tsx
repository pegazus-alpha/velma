import type { Metadata } from "next";
import Link from "next/link";
import { Entete } from "@/components/Entete";
import { PiedDePage } from "@/components/PiedDePage";
import { Trace } from "@/components/Trace";
import { lienWhatsApp } from "@/lib/config";
import { listerProduits, imageDe, CATEGORIES, POINTURES, COLORIS_FILTRE, type Filtres } from "@/lib/bdd";

/* Mot-clé du § 4.3 : `baskets et sneakers douala`. */
export const metadata: Metadata = {
  title: "Baskets et sneakers à Douala",
  description:
    "Le catalogue VELMA : baskets et sneakers à Douala, du 38 au 46. Filtre par pointure, catégorie et coloris. On parle prix sur WhatsApp.",
  alternates: { canonical: "/boutique" },
};

/* ⚠️ Pas de pages de catégorie : les filtres passent en paramètres d'URL
   (§ 4.3). Quatre gabarits de plus n'apporteraient rien en référencement — les
   mots-clés de modèle sont portés par les fiches, qui sont plus précises.

   Conséquence heureuse : les filtres sont des LIENS, pas un formulaire piloté
   en JavaScript. Zéro octet envoyé, état partageable, et ça marche sans script. */

type Params = { [k: string]: string | string[] | undefined };

function lire(p: Params, clé: string): string | undefined {
  const v = p[clé];
  return Array.isArray(v) ? v[0] : v;
}

/** Construit l'URL en basculant un filtre : le même lien sert à mettre et à retirer. */
function url(actuels: Filtres, clé: keyof Filtres, valeur: string | number): string {
  const p = new URLSearchParams();
  const suivant: Record<string, string | undefined> = {
    categorie: actuels.categorie,
    pointure: actuels.pointure ? String(actuels.pointure) : undefined,
    coloris: actuels.coloris,
  };
  suivant[clé] = String(suivant[clé]) === String(valeur) ? undefined : String(valeur);
  for (const [k, v] of Object.entries(suivant)) if (v) p.set(k, v);
  const q = p.toString();
  return q ? `/boutique?${q}` : "/boutique";
}

function Puce({
  actif, href, children, accent = false,
}: { actif: boolean; href: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <Link
      href={href}
      aria-pressed={actif}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition duration-150 ${
        actif
          ? accent
            ? "border-accent bg-accent text-white"
            : "border-surClair bg-surClair text-papier"
          : "border-liseret bg-white text-surClair hover:border-surClair"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function Boutique({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const pointureBrute = lire(p, "pointure");
  const filtres: Filtres = {
    categorie: CATEGORIES.find((c) => c === lire(p, "categorie")),
    pointure: pointureBrute && POINTURES.includes(Number(pointureBrute) as never)
      ? Number(pointureBrute) : undefined,
    coloris: COLORIS_FILTRE.find((c) => c === lire(p, "coloris")),
  };

  const produits = listerProduits(filtres);
  const actifs = [filtres.categorie, filtres.pointure, filtres.coloris].filter(Boolean).length;

  return (
    <>
      <Entete actif="/boutique" />

      <main className="mx-auto max-w-[1500px] px-4 pt-12 pb-24 sm:px-7 lg:px-10">
        <header className="max-w-3xl">
          <p className="flex items-center gap-3 text-[11px] tracking-[.22em] text-accent uppercase">
            <span className="block h-px w-10 bg-accent" />
            La boutique
          </p>
          <h1 className="titre mt-5 text-[2.1rem] sm:text-5xl lg:text-[3.4rem]">
            <span className="relative inline-block">
              Baskets et sneakers à Douala
              <Trace auto />
            </span>
          </h1>
          <p className="mt-6 text-[17px] leading-relaxed text-neutre">
            Du 38 au 46, selon les modèles. Choisis ta paire, on parle prix sur WhatsApp.
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ── Filtres ──
              `<details>` natif : le tiroir s'ouvre sans une ligne de JavaScript,
              et reste ouvert par défaut en grand écran. */}
          <aside className="lg:col-span-3">
            <details open className="group rounded-bloc border border-liseret bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold tracking-[.18em] text-surClair uppercase [&::-webkit-details-marker]:hidden">
                Filtrer
                {actifs > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">{actifs}</span>
                )}
              </summary>

              <div className="mt-5 space-y-6">
                <div>
                  <p className="text-[11px] tracking-[.16em] text-neutre uppercase">Catégorie</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <Puce key={c} actif={filtres.categorie === c} href={url(filtres, "categorie", c)}>{c}</Puce>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] tracking-[.16em] text-neutre uppercase">Pointure</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {POINTURES.map((n) => (
                      <Puce key={n} accent actif={filtres.pointure === n} href={url(filtres, "pointure", n)}>{n}</Puce>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] tracking-[.16em] text-neutre uppercase">Coloris</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {COLORIS_FILTRE.map((c) => (
                      <Puce key={c} actif={filtres.coloris === c} href={url(filtres, "coloris", c)}>{c}</Puce>
                    ))}
                  </div>
                </div>

                {actifs > 0 && (
                  <Link href="/boutique" className="lien-sous inline-block text-[13px] font-semibold text-accent">
                    Tout effacer
                  </Link>
                )}
              </div>
            </details>
          </aside>

          {/* ── Grille ── */}
          <div className="lg:col-span-9">
            <p className="text-[13px] text-neutre">
              {produits.length} {produits.length > 1 ? "modèles" : "modèle"}
              {actifs > 0 ? " correspondent à ta recherche" : " en ligne"}
            </p>

            {produits.length === 0 ? (
              /* Le message de résultat vide propose d'écrire plutôt que d'afficher
                 une impasse : le stock tourne de 10 modèles par mois (§ 5.4). */
              <div className="mt-6 rounded-bloc border border-liseret bg-white p-8 text-center">
                <p className="titre text-2xl">Rien dans cette pointure pour l&apos;instant.</p>
                <p className="mt-3 text-[16px] text-neutre">
                  On reçoit du stock chaque mois. Écris-nous ce que tu cherches.
                </p>
                <a
                  href={lienWhatsApp("Bonjour, je cherche une paire que je n'ai pas trouvée sur le site.")}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[13px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
                >
                  Écrire sur WhatsApp <span aria-hidden>→</span>
                </a>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {produits.map((prod) => (
                  <article key={prod.id} className="carte monte overflow-hidden">
                    <Link href={`/boutique/${prod.slug}`} className="block">
                      <div className="cadre relative aspect-square bg-liseret/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageDe(prod)}
                          alt={prod.nom}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        {/* Garde-fou du § 1.4-4 : la mention est un bandeau vu, pas
                            une note en pied de page. */}
                        <p className="absolute inset-x-0 bottom-0 bg-encre/78 px-3 py-1.5 text-[10px] tracking-[.14em] text-surSombre/90 uppercase">
                          Photo d&apos;illustration
                        </p>
                      </div>
                      <span className="filet" aria-hidden />
                      <div className="rounded-b-[5px] bg-white p-3 sm:p-4">
                        <p className="text-[14px] leading-snug font-semibold text-surClair">{prod.nom}</p>
                        <p className="mt-1 text-[12px] text-neutre">
                          Pointures {prod.pointure_min}–{prod.pointure_max}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <PiedDePage />
    </>
  );
}
