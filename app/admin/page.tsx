import { redirect } from "next/navigation";
import { adminConfigure, ouvrirSession, sessionActive, verifierMotDePasse } from "@/lib/session";
import { config } from "@/lib/config";

/**
 * Connexion au back-office — `/admin`, § 4.3.
 *
 * Aucun JavaScript client : un `<form>` et une action serveur.
 */

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  if (await sessionActive()) redirect("/admin/produits");

  const sp = await searchParams;
  const erreur = typeof sp.erreur === "string" ? sp.erreur : undefined;
  const configure = adminConfigure();

  async function connecter(donnees: FormData) {
    "use server";
    const email = String(donnees.get("email") ?? "").trim().toLowerCase();
    const motDePasse = String(donnees.get("motdepasse") ?? "");

    const attenduEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const attenduHash = process.env.ADMIN_MOT_DE_PASSE_HASH ?? "";
    if (!attenduEmail || !attenduHash) redirect("/admin?erreur=nonconfigure");

    /* On vérifie le mot de passe MÊME si l'e-mail ne correspond pas : sans
       cela, le temps de réponse dirait si l'adresse existe. */
    const bonMotDePasse = await verifierMotDePasse(motDePasse, attenduHash);
    if (email !== attenduEmail || !bonMotDePasse) redirect("/admin?erreur=identifiants");

    await ouvrirSession(email);
    redirect("/admin/produits");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="flex items-center gap-3 text-[11px] tracking-[.22em] text-accent uppercase">
        <span className="block h-px w-10 bg-accent" />
        {config.nom} — administration
      </p>
      <h1 className="titre mt-5 text-[2.2rem]">Connexion</h1>

      {!configure && (
        /* ⚠️ § 4.7 : `ADMIN_EMAIL` est attendu du client, `ADMIN_MOT_DE_PASSE_HASH`
           et `SESSION_SECRET` sont générés par nous. Tant qu'ils manquent, la
           connexion ne peut pas fonctionner — autant le dire clairement plutôt
           que de renvoyer « identifiants incorrects » indéfiniment. */
        <div className="mt-6 rounded-bloc border border-dashed border-accent/50 bg-accent/[.04] p-5">
          <p className="text-[11px] font-bold tracking-[.18em] text-accent uppercase">
            ⚠ Back-office non configuré
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-surClair">
            Il manque {" "}
            {[
              !process.env.ADMIN_EMAIL && "ADMIN_EMAIL",
              !process.env.ADMIN_MOT_DE_PASSE_HASH && "ADMIN_MOT_DE_PASSE_HASH",
              !process.env.SESSION_SECRET && "SESSION_SECRET",
            ].filter(Boolean).join(", ")}
            . Lancer <code className="font-semibold">npm run creer-admin</code> pour
            générer l&apos;empreinte et le secret.
          </p>
        </div>
      )}

      {erreur && (
        <p role="alert" className="mt-6 rounded-bloc border border-accent bg-accent/[.06] px-4 py-3 text-[14px] text-surClair">
          {erreur === "nonconfigure"
            ? "Le back-office n'est pas encore configuré."
            : "Adresse ou mot de passe incorrect."}
        </p>
      )}

      <form action={connecter} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="text-[12px] tracking-[.16em] text-neutre uppercase">
            Adresse e-mail
          </label>
          <input
            id="email" name="email" type="email" required autoComplete="username"
            className="mt-2 w-full rounded-bloc border border-liseret bg-white px-4 py-3 text-[15px] outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="motdepasse" className="text-[12px] tracking-[.16em] text-neutre uppercase">
            Mot de passe
          </label>
          <input
            id="motdepasse" name="motdepasse" type="password" required autoComplete="current-password"
            className="mt-2 w-full rounded-bloc border border-liseret bg-white px-4 py-3 text-[15px] outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-accent py-4 text-[13px] font-bold tracking-wider text-white uppercase transition duration-150 hover:brightness-110"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
