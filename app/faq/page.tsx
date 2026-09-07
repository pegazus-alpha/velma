import type { Metadata } from "next";
import Link from "next/link";
import { PageContenu, Bloc } from "@/components/PageContenu";
import { ARemplir } from "@/components/ARemplir";
import { lienWhatsApp } from "@/lib/config";

/* Cette page porte à elle seule TROIS des dix mots-clés retenus (§ 4.3) :
   `prix nike douala fcfa`, `basket nike prix douala fcfa`,
   `paiement livraison whatsapp douala`. C'est ce qui justifie qu'elle soit une
   page à part entière et non un bloc noyé dans « À propos » (§ 4.3, écart 1). */
export const metadata: Metadata = {
  title: "Prix des Nike à Douala, livraison et paiement",
  description:
    "Combien coûte une paire de Nike à Douala, comment commander sur WhatsApp, livraison et paiement. Les questions qu'on nous pose le plus.",
  alternates: { canonical: "/faq" },
};

/** Une question. Dépliant natif : accessible, et zéro octet de JavaScript. */
function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-liseret py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-semibold text-surClair marker:content-none">
        {q}
        <span
          aria-hidden
          className="mt-1 shrink-0 text-accent transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-surClair">{children}</div>
    </details>
  );
}

export default function Faq() {
  return (
    <PageContenu
      actif="/faq"
      oeil="Questions fréquentes"
      titre="Les questions qu'on nous pose"
      chapo="Le prix, la commande, la livraison, les pointures. Si tu ne trouves pas, écris-nous."
    >
      <Bloc>
        <div className="-mt-2">
          <Question q="Combien coûte une paire de Nike à Douala ?">
            {/* § 3.5 : « Les réponses doivent venir du client — la rédaction est hors
                périmètre (§ 1.4). Ce qui suit est un gabarit à remplir, pas un texte à
                publier. » Les fourchettes de prix figurent aux assets manquants du § 3.4. */}
            <ARemplir
              quoi="Les fourchettes réelles de prix par catégorie, en FCFA."
              gabarit="Gabarit : « Chez VELMA, compte entre X et Y FCFA selon le modèle. Les Air Force et les Blazer sont en bas de la fourchette. Les Jordan et les Air Max récentes en haut. »"
              motsCles="prix nike douala fcfa · basket nike prix douala fcfa"
            />
            {/* Deux phrases courtes plutôt qu'une longue : § 3.2, 12 mots maximum. */}
            <p>Le prix exact se donne sur WhatsApp. On y règle tout ensemble.</p>
          </Question>

          <Question q="Comment on commande ?">
            <p>
              Tu choisis ta paire sur le site. Tu cliques sur le bouton WhatsApp. La
              conversation s&apos;ouvre déjà remplie avec le modèle, la pointure et la
              couleur. On te répond et on règle le prix et la livraison ensemble.
            </p>
            <p>
              <Link href="/boutique" className="lien-sous font-semibold text-surClair">
                Voir la boutique
              </Link>
            </p>
          </Question>

          <Question q="Tu livres où ? On paie comment ?">
            <ARemplir
              quoi="Les zones desservies, les délais, les frais, et le moment du paiement."
              gabarit="Ce sont des engagements contractuels envers des acheteurs : seul le client peut s'engager dessus (§ 3.5)."
              motsCles="paiement livraison whatsapp douala"
            />
          </Question>

          <Question q="Comment reconnaître une vraie Nike d'une fausse ?">
            <p>
              Le plus simple : passe à la boutique et vérifie la paire avant de payer.
              C&apos;est gratuit.
            </p>
            <p>
              <Link href="/a-propos" className="lien-sous font-semibold text-surClair">
                Ce qu&apos;on vend, et comment le vérifier
              </Link>
            </p>
          </Question>

          <Question q="On peut essayer avant d'acheter ?">
            <ARemplir quoi="Ce que le client accepte : essayage en boutique, conditions, et ce qu'il en est pour une paire livrée." />
          </Question>

          <Question q="Tu as ma pointure ?">
            <p>
              Les pointures disponibles sont indiquées sur chaque fiche. Si ta taille
              n&apos;y est pas, écris-nous quand même : on reçoit du stock chaque mois.
            </p>
          </Question>
        </div>
      </Bloc>

      <Bloc titre="Il te reste une question ?">
        {/* Aucune promesse de délai : « qui répond sur WhatsApp, et en combien de
            temps » reste une question ouverte du § 1.10. */}
        <p>Écris-nous, on te répond.</p>
        <div className="pt-2">
          <a
            href={lienWhatsApp()}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
          >
            Écrire sur WhatsApp <span aria-hidden>→</span>
          </a>
        </div>
      </Bloc>
    </PageContenu>
  );
}
