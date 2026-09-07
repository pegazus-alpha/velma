import type { Metadata } from "next";

/* ⚠️ `noindex` n'est PAS une protection : il empêche l'indexation, pas l'accès.
   La protection réelle est l'appel à `sessionActive()` en tête de CHAQUE page
   et de CHAQUE action serveur (`produits/page.tsx`, `produits/[id]/page.tsx`).

   Pourquoi pas un layout protégé, qui serait plus court ? Parce qu'un layout
   ne s'exécute pas devant une action serveur : celle-ci est une URL à part
   entière, appelable directement. Un garde placé ici seul laisserait
   `sauvegarder` et `basculer` ouverts. Toute page ajoutée sous `/admin` doit
   donc reprendre ce contrôle. */
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-papier">{children}</div>;
}
