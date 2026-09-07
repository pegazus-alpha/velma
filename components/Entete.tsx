import Image from "next/image";
import Link from "next/link";
import { config, lienWhatsApp } from "@/lib/config";

/**
 * En-tête et menu plein écran.
 *
 * Composant SERVEUR, sans une ligne de JavaScript client : le menu repose sur
 * une case à cocher masquée et sur `:has()`. Le § 4.2 réserve le JS client au
 * pilotage de la séquence et aux filtres du catalogue — un menu n'en fait pas
 * partie, et il continue de fonctionner si un script échoue.
 *
 * ⚠️ La case doit rester le frère AÎNÉ de `header` et de `#menu` : les règles
 * de `globals.css` passent par le sélecteur `~`.
 */

const LIENS = [
  { href: "/boutique", libelle: "La boutique" },
  { href: "/a-propos", libelle: "À propos" },
  { href: "/faq", libelle: "Questions" },
  { href: "/contact", libelle: "Contact" },
];

export function Entete({ actif }: { actif?: string }) {
  return (
    <>
      {/* La case EST le bouton : c'est elle qui reçoit le focus clavier. Elle
          est donc posée sur le burger, et retirée du parcours en grand écran
          où le menu n'existe plus.
          ⚠️ Limite assumée : pas de fermeture par Échap, impossible sans JS. */}
      <input
        type="checkbox"
        id="bascule-menu"
        aria-label="Ouvrir le menu"
        className="fixed top-3 right-4 z-80 h-10 w-10 cursor-pointer opacity-0 sm:right-7 md:hidden lg:right-10"
      />

      <header className="sticky top-0 z-70 border-b border-liseret bg-papier/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
          {/* Le logo réel, pas le mot composé en Anton. ⚠️ La baseline
              « Chaussures pour tous vos styles » est absente du fichier servi :
              elle a été recadrée, conformément à la décision du § 3.5 — elle ne
              doit apparaître nulle part, pas même en `alt`. */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${config.nom}, accueil`}>
            <Image src="/logo-marque.png" alt="" width={990} height={560} priority
                   className="h-7 w-auto sm:h-8" />
            <Image src="/logo-mot.png" alt={config.nom} width={1140} height={210}
                   className="h-4 w-auto sm:h-[18px]" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm text-neutre md:flex">
            {LIENS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  actif === l.href
                    ? "font-semibold text-surClair"
                    : "lien-sous transition duration-150 hover:text-surClair"
                }
              >
                {l.libelle}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={lienWhatsApp()}
              className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-[11px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110 sm:px-5 sm:text-[12px]"
            >
              Nous écrire
            </a>
            <span
              aria-hidden
              className="relative h-10 w-10 rounded-full border border-liseret bg-white md:hidden"
            >
              <span className="barre-burger" style={{ marginTop: "-6px" }} />
              <span className="barre-burger" />
              <span className="barre-burger" style={{ marginTop: "6px" }} />
            </span>
          </div>
        </div>
      </header>

      <div id="menu" className="fixed inset-0 z-65 md:hidden">
        <div className="fond absolute inset-0 bg-papier" />
        <div className="relative flex h-full flex-col px-6 pt-24 pb-10">
          <nav aria-label="Menu" className="flex flex-col gap-1">
            <Link className="lien-menu titre text-[2.1rem] leading-[1.12] text-surClair" href="/">
              Accueil
            </Link>
            {LIENS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`lien-menu titre text-[2.1rem] leading-[1.12] ${
                  actif === l.href ? "text-accent" : "text-surClair"
                }`}
              >
                {l.libelle}
              </Link>
            ))}
          </nav>

          <div className="pied-menu mt-auto border-t border-liseret pt-6 opacity-0 transition-[opacity,transform] duration-500 [transform:translateY(18px)]">
            <p className="text-[11px] tracking-[.2em] text-neutre uppercase">
              {config.boutique.adresse} · {config.boutique.horaires}
            </p>
            <a
              href={lienWhatsApp()}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-[13px] font-bold tracking-wider text-white uppercase"
            >
              Écrire sur WhatsApp <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
