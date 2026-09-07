import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

/**
 * Authentification de l'administrateur — § 4.4 et § 4.7.
 *
 * **Un cookie signé, pas de table `sessions`** : le § 4.4 le dit explicitement,
 * un unique administrateur ne justifie pas davantage.
 *
 * ⚠️ **Écart au § 4.4, à acter.** Celui-ci prescrit « argon2 ou bcrypt ». J'ai
 * retenu **scrypt**, qui est dans `node:crypto` : même famille de fonctions
 * lentes et coûteuses en mémoire, mais **zéro dépendance et aucune compilation
 * native**. Ajouter une brique pour une seule connexion irait contre la ligne
 * du § 4.4 lui-même, qui refuse les tables `categories` et `sessions` pour
 * cette raison. À confirmer, ou je bascule sur bcrypt.
 */

const scryptAsync = promisify(scrypt);
const NOM_COOKIE = "velma_admin";
const DUREE = 60 * 60 * 12; // 12 h

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET manquant — voir § 4.7.");
  return s;
}

/** `sel:empreinte`, tous deux en hexadécimal. */
export async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const cle = (await scryptAsync(motDePasse, sel, 64)) as Buffer;
  return `${sel.toString("hex")}:${cle.toString("hex")}`;
}

export async function verifierMotDePasse(motDePasse: string, stocke: string): Promise<boolean> {
  const [selHex, cleHex] = stocke.split(":");
  if (!selHex || !cleHex) return false;
  const attendu = Buffer.from(cleHex, "hex");
  const calcule = (await scryptAsync(motDePasse, Buffer.from(selHex, "hex"), attendu.length)) as Buffer;
  /* Comparaison à temps constant : une comparaison naïve fuirait le nombre
     d'octets corrects par le temps de réponse. */
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

function signer(charge: string): string {
  return createHmac("sha256", secret()).update(charge).digest("hex");
}

export async function ouvrirSession(email: string) {
  const expire = Date.now() + DUREE * 1000;
  const charge = `${email}|${expire}`;
  const jeton = `${Buffer.from(charge).toString("base64url")}.${signer(charge)}`;
  (await cookies()).set(NOM_COOKIE, jeton, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DUREE,
  });
}

export async function fermerSession() {
  (await cookies()).delete(NOM_COOKIE);
}

/** Renvoie l'e-mail si la session est valide, sinon `null`. */
export async function sessionActive(): Promise<string | null> {
  const jeton = (await cookies()).get(NOM_COOKIE)?.value;
  if (!jeton) return null;

  const [chargeB64, signature] = jeton.split(".");
  if (!chargeB64 || !signature) return null;

  const charge = Buffer.from(chargeB64, "base64url").toString();
  const attendue = Buffer.from(signer(charge));
  const fournie = Buffer.from(signature);
  if (attendue.length !== fournie.length || !timingSafeEqual(attendue, fournie)) return null;

  const [email, expire] = charge.split("|");
  if (!email || Number(expire) < Date.now()) return null;
  return email;
}

/** Le back-office est-il configurable ? `ADMIN_EMAIL` est attendu du client. */
export function adminConfigure(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_MOT_DE_PASSE_HASH && process.env.SESSION_SECRET);
}
