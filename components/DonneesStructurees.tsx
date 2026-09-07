/**
 * Un bloc JSON-LD — § 4.3.
 *
 * Composant serveur : le `<script type="application/ld+json">` n'est pas du
 * JavaScript exécutable, il ne compte pas dans le budget du § 4.2.
 *
 * ⚠️ `<` est échappé. Les noms et descriptions viennent du back-office, donc
 * d'une saisie : sans cet échappement, un `</script>` dans un nom de produit
 * fermerait la balise et injecterait du HTML dans la page.
 */
export function DonneesStructurees({ donnees }: { donnees: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(donnees).replace(/</g, "\\u003c"),
      }}
    />
  );
}
