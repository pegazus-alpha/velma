import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import { config } from "@/lib/config";
import { partage } from "@/lib/meta";
import "./globals.css";

/* § 3.2 : deux familles, pas davantage. Anton en graisse unique, Inter en
   variable. `next/font` les sert depuis notre domaine — aucun appel à Google
   au chargement, ce qui compte sur la 4G de Douala. */
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--police-titre",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--police-texte",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(config.url),
  title: {
    default: `${config.nom} — Baskets et sneakers à Douala`,
    template: `%s — ${config.nom}`,
  },
  description:
    "Baskets et sneakers à Douala, du 38 au 46. Tu choisis ton modèle, ta pointure, ta couleur. On parle prix sur WhatsApp. Boutique à Akwa.",
  openGraph: partage({
    title: `${config.nom} — Baskets et sneakers à Douala`,
    description:
      "Baskets et sneakers à Douala, du 38 au 46. Tu choisis ton modèle, ta pointure, ta couleur. On parle prix sur WhatsApp. Boutique à Akwa.",
    url: "/",
  }),
  /* Le lien se partage surtout dans une conversation WhatsApp (§ 2.1) : la
     grande vignette est ce qui s'y affiche. */
  twitter: { card: "summary_large_image" },
};

/** Grain du papier — SVG inline, aucune requête réseau.
 *  ⚠️ `width`/`height` explicites : un SVG absolu sans dimensions retombe sur
 *  sa taille intrinsèque de 300×150 et ne couvre qu'un coin de l'écran. */
function Grain() {
  return (
    <svg id="grain" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
      <filter id="fgrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.18" />
          <feFuncG type="linear" slope="0.18" />
          <feFuncB type="linear" slope="0.18" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#fgrain)" opacity="0.5" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable}`}>
      <body className="font-texte">
        <Grain />
        {children}
      </body>
    </html>
  );
}
