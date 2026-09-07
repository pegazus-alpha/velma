import type { Metadata } from "next";
import Link from "next/link";
import { PageContenu, Bloc } from "@/components/PageContenu";
import { ARemplir } from "@/components/ARemplir";
import { config, lienWhatsApp } from "@/lib/config";

/* Mot-clé du § 4.3 pour cette page : `comment reconnaitre une vraie nike d'une fausse`.
   Le § 2.5 le note comme un créneau libre localement — aucune version camerounaise
   n'existe. C'est le contenu au meilleur potentiel du site. */
export const metadata: Metadata = {
  title: "Comment reconnaître une vraie Nike d'une fausse",
  description:
    "Ce qu'on vend à Douala, et comment vérifier une paire avant d'acheter. La boutique est à Akwa, tu peux passer voir.",
  alternates: { canonical: "/a-propos" },
};

export default function APropos() {
  return (
    <PageContenu
      actif="/a-propos"
      oeil="À propos"
      titre="Ce qu'on vend, et comment le vérifier"
      chapo="On vend des sneakers à Douala. La boutique est à Akwa, tu peux venir voir."
    >
      <Bloc titre="La boutique">
        <p>
          Ce site sert à une chose : te montrer ce qu&apos;on a vraiment en stock, dans ta
          pointure, avant que tu écrives. Pas de fil à faire défiler pendant dix minutes.
          Tu choisis, tu nous écris, on te répond.
        </p>
        <p>
          {config.boutique.adresse}. {config.boutique.horaires}.
        </p>
      </Bloc>

      <Bloc titre="Comment reconnaître une vraie Nike d'une fausse">
        {/* ⚠️ § 3.5 : « Ce paragraphe est le plus sensible du site. Il touche à la
            question de la contrefaçon (§ 1.8, risque n°1). Il DOIT être réécrit par le
            client, en fonction de ce qu'il peut réellement affirmer et prouver. Ne rien
            publier ici sans son accord explicite. » Rien n'est donc rédigé ici. */}
        <ARemplir
          quoi="Les points de vérification que le client assume de publier : étiquette et code de production, régularité des coutures, qualité de la colle, poids et semelle."
          gabarit="Seul le client peut dire ce qu'il affirme et ce qu'il peut prouver. Le § 2.5 identifie ce contenu comme le créneau le plus libre du marché local — et le § 1.8 en fait le plus sensible du site."
          motsCles="comment reconnaitre une vraie nike d'une fausse"
        />
        {/* Repris mot pour mot de `textes-demo.md`. Rien d'ajouté : le § 3.5 couvre
            ce paragraphe d'un avertissement — « ne rien publier ici sans l'accord
            explicite du client ». */}
        <p>
          <strong className="font-semibold text-surClair">
            Tu peux passer à la boutique et vérifier avant d&apos;acheter.
          </strong>{" "}
          C&apos;est le plus simple, et c&apos;est gratuit.
        </p>
      </Bloc>

      <Bloc titre="Sur l'authenticité">
        <ARemplir
          quoi="Ce que le client affirme sur l'origine de ses paires, et ce qu'il peut justifier par écrit."
          gabarit="Le § 1.8 conditionne la diffusion à un justificatif d'approvisionnement écrit. Tant qu'il n'est pas fourni, aucune affirmation d'authenticité ne doit être publiée ici."
        />
      </Bloc>

      <Bloc titre="Nouveautés">
        <p>
          On rentre de nouveaux modèles chaque mois. Repasse voir, ou écris-nous ce que tu
          cherches.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/boutique"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
          >
            Voir la boutique
          </Link>
          <a
            href={lienWhatsApp()}
            className="rounded-full border border-liseret px-7 py-3.5 text-sm font-bold tracking-wider text-surClair uppercase transition duration-150 hover:border-accent hover:text-accent"
          >
            Nous écrire
          </a>
        </div>
      </Bloc>
    </PageContenu>
  );
}
