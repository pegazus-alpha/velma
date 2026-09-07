import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Entete } from "@/components/Entete";
import { PiedDePage } from "@/components/PiedDePage";
import { config, lienWhatsApp } from "@/lib/config";
import { produitParSlug, colorisDe, listerProduits, imageDe, POINTURES } from "@/lib/bdd";
import { DonneesStructurees } from "@/components/DonneesStructurees";
import { produitSchema, filDAriane } from "@/lib/schemas";
import { partage } from "@/lib/meta";

type Params = { [k: string]: string | string[] | undefined };
const lire = (p: Params, k: string) => (Array.isArray(p[k]) ? p[k][0] : p[k]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = produitParSlug(slug);
  if (!p) return {};
  /* Mots-clés du § 4.3 : `nike air max douala`, `nike tn douala`,
     `commander basket whatsapp douala`. Portés par le nom du modèle, qui est
     plus précis qu'une page de catégorie. */
  return {
    title: `${p.nom} à Douala`,
    description: `${p.nom} à Douala, pointures ${p.pointure_min} à ${p.pointure_max}. Choisis ta taille et ton coloris, on confirme la disponibilité et le prix sur WhatsApp.`,
    alternates: { canonical: `/boutique/${p.slug}` },
    /* ⚠️ La vignette reste la carte de marque, pas la photo du produit.
       Montrer la chaussure convertirait mieux sur WhatsApp, mais les visuels
       sont encore génériques (§ 3.4) et un aperçu WhatsApp ne porte pas le
       bandeau « photo d'illustration » qu'impose le § 1.4-4. À rouvrir quand
       les vraies photos arriveront. */
    openGraph: partage({
      title: `${p.nom} à Douala`,
      description: `Pointures ${p.pointure_min} à ${p.pointure_max}. Choisis ta taille et ton coloris, on confirme la disponibilité sur WhatsApp.`,
      url: `/boutique/${p.slug}`,
    }),
  };
}

