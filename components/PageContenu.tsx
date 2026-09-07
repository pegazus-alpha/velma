import { Entete } from "@/components/Entete";
import { PiedDePage } from "@/components/PiedDePage";
import { Trace } from "@/components/Trace";

/**
 * Coquille commune aux pages de contenu — à propos, FAQ, contact, mentions.
 *
 * Elle reprend le langage de l'accueil (papier, Anton, œil et règle, trait de
 * crayon) **sans charger de vidéo ni de bibliothèque d'animation** : le
 * § 1.4-2 veut ces pages rapides, ce sont elles qui déclenchent la
 * conversation. Les apparitions passent par la classe `.monte`, en CSS seul.
 */
export function PageContenu({
  oeil,
  titre,
  souligne = true,
  chapo,
  actif,
  children,
}: {
  oeil: string;
  titre: string;
  souligne?: boolean;
  chapo?: string;
  actif?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Entete actif={actif} />

      <main className="mx-auto max-w-[1500px] px-4 pt-14 pb-24 sm:px-7 lg:px-10">
        <header className="max-w-3xl">
          <p className="flex items-center gap-3 text-[11px] tracking-[.22em] text-accent uppercase">
            <span className="block h-px w-10 bg-accent" />
            {oeil}
          </p>
          <h1 className="titre mt-5 text-[2.1rem] sm:text-5xl lg:text-[3.4rem]">
            <span className="relative inline-block">
              {titre}
              {souligne && <Trace auto />}
            </span>
          </h1>
          {chapo && (
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-neutre">{chapo}</p>
          )}
        </header>

        <div className="mt-12">{children}</div>
      </main>

      <PiedDePage />
    </>
  );
}

/** Une section de page de contenu, avec son apparition au défilement. */
export function Bloc({
  titre,
  children,
}: {
  titre?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="monte mt-12 max-w-3xl border-t border-liseret pt-10 first:mt-0 first:border-0 first:pt-0">
      {titre && <h2 className="titre text-[1.6rem] sm:text-3xl">{titre}</h2>}
      <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-neutre">{children}</div>
    </section>
  );
}
