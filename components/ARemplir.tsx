/**
 * Bloc de contenu qui attend le client.
 *
 * ⚠️ Il est VISIBLE, délibérément, y compris en production. Le § 3.5 est
 * explicite : mentions légales, fourchettes de prix, conditions de livraison
 * et de retour ne sont pas rédigées par nous. Publier une page avec un encadré
 * « à remplir » est sans commune mesure avec publier un texte inventé — qui
 * serait faux, publié, et engagerait le client.
 *
 * `gabarit` et `motsCles` sont des notes de travail : ils ne sont rendus QU'EN
 * DÉVELOPPEMENT. Publiés, ils exposeraient au visiteur des renvois au dossier de
 * projet et une liste de mots-clés — exactement le bourrage que le § 4.3 proscrit.
 *
 * Chaque bloc porte `data-a-remplir` ; `npm run textes-manquants` les recense en
 * relisant le code source.
 */
export function ARemplir({
  quoi,
  gabarit,
  motsCles,
}: {
  quoi: string;
  gabarit?: string;
  motsCles?: string;
}) {
  const enDev = process.env.NODE_ENV !== "production";
  return (
    <div
      data-a-remplir={quoi}
      className="my-6 rounded-bloc border border-dashed border-accent/50 bg-accent/[.04] p-5"
    >
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-[.18em] text-accent uppercase">
        <span aria-hidden>⚠</span> Contenu à fournir par le client
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-surClair">{quoi}</p>
      {enDev && gabarit && (
        <p className="mt-3 border-l-2 border-liseret pl-3 text-[14px] leading-relaxed text-neutre italic">
          {gabarit}
        </p>
      )}
      {enDev && motsCles && (
        <p className="mt-3 text-[12px] text-neutre">
          Porte le ou les mots-clés : <span className="font-semibold">{motsCles}</span>
        </p>
      )}
    </div>
  );
}
