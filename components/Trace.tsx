/**
 * Le trait de crayon posé sous un mot.
 *
 * ⚠️ Géométrie reprise TELLE QUELLE de la maquette validée en phase 5
 * (`design/accueil.html`) : même viewBox, même chemin, même épaisseur. Ne pas
 * la redessiner — elle a été validée.
 *
 * Seul le mécanisme d'animation diffère : `pathLength="1"` normalise la
 * longueur du tracé, ce qui permet de l'animer sans `getTotalLength()`. Cette
 * fonction renvoie 0 tant que le SVG n'est pas mis en page, et le trait
 * apparaissait alors d'un bloc au lieu de se tracer. Aucun effet visuel.
 *
 * `auto` : le tracé se joue tout seul, en CSS, sur les pages de contenu — qui
 * ne chargent aucune bibliothèque d'animation (§ 1.4-2).
 */
export function Trace({ auto = false }: { auto?: boolean }) {
  return (
    <svg
      className={`trace${auto ? " auto" : ""}`}
      viewBox="0 0 300 18"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <path pathLength="1" d="M4 12 C 60 4, 118 16, 175 8 S 268 6, 296 11" />
    </svg>
  );
}
