/**
 * Les 8 modules de l'accueil — § 5.7 et § 5.14.
 *
 * Données seulement : le balisage est rendu côté serveur par `app/page.tsx`,
 * l'animation est attachée dessus par `components/Cinematique.tsx`.
 *
 * Les textes viennent de la phase 2 (accroche A2) et des maquettes gelées en
 * phase 5. Aucun n'est inventé ici.
 */

export const IMAGES_PAR_PLAN = 121;

/** Comment le papier s'écarte pour montrer le plan. Un mécanisme par module. */
export type Entree = "rideau" | "carte" | "ecart" | "souleve" | "lamelles" | "balayage" | "fondu";
/** Comment le titre du bloc de lecture se révèle. */
export type Titre = "mots" | "lignes" | "bascule" | "bande" | "eclat";
/** Comment les vignettes entrent. */
export type Cartes = "cascade" | "lateral" | "bascule" | "noyau" | "volet";
/** Le dispositif qui occupe la phase de lecture. */
export type Garniture = "regle" | "compteur" | "familles" | "etapes";

export type Carte = { img: string; nom: string; meta: string; cine?: boolean };

export type Module = {
  seq: string;
  entree: Entree;
  hero?: boolean;
  mosaique?: boolean;
  pointures?: boolean;
  bandeau?: boolean;
  whatsapp?: boolean;
  cta?: string;
  legende: string[];
  /** Index de la ligne mise en accent, quand il y en a une. */
  accroche?: number;
  titre?: Titre;
  cartes?: Cartes;
  garniture?: Garniture;
  poseGarniture?: "bas" | "gauche";
  bloc?: {
    oeil: string;
    titre: string[];
    /** Index de la ligne soulignée au crayon. */
    souligne: number;
    texte: string;
    cartes: Carte[];
  };
};

export const MODULES: Module[] = [
  {
    seq: "section-01",
    entree: "rideau",
    hero: true,
    legende: ["Choisis ton modèle,", "ta pointure, ta couleur.", "On parle prix juste après."],
    accroche: 2,
  },
  {
    seq: "section-02",
    entree: "carte",
    titre: "mots",
    cartes: "cascade",
    poseGarniture: "bas",
    bloc: {
      oeil: "Les classiques",
      titre: ["Les modèles", "qu'on te demande."],
      souligne: 1,
      texte:
        "Air Force, Air Max, Jordan. Ceux qu'on nous réclame toute l'année, et qu'on garde en stock.",
      cartes: [
        { img: "p1", nom: "Air Force 1", meta: "Pointures 38–46" },
        { img: "p2", nom: "Air Max Plus TN", meta: "Pointures 39–45", cine: true },
        { img: "p3", nom: "Jordan 1 Mid", meta: "Pointures 40–46" },
      ],
    },
    legende: ["Air Force. Air Max.", "Jordan."],
  },
  {
    seq: "section-03",
    entree: "ecart",
    garniture: "regle",
    titre: "lignes",
    cartes: "lateral",
    poseGarniture: "bas",
    pointures: true,
    bloc: {
      oeil: "La pointure",
      titre: ["Ta pointure", "est là."],
      souligne: 0,
      texte: "Du 38 au 46, selon les modèles. Clique ta taille, on t'ouvre le stock filtré.",
      cartes: [
        { img: "p3", nom: "Ta taille d'abord", meta: "Filtre par pointure" },
        { img: "p4", nom: "Puis la couleur", meta: "Filtre par coloris" },
      ],
    },
    legende: ["Ta pointure est là.", "Ne cherche plus."],
  },
  {
    seq: "section-04",
    entree: "souleve",
    garniture: "compteur",
    titre: "bascule",
    cartes: "bascule",
    poseGarniture: "gauche",
    bandeau: true,
    bloc: {
      oeil: "Le stock",
      titre: ["Dix nouveaux", "modèles par mois."],
      souligne: 0,
      texte: "Le stock tourne. Ce que tu vois aujourd'hui ne sera plus là dans six semaines.",
      cartes: [
        { img: "p4", nom: "Arrivage du mois", meta: "10 références" },
        { img: "p1", nom: "Le mois dernier", meta: "Presque parti" },
        { img: "p2", nom: "À venir", meta: "Écris-nous" },
      ],
    },
    legende: ["Dix nouveaux modèles", "chaque mois."],
  },
  {
    seq: "section-05",
    entree: "lamelles",
    garniture: "familles",
    titre: "bande",
    cartes: "noyau",
    poseGarniture: "bas",
    bloc: {
      oeil: "Les usages",
      titre: ["Pour la ville.", "Pour courir."],
      souligne: 1,
      texte: "Lifestyle, running, basket, skate. Quatre familles, un seul filtre.",
      cartes: [
        { img: "p2", nom: "Lifestyle", meta: "Le plus demandé" },
        { img: "p3", nom: "Running", meta: "Route et piste" },
      ],
    },
    legende: ["Pour la ville.", "Pour courir."],
  },
  {
    seq: "section-06",
    entree: "fondu",
    mosaique: true,
    legende: ["Tu regardes d'abord.", "Tu te déplaces après."],
  },
  {
    seq: "section-07",
    entree: "balayage",
    garniture: "etapes",
    titre: "eclat",
    cartes: "volet",
    poseGarniture: "bas",
    cta: "Ouvrir le catalogue",
    bloc: {
      oeil: "Le confort",
      titre: ["Tu choisis ici,", "tranquillement."],
      souligne: 0,
      texte: "Pas de fil à faire défiler pendant dix minutes. Le stock, filtré, en une page.",
      cartes: [
        { img: "p1", nom: "Le catalogue", meta: "20 modèles en ligne" },
        { img: "p4", nom: "La boutique", meta: "Akwa centre" },
      ],
    },
    legende: ["Tu choisis ici,", "tranquillement."],
  },
  {
    seq: "section-08",
    entree: "fondu",
    whatsapp: true,
    legende: ["Le reste se règle", "sur WhatsApp."],
  },
];

/** Les quatre familles, avec leur pictogramme au trait — module 5. */
export const FAMILLES = [
  { nom: "Lifestyle", meta: "Le plus demandé",
    d: "M5 27 h25 a4 4 0 0 0 0-8 l-8-2 -5-6 a2 2 0 0 0-3 0 l-2 5 -6 3 a4 4 0 0 0-3 4 z M14 19 l4 4" },
  { nom: "Running", meta: "Route et piste",
    d: "M8 13 l7 7 -7 7 M19 13 l7 7 -7 7 M30 13 l4 7 -4 7" },
  { nom: "Basket", meta: "Salle et bitume",
    d: "M9 9 h22 M14 9 v6 a6 6 0 0 0 12 0 V9 M20 21 v10" },
  { nom: "Skate", meta: "Semelle plate",
    d: "M5 23 c0-3 3-5 7-5 h16 c4 0 7 2 7 5 z M11 23 v5 M29 23 v5" },
];

/** Les trois temps du parcours — module 7. */
export const ETAPES = [
  { n: "01", t: "Tu choisis", d: "Le catalogue filtré par pointure et par coloris." },
  { n: "02", t: "Tu écris", d: "Un message déjà rédigé, tu n'as qu'à l'envoyer." },
  { n: "03", t: "On répond", d: "Prix, disponibilité, et où passer à Akwa." },
];

/** Le message pré-écrit qui se frappe au module 8. */
export const MESSAGE_DEMO = ["Nike Air Max 90", "Pointure 43", "Blanc / Gris"];
