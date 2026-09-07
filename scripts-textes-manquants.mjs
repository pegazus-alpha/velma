/* Recense les blocs `ARemplir` du site : ce que le client doit encore fournir.
   Bloquant pour la mise en ligne (§ 3.4, § 3.5). Lancer : npm run textes-manquants */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const trouves = [];

function parcourir(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      parcourir(p);
      continue;
    }
    if (!p.endsWith(".tsx") && !p.endsWith(".ts")) continue;
    const src = readFileSync(p, "utf8");
    for (const m of src.matchAll(/quoi=\{?"([^"]+)"/g)) {
      trouves.push({ fichier: p, quoi: m[1] });
    }
  }
}

parcourir("app");

if (!trouves.length) {
  console.log("Aucun contenu en attente.");
  process.exit(0);
}

console.log("");
console.log(trouves.length + " contenus attendent le client :");
console.log("");
let courant = "";
for (const t of trouves) {
  if (t.fichier !== courant) {
    courant = t.fichier;
    console.log("  " + courant);
  }
  console.log("    - " + t.quoi);
}
console.log("");
console.log("Bloquant pour la mise en ligne. Voir PROJET.md § 3.4 et § 3.5.");
console.log("");

/* `npm run pret-pour-la-ligne` sort en erreur tant qu'il reste des encadrés :
   à brancher sur le déploiement. Sans ce garde, `npm run build` réussit et
   publierait des mentions légales vides — le § 3.5 l'interdit formellement. */
if (process.argv.includes("--bloquant")) {
  console.error("Mise en ligne refusee : " + trouves.length + " contenus manquent encore.");
  process.exit(1);
}