export default async function Fiche({
  params, searchParams,
}: { params: Promise<{ slug: string }>; searchParams: Promise<Params> }) {
  const { slug } = await params;
  const produit = produitParSlug(slug);
  if (!produit) notFound();

  const coloris = colorisDe(produit.id);
  const sp = await searchParams;

  /* La sélection vit dans l'URL, pas dans un état client : le § 4.2 réserve le
     JavaScript à la séquence et aux filtres. Bonus — l'URL est partageable, et
     la page fonctionne sans script. */
  const pointuresDuModele = POINTURES.filter((n) => n >= produit.pointure_min && n <= produit.pointure_max);
  const brute = Number(lire(sp, "pointure"));
  const pointure = pointuresDuModele.includes(brute as never) ? brute : undefined;
  const teinte = coloris.find((c) => c.libelle === lire(sp, "coloris"))?.libelle;

  /* Fonction fléchée et non déclaration : une déclaration est hissée, donc
     TypeScript ne peut pas garantir qu'elle s'exécute après `notFound()` et
     perd le rétrécissement de type sur `produit`. */
  const lien = (clé: "pointure" | "coloris", valeur: string | number) => {
    const q = new URLSearchParams();
    const suivant: Record<string, string | undefined> = {
      pointure: pointure ? String(pointure) : undefined,
      coloris: teinte,
    };
    suivant[clé] = String(suivant[clé]) === String(valeur) ? undefined : String(valeur);
    for (const [k, v] of Object.entries(suivant)) if (v) q.set(k, v);
    const s = q.toString();
    return `/boutique/${produit.slug}${s ? `?${s}` : ""}`;
  };

  /* Le message pré-rempli exigé au § 1.4-8 : référence, pointure et coloris. */
  const lignes = [`Bonjour, je veux la ${produit.nom} (réf. ${produit.reference}).`];
  if (pointure) lignes.push(`Pointure ${pointure}.`);
  if (teinte) lignes.push(`Coloris ${teinte}.`);
  lignes.push(pointure && teinte ? "Elle est disponible ? Et à quel prix ?" : "Tu as quelles pointures et quels coloris ?");
  const message = lignes.join("\n");

  const proches = listerProduits({ categorie: produit.categorie })
    .filter((p) => p.id !== produit.id)
    .slice(0, 4);

  return (
    <>
      <DonneesStructurees donnees={produitSchema(produit)} />
      {/* Le fil d'ariane est aussi à l'écran, juste en dessous : le schéma
          décrit ce que le visiteur voit, il ne l'invente pas. */}
      <DonneesStructurees
        donnees={filDAriane([
          { nom: "Accueil", chemin: "/" },
          { nom: "La boutique", chemin: "/boutique" },
          { nom: produit.nom, chemin: `/boutique/${produit.slug}` },
        ])}
      />
      <Entete actif="/boutique" />

      <nav className="mx-auto max-w-[1500px] px-4 pt-6 text-[13px] text-neutre sm:px-7 lg:px-10" aria-label="Fil d'ariane">
        <Link href="/" className="lien-sous">Accueil</Link>
        <span className="mx-2 text-liseret" aria-hidden>/</span>
        <Link href="/boutique" className="lien-sous">La boutique</Link>
        <span className="mx-2 text-liseret" aria-hidden>/</span>
        <span className="text-surClair">{produit.nom}</span>
      </nav>

      <main className="mx-auto max-w-[1500px] px-4 pt-6 pb-24 sm:px-7 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <figure className="vignette relative aspect-square overflow-hidden rounded-bloc bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDe(produit)} alt={produit.nom} className="h-full w-full object-cover" />
              {/* Garde-fou du § 1.4-4, en bandeau vu. */}
              <figcaption className="absolute inset-x-0 bottom-0 bg-encre/78 px-4 py-2.5 text-[11px] tracking-[.14em] text-surSombre/90 uppercase">
                Photo d&apos;illustration — le modèle exact est confirmé sur WhatsApp
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-5">
            <p className="flex items-center gap-3 text-[11px] tracking-[.22em] text-accent uppercase">
              <span className="block h-px w-10 bg-accent" />
              {produit.categorie}
            </p>
            <h1 className="titre mt-4 text-[2.1rem] sm:text-5xl lg:text-[3.2rem]">
              {produit.nom}
              <span className="block text-neutre">à Douala</span>
            </h1>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-liseret py-4 text-[14px]">
              <dt className="text-neutre">Référence</dt><dd className="font-semibold">{produit.reference}</dd>
              <dt className="text-neutre">Marque</dt><dd className="font-semibold">{produit.marque}</dd>
              {produit.matiere && (<><dt className="text-neutre">Matière</dt><dd className="font-semibold">{produit.matiere}</dd></>)}
              <dt className="text-neutre">Pointures</dt>
              <dd className="font-semibold">{produit.pointure_min} – {produit.pointure_max}</dd>
            </dl>

            <div className="mt-7">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] tracking-[.18em] text-neutre uppercase">Ta pointure</p>
                <p className="text-[13px] text-neutre">{pointure ? `Pointure ${pointure}` : "à choisir"}</p>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7">
                {pointuresDuModele.map((n) => (
                  <Link key={n} href={lien("pointure", n)} scroll={false} aria-pressed={pointure === n}
                    className={`rounded-full border py-2 text-center text-[14px] font-semibold transition duration-150 ${
                      pointure === n ? "border-accent bg-accent text-white" : "border-liseret bg-white hover:border-accent"}`}>
                    {n}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] tracking-[.18em] text-neutre uppercase">Ton coloris</p>
                <p className="text-[13px] text-neutre">{teinte ?? "à choisir"}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {coloris.map((c) => {
                  const epuise = c.stock === 0;
                  /* Les coloris épuisés se disent, ils ne se cachent pas : le stock
                     tourne tous les mois, on doit pouvoir écrire quand même. */
                  return epuise ? (
                    <span key={c.libelle}
                      className="cursor-not-allowed rounded-full border border-liseret bg-white px-3.5 py-2 text-[13px] font-semibold text-neutre line-through opacity-50">
                      {c.libelle}
                    </span>
                  ) : (
                    <Link key={c.libelle} href={lien("coloris", c.libelle)} scroll={false} aria-pressed={teinte === c.libelle}
                      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition duration-150 ${
                        teinte === c.libelle ? "border-surClair bg-surClair text-papier" : "border-liseret bg-white hover:border-surClair"}`}>
                      {c.libelle}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 rounded-bloc border border-liseret bg-white p-4">
              <p className="text-[11px] tracking-[.18em] text-neutre uppercase">Ton message, déjà écrit</p>
              <p className="mt-2.5 text-[15px] leading-relaxed whitespace-pre-line text-surClair">{message}</p>
              <a href={lienWhatsApp(message)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-[13px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110">
                Envoyer sur WhatsApp <span aria-hidden>→</span>
              </a>
              {/* Aucun prix nulle part — § 3.3. */}
              <p className="mt-3 text-center text-[12px] text-neutre">
                On te confirme la disponibilité et le prix dans la conversation.
              </p>
            </div>

            <ul className="mt-7 space-y-3 text-[14px] leading-relaxed text-surClair">
              <li className="flex gap-3"><span className="mt-[3px] text-accent" aria-hidden>—</span>
                <span><strong className="font-semibold">Une boutique à {config.boutique.adresse}.</strong>{" "}
                Tu peux passer voir la paire avant d&apos;acheter.</span></li>
              <li className="flex gap-3"><span className="mt-[3px] text-accent" aria-hidden>—</span>
                <span><strong className="font-semibold">Photo d&apos;illustration.</strong>{" "}
                Le coloris exact t&apos;est envoyé en photo sur WhatsApp avant que tu décides.</span></li>
            </ul>
          </div>
        </div>

        {proches.length > 0 && (
          <section className="monte mt-20 border-t border-liseret pt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="titre text-[1.7rem] sm:text-4xl">Dans la même famille</h2>
              <Link href={`/boutique?categorie=${produit.categorie}`} className="lien-sous shrink-0 text-[14px] font-semibold text-accent">
                Tout voir →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {proches.map((p) => (
                <article key={p.id} className="carte overflow-hidden">
                  <Link href={`/boutique/${p.slug}`} className="block">
                    <div className="cadre aspect-square bg-liseret/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageDe(p)} alt={p.nom} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <span className="filet" aria-hidden />
                    <div className="rounded-b-[5px] bg-white p-3">
                      <p className="text-[14px] leading-snug font-semibold text-surClair">{p.nom}</p>
                      <p className="mt-1 text-[12px] text-neutre">Pointures {p.pointure_min}–{p.pointure_max}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <PiedDePage />
    </>
  );
}
