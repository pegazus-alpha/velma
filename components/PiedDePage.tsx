import Link from "next/link";
import { config, lienWhatsApp } from "@/lib/config";

/**
 * Pied de page. Composant serveur, aucun JavaScript.
 * ⚠️ La baseline du logo — « Chaussures pour tous vos styles » — n'apparaît
 * nulle part : ni ici, ni en `alt`, ni en métadonnée (décision § 3.5).
 */
export function PiedDePage() {
  return (
    <footer className="border-t border-liseret bg-papier">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 pt-14 pb-10 sm:grid-cols-12 sm:px-7 lg:px-10">
        <div className="sm:col-span-5">
          <p className="titre text-3xl">{config.nom}</p>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-neutre">
            Baskets et sneakers à Douala. Tu choisis en ligne, on règle le reste sur
            WhatsApp.
          </p>
          <a
            href={lienWhatsApp()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
          >
            Écrire sur WhatsApp <span aria-hidden>→</span>
          </a>
        </div>

        <div className="sm:col-span-3">
          <p className="text-[11px] tracking-[.2em] text-neutre uppercase">La boutique</p>
          <p className="mt-4 text-[15px] leading-relaxed text-surClair">
            {config.boutique.adresse}
            {config.boutique.repere ? (
              <>
                <br />
                <span className="text-neutre">{config.boutique.repere}</span>
              </>
            ) : null}
          </p>
          <p className="mt-4 text-[15px] text-surClair">{config.boutique.horaires}</p>
        </div>

        <div className="sm:col-span-4">
          <p className="text-[11px] tracking-[.2em] text-neutre uppercase">Aller plus loin</p>
          <nav aria-label="Pied de page" className="mt-4 grid grid-cols-2 gap-y-2 text-[15px] text-surClair">
            <Link href="/boutique" className="lien-sous w-fit">La boutique</Link>
            <Link href="/a-propos" className="lien-sous w-fit">À propos</Link>
            <Link href="/faq" className="lien-sous w-fit">Questions</Link>
            <Link href="/contact" className="lien-sous w-fit">Contact</Link>
            <Link href="/mentions-legales" className="lien-sous w-fit">Mentions légales</Link>
          </nav>
          <a
            href={lienWhatsApp()}
            className="lien-sous mt-6 inline-block text-[17px] font-semibold text-surClair"
          >
            +{config.whatsapp.numero}
          </a>
        </div>
      </div>

      <div className="border-t border-liseret">
        <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-3 px-4 py-5 text-[12px] text-neutre sm:px-7 lg:px-10">
          <p>© {new Date().getFullYear()} {config.nom} — {config.boutique.adresse}</p>
          <p>Photos d&apos;illustration. Les modèles en stock varient.</p>
        </div>
      </div>
    </footer>
  );
}
