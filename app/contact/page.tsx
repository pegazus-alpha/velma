import type { Metadata } from "next";
import { PageContenu, Bloc } from "@/components/PageContenu";
import { ARemplir } from "@/components/ARemplir";
import { config, lienWhatsApp } from "@/lib/config";

/* Mot-clé du § 4.3 : `boutique chaussures akwa douala`. Cette page est faite
   pour faire venir des gens en boutique — c'est précisément pourquoi le point
   de repère manquant est bloquant (§ 4.7). */
export const metadata: Metadata = {
  title: "Boutique de chaussures à Akwa, Douala",
  description:
    "La boutique VELMA est à Akwa centre, Douala. Ouverte tous les jours de 7h à 22h. Écris-nous sur WhatsApp avant de te déplacer.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <PageContenu
      actif="/contact"
      oeil="Contact"
      titre="La boutique de chaussures à Akwa"
      /* L'essayage et le paiement sur place ne sont PAS tranchés — la FAQ les
         marque « à remplir ». Ne rien affirmer ici que le site contredit ailleurs. */
      chapo="Tu peux passer voir les paires avant d'acheter."
    >
      <Bloc titre="Où nous trouver">
        <p className="text-[19px] font-semibold text-surClair">{config.boutique.adresse}</p>
        {config.boutique.repere ? (
          <p>{config.boutique.repere}</p>
        ) : (
          /* ⚠️ § 4.7 : « Akwa centre » est un quartier, pas un point où l'on se rend.
             À Douala on se repère par « en face de », « au carrefour de ». Sans ce
             repère, la page envoie le visiteur dans un quartier entier — alors que
             c'est exactement ce qu'elle est censée éviter. Bloquant pour la mise en
             ligne, pas pour le build. */
          <ARemplir
            quoi="Un point de repère local : « en face de… », « au carrefour de… », « à côté de… »."
            gabarit="Un repère suffit, il n'est pas nécessaire d'avoir une adresse postale formelle. Sans lui, cette page envoie le visiteur dans un quartier entier."
            motsCles="boutique chaussures akwa douala"
          />
        )}
        <p>
          {/* Pas de `toLowerCase()` : ce texte vient du client et peut contenir
              plusieurs phrases ou un nom propre. */}
          <strong className="font-semibold text-surClair">{config.boutique.horaires}</strong>
        </p>
      </Bloc>

      <Bloc titre="Avant de te déplacer">
        <p>
          Écris-nous le modèle et ta pointure. On te dit tout de suite si on l&apos;a en
          stock — ça t&apos;évite le trajet pour rien.
        </p>
        <div className="pt-2">
          <a
            href={lienWhatsApp("Bonjour, je voudrais savoir si vous avez une paire en stock.")}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
          >
            Écrire sur WhatsApp <span aria-hidden>→</span>
          </a>
        </div>
        {/* Pas de lien d'appel : le § 1.3 fait du nombre de conversations WhatsApp
            la seule mesure de succès, et le § 1.8 en fait l'unique chemin de
            conversion. Un bouton d'appel diluerait les deux. */}
        <p className="pt-2 text-[15px] text-neutre">+{config.whatsapp.numero}</p>
      </Bloc>

      <Bloc titre="Livraison et retours">
        <ARemplir
          quoi="Les zones desservies, les délais, les frais, les conditions de retour et qui paie le retour."
          gabarit="Ce sont des engagements contractuels envers des acheteurs : seul le client peut s'engager dessus (§ 3.5). Non rédigés volontairement."
        />
      </Bloc>
    </PageContenu>
  );
}
