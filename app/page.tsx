import type { Metadata } from "next";
import Link from "next/link";
import { Entete } from "@/components/Entete";
import { PiedDePage } from "@/components/PiedDePage";
import { Cinematique } from "@/components/Cinematique";
import { Trace } from "@/components/Trace";
import { config, lienWhatsApp } from "@/lib/config";
import { MODULES, FAMILLES, ETAPES, MESSAGE_DEMO, type Module } from "@/lib/modules";

/* Mot-clé principal de la page — § 4.3 : `acheter nike original douala`.
   Il s'intègre au titre et à la description, pas en bloc rapporté. */
export const metadata: Metadata = {
  title: "Acheter des Nike originales à Douala",
  description:
    "Baskets et sneakers originales à Douala, du 38 au 46. Choisis ton modèle, ta pointure, ta couleur — on parle prix sur WhatsApp. Boutique à Akwa centre.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `Acheter des Nike originales à Douala — ${config.nom}`,
    description:
      "Le catalogue à jour, du 38 au 46. Tu choisis en ligne, on règle le reste sur WhatsApp.",
    url: "/",
    type: "website",
  },
};

/* ── La garniture : le dispositif qui occupe la phase de lecture ── */
function Garniture({ m }: { m: Module }) {
  if (m.garniture === "regle") {
    return (
      <div className="garniture regle mt-10">
        <div className="relative h-[68px]">
          <span className="axe absolute inset-x-0 bottom-[26px] block h-px origin-left bg-surClair/30" />
          <div className="ticks absolute inset-x-0 bottom-[26px] flex h-8 items-end justify-between" />
          <div className="curseur-regle absolute bottom-[18px] left-0 flex flex-col items-center">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[12px] font-bold text-white tabular-nums">43</span>
            <span className="mt-1 block h-3 w-px bg-accent" />
          </div>
        </div>
        <div className="tailles relative h-5 text-[13px] font-semibold text-neutre tabular-nums" />
        <p className="legende-regle mt-3 text-[12px] tracking-[.16em] text-liseret uppercase">
          <span className="text-neutre">La gamme est marquée sur chaque fiche</span>
        </p>
      </div>
    );
  }
  if (m.garniture === "compteur") {
    return (
      <div className="garniture compteur mt-10 flex items-end gap-7">
        <p className="titre text-[3.4rem] leading-[.8] text-surClair sm:text-[4.6rem]">
          <span className="chiffre tabular-nums">10</span>
        </p>
        <p className="mb-2 text-[12px] leading-relaxed tracking-[.18em] text-neutre uppercase">
          Nouveaux modèles
          <br />
          chaque mois
        </p>
        <div className="barres mb-1 ml-auto flex h-[72px] items-end gap-2" />
      </div>
    );
  }
  if (m.garniture === "familles") {
    return (
      <div className="garniture familles mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FAMILLES.map((f) => (
          <div key={f.nom} className="famille rounded-bloc border border-liseret bg-white p-3.5">
            <svg className="icone h-9 w-9" viewBox="0 0 40 40" aria-hidden focusable="false">
              <path d={f.d} />
            </svg>
            <p className="mt-2.5 text-[14px] font-semibold text-surClair">{f.nom}</p>
            <p className="text-[12px] text-neutre">{f.meta}</p>
          </div>
        ))}
      </div>
    );
  }
  if (m.garniture === "etapes") {
    return (
      <div className="garniture etapes relative mt-10">
        <div className="champ absolute -inset-x-2 -top-3 bottom-0 opacity-70" aria-hidden />
        <svg className="liaison absolute inset-x-0 top-[15px] hidden h-2 sm:block"
             viewBox="0 0 600 8" preserveAspectRatio="none" aria-hidden focusable="false">
          <path d="M40 4 H560" />
        </svg>
        <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-3">
          {ETAPES.map((e) => (
            <li key={e.n} className="etape">
              <span className="pastille-etape inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white tabular-nums">
                {e.n}
              </span>
              <p className="mt-2.5 text-[15px] font-semibold text-surClair">{e.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-neutre">{e.d}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return null;
}

/* ── Un module ── */
function Section({ m, i }: { m: Module; i: number }) {
  const troisCartes = m.bloc?.cartes.length === 3;
  const iVedette = m.bloc ? Math.max(0, m.bloc.cartes.findIndex((c) => c.cine)) : 0;
  /* Un seul titre de rang par module : quand le bloc de lecture porte déjà
     son h2, la légende de scène — qui en est une variante — redevient un
     paragraphe. Sinon un lecteur d'écran liste douze titres quasi jumeaux. */
  const Titre = m.hero ? "h1" : m.bloc ? "p" : "h2";

  const cartes = m.bloc?.cartes.map((c, k) => (
    <article
      key={c.nom}
      className={`carte overflow-hidden ${
        troisCartes && k === iVedette ? "order-first col-span-2 sm:order-none sm:col-span-1" : ""
      }`}
    >
      <span className="halo" aria-hidden />
      <div
        className={`cadre ${c.cine ? "emplacement" : ""} ${
          m.bloc!.cartes.length === 2
            ? "aspect-square sm:aspect-[16/11]"
            : k === iVedette
              ? "aspect-[2/1] sm:aspect-[4/5]"
              : "aspect-[3/2] sm:aspect-[4/5]"
        } relative bg-liseret/40`}
      >
        {c.cine ? (
          <span className="anneau" aria-hidden />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={`/produits/${c.img}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
      <span className="filet" aria-hidden />
      <div className="relative z-3 flex items-start justify-between gap-2 rounded-b-[5px] bg-white p-3 sm:p-4">
        <div>
          <p className="text-[13px] leading-snug font-semibold text-surClair sm:text-[15px]">{c.nom}</p>
          <p className="mt-1 text-[11px] text-neutre sm:text-[13px]">{c.meta}</p>
        </div>
        <span className="num text-[11px] font-semibold text-liseret">0{k + 1}</span>
      </div>
      <span className="fleche absolute right-4 bottom-4 z-3 text-sm text-accent" aria-hidden>→</span>
    </article>
  ));

  return (
    <section className="module relative" data-entree={m.entree} data-seq={m.seq}
             data-titre={m.titre ?? ""} data-cartes={m.cartes ?? ""}
             data-garniture={m.garniture ?? ""} data-pose={m.poseGarniture ?? ""}
             data-hero={m.hero ? "1" : ""} data-mosaique={m.mosaique ? "1" : ""}>
      <div className="epingle relative h-[100svh] overflow-hidden">
        {m.bloc && (
          <div className="editorial absolute inset-0 flex items-center pt-16">
            <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-7 lg:px-16">
              <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                  <p className="oeil flex items-center gap-3 text-[11px] tracking-[.22em] text-accent uppercase">
                    <span className="regle block h-px w-10 origin-left bg-accent" />
                    {m.bloc.oeil}
                  </p>
                  <h2 className="grand-bloc titre mt-4 text-[1.9rem] text-surClair sm:mt-5 sm:text-5xl lg:text-[3.4rem]">
                    {m.bloc.titre.map((t, k) => (
                      <span className="ligne" key={t}>
                        <span className="relative inline-block">
                          {t}
                          {k === m.bloc!.souligne ? <Trace /> : null}
                        </span>
                      </span>
                    ))}
                  </h2>
                  <p className="corps mt-6 max-w-md text-[16px] leading-relaxed text-neutre">{m.bloc.texte}</p>
                  {m.poseGarniture === "gauche" && <Garniture m={m} />}
                  <p className="indice mt-7 flex items-center gap-2 text-[12px] tracking-[.16em] text-liseret uppercase">
                    <span className="text-neutre">Continue de défiler</span>
                    <span className="fleche-bas text-accent" aria-hidden>↓</span>
                  </p>
                </div>
                <div className={`grille grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7 ${
                    m.bloc.cartes.length === 2 ? "" : "sm:grid-cols-3"}`}>
                  {cartes}
                </div>
              </div>
              {m.poseGarniture !== "gauche" && <Garniture m={m} />}
            </div>
          </div>
        )}

        <div className="scene">
          <canvas aria-hidden />
          {/* § 1.6 : sans JavaScript, le canvas resterait vide. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/sequences/${m.seq}/061.webp`} alt="" className="h-full w-full object-cover" />
          </noscript>
          <div className="scrim pointer-events-none absolute inset-0" aria-hidden />

          <div className="legende absolute inset-0 opacity-0">
            <div className={`mx-auto flex h-full max-w-[1500px] flex-col px-6 sm:px-12 ${
                m.hero ? "justify-end pb-20 sm:justify-center sm:pb-0" : "justify-end pb-16"}`}>
              <Titre className="grand titre max-w-4xl text-[2.3rem] text-surSombre sm:text-6xl lg:text-[4.4rem]">
                {m.legende.map((t, k) => (
                  <span className="ligne" key={t}>
                    <span className={k === m.accroche ? "text-accent" : undefined}>{t}</span>
                  </span>
                ))}
              </Titre>

              {m.hero && (
                <>
                  <p className="suite mt-5 max-w-sm text-[16px] leading-relaxed text-surSombre/85">
                    Le catalogue {config.nom}, à jour. La boutique est à {config.boutique.adresse}.
                  </p>
                  <div className="suite mt-7 flex flex-wrap gap-3">
                    <Link href="/boutique"
                      className="rounded-full bg-accent px-7 py-3.5 text-sm font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110">
                      Voir la boutique
                    </Link>
                    <a href={lienWhatsApp()}
                      className="rounded-full border border-surSombre/40 px-7 py-3.5 text-sm font-bold tracking-wider text-surSombre uppercase transition duration-150 hover:bg-surSombre hover:text-surClair">
                      WhatsApp
                    </a>
                  </div>
                </>
              )}

              {m.pointures && (
                <>
                  <div className="suite mt-8 overflow-hidden">
                    <div className="bande-pointures flex gap-8 px-[45vw] whitespace-nowrap sm:gap-14" />
                  </div>
                  <p className="suite mt-3 text-[12px] tracking-[.16em] text-surSombre/45 uppercase">
                    <Link href="/boutique" className="lien-sous text-surSombre/70 hover:text-surSombre">
                      Choisis ta pointure et ouvre le stock
                    </Link>
                  </p>
                </>
              )}

              {m.bandeau && (
                <div className="suite mt-8 overflow-hidden border-y border-accent/40 py-2.5">
                  <div className="bandeau titre flex w-max gap-8 text-lg text-accent sm:text-2xl">
                    <span>Nouveau arrivage chaque mois · Dix modèles de plus ·&nbsp;</span>
                    <span aria-hidden>Nouveau arrivage chaque mois · Dix modèles de plus ·&nbsp;</span>
                  </div>
                </div>
              )}

              {m.cta && (
                <div className="suite mt-7">
                  <Link href="/boutique"
                    className="inline-block rounded-full bg-accent px-7 py-3.5 text-sm font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110">
                    {m.cta}
                  </Link>
                </div>
              )}

              {m.whatsapp && (
                <div className="suite mt-8 w-full max-w-sm rounded-bloc border border-white/15 bg-white/[.08] p-4 backdrop-blur-sm">
                  <p className="text-[11px] tracking-[.18em] text-surSombre/45 uppercase">Ton message, déjà écrit</p>
                  <div className="mt-3 space-y-2 text-[15px] font-semibold text-surSombre">
                    {MESSAGE_DEMO.map((t) => (
                      <p className="msg opacity-0" key={t}><span className="frappe">{t}</span></p>
                    ))}
                  </div>
                  <a href={lienWhatsApp(MESSAGE_DEMO.join("\n"))}
                    className="msg mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold tracking-wider text-white uppercase opacity-0 transition duration-150 hover:brightness-110">
                    Envoyer sur WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="masque pointer-events-none absolute inset-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export default function Accueil() {
  return (
    <>
      <Entete />

      <aside className="fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
             aria-hidden>
        <div className="relative h-52 w-[2px] overflow-hidden bg-liseret">
          <div id="rail" className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-accent" />
        </div>
        <div id="pastilles" className="flex flex-col gap-2.5" />
      </aside>

      <main id="modules">
        {MODULES.map((m, i) => <Section key={m.seq} m={m} i={i} />)}
      </main>

      <Cinematique />
      <PiedDePage />
    </>
  );
}
