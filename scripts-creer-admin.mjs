/* Génère l'empreinte du mot de passe administrateur et le secret de session.
   Lancer : npm run creer-admin -- "le-mot-de-passe"

   § 4.7 : `ADMIN_MOT_DE_PASSE_HASH` et `SESSION_SECRET` sont générés par nous,
   le mot de passe étant transmis au client. `ADMIN_EMAIL` vient du CLIENT. */

import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const motDePasse = process.argv[2];
if (!motDePasse) {
  console.error('Usage : npm run creer-admin -- "le-mot-de-passe"');
  process.exit(1);
}
if (motDePasse.length < 12) {
  console.error("Mot de passe trop court : 12 caracteres au minimum.");
  process.exit(1);
}

const sel = randomBytes(16);
const cle = await scryptAsync(motDePasse, sel, 64);

console.log("");
console.log("  A reporter dans .env.local (et chez l'hebergeur) :");
console.log("");
console.log("ADMIN_MOT_DE_PASSE_HASH=" + sel.toString("hex") + ":" + cle.toString("hex"));
console.log("SESSION_SECRET=" + randomBytes(32).toString("hex"));
console.log("");
console.log("  Il manque encore ADMIN_EMAIL : c'est au CLIENT de le fournir (§ 4.7).");
console.log("  Transmettre le mot de passe au client par un canal distinct.");
console.log("");
