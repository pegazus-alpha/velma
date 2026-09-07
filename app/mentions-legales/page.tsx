import type { Metadata } from "next";
import { PageContenu, Bloc } from "@/components/PageContenu";
import { ARemplir } from "@/components/ARemplir";

/* 🔴 § 1.4-7 : « Mentions légales : INTÉGRATION des textes fournis par le client
   — non rédigés par nous. » Et § 3.5 : « NON GÉNÉRÉES, ET ELLES NE LE SERONT PAS.
   Une mention légale inventée est fausse, publiée, et engage le client. »

   Cette page est donc une structure d'accueil, pas un texte. Chaque rubrique
   attend son contenu. La rédaction juridique est explicitement hors périmètre. */
export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site VELMA.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function MentionsLegales() {
  return (
    <PageContenu
      oeil="Informations légales"
      titre="Mentions légales"
      souligne={false}
      chapo="Cette page attend les informations légales de l'entreprise. Elle ne peut pas être publiée en l'état."
    >
      <Bloc titre="Éditeur du site">
        <ARemplir quoi="Raison sociale, forme juridique, capital, siège social, RCCM, numéro de contribuable, nom du directeur de la publication." />
      </Bloc>

      <Bloc titre="Hébergement">
        <ARemplir quoi="Nom, raison sociale et coordonnées de l'hébergeur." gabarit="Sera connu à la mise en ligne — voir § 4.6." />
      </Bloc>

      <Bloc titre="Propriété intellectuelle">
        <ARemplir quoi="Le texte que le client — ou son juriste — retient sur les droits attachés au site, aux visuels et aux marques citées." />
      </Bloc>

      <Bloc titre="Données personnelles">
        <ARemplir quoi="Ce qui est collecté, pourquoi, combien de temps, et comment exercer ses droits." gabarit="Le site n'a ni compte client ni panier ; la conversation se fait sur WhatsApp, hors du site. Le périmètre à décrire est donc restreint — mais il n'est pas vide." />
      </Bloc>

      <Bloc titre="Cookies">
        <ARemplir quoi="La liste des cookies réellement déposés et leur finalité." gabarit="À la livraison de ce lot, le site n'en dépose aucun. À revérifier avant la mise en ligne si une mesure d'audience est ajoutée." />
      </Bloc>

      <Bloc titre="Conditions de vente">
        <ARemplir quoi="Prix, commande, paiement, livraison, retours, garanties." gabarit="Aucune vente n'est conclue sur le site : la transaction se fait sur WhatsApp puis en boutique. Le périmètre à décrire reste à arrêter avec le client." />
      </Bloc>
    </PageContenu>
  );
}
